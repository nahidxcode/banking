"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "../appwrite";
import { encryptId, parseStringify } from "../utils";
import { getBanks } from "./user.actions";
import { deleteTransactionsByBankIds } from "./transaction.actions";
import {
  generateDemoTransactions,
  deleteDemoTransactionsByBankId,
} from "./demo-transaction.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const createDemoBank = async ({
  userId,
  bankName,
  balance,
  accountType,
}: {
  userId: string;
  bankName: string;
  balance: number;
  accountType: "bank" | "mfs";
}) => {
  try {
    const { database } = await createAdminClient();

    const existingProvider = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId]), Query.equal("bankName", [bankName])],
    );

    if (existingProvider.total > 0) {
      throw new Error(
        `${bankName} is already connected. Please choose another provider.`,
      );
    }

    const accountId = ID.unique();

    const bank = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,

        accountId,
        bankId: `manual-${Date.now()}`,
        accessToken: "manual",
        fundingSourceUrl: "manual",

        sharableId: encryptId(accountId),

        bankName,
        currentBalance: balance,
        availableBalance: balance,
        accountType,
        isManual: true,
      },
    );

    // seed demo transactions
    await generateDemoTransactions(bank.$id);

    return parseStringify(bank);
  } catch (error: any) {
    console.error("createDemoBank error:", error);

    throw new Error(error?.message || "Failed to create demo bank");
  }
};

// reset balance + regenerate transactions for every demo account (plaid banks skipped)
export const regenerateUserDemoData = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    const banks = await getBanks({ userId });

    const demoBanks: Bank[] = (banks || []).filter((b: Bank) => b.isManual);

    // clear transfers involving these demo accounts
    await deleteTransactionsByBankIds(demoBanks.map((b) => b.$id));

    for (const bank of demoBanks) {
      // clear generated transactions / withdrawals
      await deleteDemoTransactionsByBankId(bank.$id);

      if (bank.accountType === "remittance") {
        // usd wallet, just reset balance, no spending
        const balance = Math.floor(Math.random() * (2000 - 200)) + 200;

        await database.updateDocument(DATABASE_ID!, BANK_COLLECTION_ID!, bank.$id, {
          currentBalance: balance,
          availableBalance: balance,
        });
      } else {
        // bank/wallet: fresh BDT balance + transactions (same ranges as first connect)
        const balance =
          bank.accountType === "mfs"
            ? Math.floor(Math.random() * (12000 - 3000)) + 3000
            : Math.floor(Math.random() * (15000 - 5000)) + 5000;

        await database.updateDocument(DATABASE_ID!, BANK_COLLECTION_ID!, bank.$id, {
          currentBalance: balance,
          availableBalance: balance,
        });

        await generateDemoTransactions(bank.$id);
      }
    }

    revalidatePath("/");
    revalidatePath("/my-banks");
    revalidatePath("/transaction-history");
    revalidatePath("/financial-insights");
    revalidatePath("/monthly-analytics");
    revalidatePath("/budget-planner");

    return parseStringify({ success: true, count: demoBanks.length });
  } catch (error: any) {
    console.error("regenerateUserDemoData error:", error);

    return parseStringify({ success: false });
  }
};
