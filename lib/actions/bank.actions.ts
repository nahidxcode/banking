"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";
import { getDemoTransactions } from "./demo-transaction.actions";
import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        //demo bank
        if (bank.isManual) {
          return {
            id: bank.accountId,
            availableBalance: bank.availableBalance || 0,
            currentBalance: bank.currentBalance || 0,
            institutionId: "manual",
            name: bank.bankName || "Demo Bank",
            officialName: bank.bankName || "Demo Bank",
            mask: "0000",
            type: "depository",
            subtype: "checking",
            appwriteItemId: bank.$id,
            sharableId: bank.sharableId,

            accountType: bank.accountType || "bank",
          };
        }

        // get each account info from plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        // get institution info from plaid
        const institution = await getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        });

        const account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available!,
          currentBalance: accountData.balances.current!,
          institutionId: institution.institution_id,
          name: accountData.name,
          officialName: accountData.official_name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          sharableId: bank.sharableId,
        };

        return account;
      }),
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });
    //demo bank
    // demo bank
    if (bank.isManual) {
      const [transferTransactionsData, demoTransactionsData] =
        await Promise.all([
          getTransactionsByBankId({
            bankId: bank.$id,
          }),
          getDemoTransactions(bank.$id),
        ]);

      const transferTransactions =
        transferTransactionsData.documents.map((transferData: Transaction) => ({
          id: transferData.$id,
          name: transferData.name,
          amount: Number(transferData.amount),
          date: transferData.$createdAt,
          paymentChannel: transferData.channel,
          category: transferData.category,
          type: transferData.senderBankId === bank.$id ? "debit" : "credit",
          pending: false,
          image: "",
          accountId: bank.accountId,
        })) || [];

      const demoTransactions =
        demoTransactionsData?.map((tx: any) => ({
          id: tx.$id,
          name: tx.name,
          amount: tx.amount,
          date: tx.date,
          paymentChannel:
            tx.category === "FOOD AND DRINK"
              ? "in store"
              : tx.category === "TRANSPORTATION"
                ? "mobile app"
                : "online",
          category: tx.category,
          type: tx.type,
          pending: false,
          image: "",
          accountId: bank.accountId,
        })) || [];

      const allTransactions = [
        ...transferTransactions,
        ...demoTransactions,
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return parseStringify({
        data: {
          id: bank.accountId,
          availableBalance: bank.availableBalance,
          currentBalance: bank.currentBalance,
          institutionId: "manual",
          name: bank.bankName,
          officialName: bank.bankName,
          mask: "0000",
          type: "depository",
          subtype: "checking",
          appwriteItemId: bank.$id,
        },

        transactions: allTransactions,
      });
    }

    // get account info from plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // get transfer transactions from appwrite
    const [transferTransactionsData, institution, transactions] =
      await Promise.all([
        getTransactionsByBankId({
          bankId: bank.$id,
        }),

        getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        }),

        getTransactions({
          accessToken: bank.accessToken,
        }),
      ]);

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      }),
    );

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      const data = response.data;

      transactions = response.data.added.map((transaction) => ({
        id: transaction.transaction_id,
        name: transaction.name,
        paymentChannel: transaction.payment_channel,
        type: "debit",
        accountId: transaction.account_id,
        amount: transaction.amount,
        pending: transaction.pending,
        category:
          transaction.personal_finance_category?.primary?.replace(/_/g, " ") ||
          "Other",
        date: transaction.date,
        image: transaction.logo_url,
      }));

      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};
