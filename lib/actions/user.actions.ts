"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";

import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import { SessionUnavailableError } from "../errors";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { deleteDemoTransactionsByBankId } from "./demo-transaction.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal("userId", [userId])],
    );

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });

    return parseStringify(user);
  } catch (error) {
    console.error("Error", error);
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;

  // Bangladesh signup doesn't collect SSN/state, but the Appwrite users
  // collection requires them and the Dwolla (US sandbox) customer needs a valid
  // SSN + 2-letter state — fill safe placeholders so both keep working.
  const compliance = {
    ssn: userData.ssn || "1234",
    state: userData.state || "NY",
  };

  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`,
    );

    if (!newUserAccount) throw new Error("Error creating user");

    // Dwolla (US sandbox) validates US-format fields; a Bangladeshi postal code
    // isn't a valid US ZIP, so send a placeholder ZIP to Dwolla while still
    // storing the user's real postal code in our own DB below.
    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      ...compliance,
      postalCode: "10001",
      type: "personal",
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        ...compliance,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      },
    );

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error", error);
  }
};

// A transient network problem talking to Appwrite — distinct from a genuine
// "not signed in" (no/invalid session) response. node's fetch surfaces these
// either as an error `code` or, when wrapped, on `error.cause.code`.
function isTransientNetworkError(error: unknown): boolean {
  const transientCodes = new Set([
    "UND_ERR_CONNECT_TIMEOUT",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_SOCKET",
  ]);

  const err = error as { code?: unknown; message?: unknown; cause?: { code?: unknown } };
  const code = typeof err?.code === "string" ? err.code : err?.cause?.code;
  if (typeof code === "string" && transientCodes.has(code)) return true;

  // Undici often only says "fetch failed" with the real reason on `cause`.
  return typeof err?.message === "string" && err.message.includes("fetch failed");
}

export async function getLoggedInUser() {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { account } = await createSessionClient();
      const result = await account.get();

      const user = await getUserInfo({ userId: result.$id });

      return parseStringify(user);
    } catch (error) {
      lastError = error;

      // Genuine auth failure (no/invalid/expired session) -> the user really is
      // logged out. Return null so the caller redirects to sign-in.
      if (!isTransientNetworkError(error)) {
        console.log(error);
        return null;
      }

      // Transient network blip -> brief backoff and retry instead of pretending
      // the session is gone.
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }

  // Couldn't reach Appwrite at all. Don't log the user out — signal an
  // infrastructure error so the route can show a retry instead of sign-in.
  console.error("getLoggedInUser: auth service unreachable", lastError);
  throw new SessionUnavailableError(lastError);
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    cookies().delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth", "transactions", "transfer"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.log(error);
  }
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        sharableId,
      },
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.log(error);
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    // swap public token for access token + item id
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // get account info from plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    // create a dwolla processor token
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse =
      await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    // create the dwolla funding source
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw Error;

    // save the bank account
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("An error occurred while creating exchanging token:", error);
  }
};

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId])],
    );

    return parseStringify(banks.documents);
  } catch (error) {
    console.log(error);
  }
};

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      documentId,
    );

    return parseStringify(bank);
  } catch (error) {
    console.log(error);
  }
};

export const getBankByAccountId = async ({
  accountId,
}: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("accountId", [accountId])],
    );

    if (bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

export const deleteBank = async ({ documentId }: { documentId: string }) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      documentId,
    );

    // real plaid bank: try to revoke the item, but don't fail the delete if it errors
    if (!bank.isManual && bank.accessToken && bank.accessToken !== "manual") {
      try {
        await plaidClient.itemRemove({ access_token: bank.accessToken });
      } catch (err) {
        console.error("Plaid itemRemove failed (continuing with delete):", err);
      }
    }

    // demo bank: clean up its generated transactions
    if (bank.isManual) {
      await deleteDemoTransactionsByBankId(bank.$id);
    }

    await database.deleteDocument(DATABASE_ID!, BANK_COLLECTION_ID!, documentId);

    revalidatePath("/my-banks");
    revalidatePath("/");

    return parseStringify({ success: true });
  } catch (error) {
    console.error("An error occurred while deleting the bank:", error);

    return parseStringify({ success: false });
  }
};

export const updateBankBalance = async ({
  bankId,
  currentBalance,
}: {
  bankId: string;
  currentBalance: number;
}) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.updateDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      bankId,
      {
        currentBalance,
        availableBalance: currentBalance,
      },
    );

    revalidatePath("/");
    revalidatePath("/my-banks");
    revalidatePath("/transaction-history");

    return parseStringify(bank);
  } catch (error) {
    console.log(error);
  }
};
