"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "../appwrite";
import { encryptId, parseStringify } from "../utils";
import { USD_TO_BDT } from "@/constants";
import { createDemoTransaction } from "./demo-transaction.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

// demo remittance account (Payoneer/Wise/ElevatePay), holds USD
export const createRemittanceAccount = async ({
  userId,
  provider,
  balanceUsd,
}: {
  userId: string;
  provider: string;
  balanceUsd: number;
}) => {
  try {
    const { database } = await createAdminClient();

    const existing = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId]), Query.equal("bankName", [provider])],
    );

    if (existing.total > 0) {
      throw new Error(
        `${provider} is already connected. Please choose another provider.`,
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
        bankId: `remittance-${Date.now()}`,
        accessToken: "manual",
        fundingSourceUrl: "manual",
        sharableId: encryptId(accountId),
        bankName: provider,
        currentBalance: balanceUsd,
        availableBalance: balanceUsd,
        accountType: "remittance",
        isManual: true,
      },
    );

    revalidatePath("/my-banks");

    return parseStringify(bank);
  } catch (error: any) {
    console.error("createRemittanceAccount error:", error);

    throw new Error(error?.message || "Failed to create remittance account");
  }
};

// withdraw USD from a remittance account into a demo bank/wallet, converting to
// BDT and recording it as income on the target
export const withdrawRemittance = async ({
  remittanceBankId,
  targetBankId,
  amountUsd,
}: {
  remittanceBankId: string;
  targetBankId: string;
  amountUsd: number;
}) => {
  try {
    const { database } = await createAdminClient();

    const usd = Number(amountUsd);

    if (!usd || usd <= 0) {
      return parseStringify({ success: false, message: "Enter a valid amount." });
    }

    const remittance = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      remittanceBankId,
    );

    const target = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      targetBankId,
    );

    // only demo bank/wallet accounts can receive a withdrawal
    if (!target.isManual || target.accountType === "remittance") {
      return parseStringify({
        success: false,
        message: "Select a connected bank or wallet to withdraw to.",
      });
    }

    const available = Number(remittance.currentBalance || 0);

    if (usd > available) {
      return parseStringify({
        success: false,
        message: "Amount exceeds your available balance.",
      });
    }

    const bdt = usd * USD_TO_BDT;

    // deduct USD from the remittance account
    await database.updateDocument(DATABASE_ID!, BANK_COLLECTION_ID!, remittanceBankId, {
      currentBalance: available - usd,
      availableBalance: available - usd,
    });

    // add the converted BDT to the receiving account
    const targetBalance = Number(target.currentBalance || 0);

    await database.updateDocument(DATABASE_ID!, BANK_COLLECTION_ID!, targetBankId, {
      currentBalance: targetBalance + bdt,
      availableBalance: targetBalance + bdt,
    });

    const now = new Date().toISOString();

    // log it as income on the receiving account
    await createDemoTransaction({
      bankId: target.$id,
      name: `Remittance - ${remittance.bankName}`,
      amount: bdt,
      category: "INCOME",
      type: "credit",
      date: now,
    });

    // log the outflow (USD) on the remittance account's ledger
    await createDemoTransaction({
      bankId: remittance.$id,
      name: `Withdrawal to ${target.bankName}`,
      amount: usd,
      category: "Transfer",
      type: "debit",
      date: now,
    });

    revalidatePath("/my-banks");
    revalidatePath("/");

    return parseStringify({ success: true });
  } catch (error) {
    console.error("withdrawRemittance error:", error);

    return parseStringify({ success: false, message: "Withdrawal failed." });
  }
};
