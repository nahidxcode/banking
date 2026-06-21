"use server";

import { ID, Query } from "node-appwrite";

import { createAdminClient } from "../appwrite";
import { encryptId, parseStringify } from "../utils";
import { generateDemoTransactions } from "./demo-transaction.actions";

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

    // Generate demo transactions automatically
    await generateDemoTransactions(bank.$id);

    return parseStringify(bank);
  } catch (error: any) {
    console.error("createDemoBank error:", error);

    throw new Error(error?.message || "Failed to create demo bank");
  }
};
