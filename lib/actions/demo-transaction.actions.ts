"use server";

import { Query, ID } from "node-appwrite";
import { createAdminClient } from "../appwrite";

const { APPWRITE_DATABASE_ID, APPWRITE_DEMO_TRANSACTION_COLLECTION_ID } =
  process.env;

// categories use plaid's personal_finance_category values; amounts in BDT, kept
// in a tight band (~100-3500) so no one category dominates the charts
const sampleTransactions = [
  ["Shwapno", "GENERAL MERCHANDISE", "debit", [300, 1600]],
  ["Meena Bazar", "GENERAL MERCHANDISE", "debit", [400, 1800]],
  ["Agora", "GENERAL MERCHANDISE", "debit", [350, 1700]],
  ["Daraz", "GENERAL MERCHANDISE", "debit", [500, 2000]],

  ["Sultan's Dine", "FOOD AND DRINK", "debit", [300, 1400]],
  ["Star Kabab", "FOOD AND DRINK", "debit", [150, 700]],
  ["Kacchi Bhai", "FOOD AND DRINK", "debit", [300, 1200]],
  ["Chillox", "FOOD AND DRINK", "debit", [250, 900]],
  ["North End Coffee", "FOOD AND DRINK", "debit", [200, 600]],

  ["Pathao Ride", "TRANSPORTATION", "debit", [80, 500]],
  ["Uber Dhaka", "TRANSPORTATION", "debit", [120, 600]],
  ["CNG Fare", "TRANSPORTATION", "debit", [60, 350]],
  ["Padma Fuel Station", "TRANSPORTATION", "debit", [500, 1500]],

  ["DESCO Electricity", "BILLS", "debit", [700, 2200]],
  ["Titas Gas", "BILLS", "debit", [600, 1100]],
  ["WASA Water", "BILLS", "debit", [300, 700]],
  ["Link3 Internet", "BILLS", "debit", [800, 1400]],

  ["Aarong", "SHOPPING", "debit", [700, 2500]],
  ["Bata Shoes", "SHOPPING", "debit", [500, 1800]],
  ["Yellow Clothing", "SHOPPING", "debit", [600, 2200]],

  ["Green Line Bus", "TRAVEL", "debit", [800, 1800]],
  ["Biman Bangladesh", "TRAVEL", "debit", [2000, 3500]],
  ["Cox's Bazar Hotel", "TRAVEL", "debit", [1500, 3000]],

  ["Remittance", "INCOME", "credit", [3000, 15000]],
];

export const generateDemoTransactions = async (bankId: string) => {
  const { database } = await createAdminClient();

  const today = new Date();

  // build all rows first, then write concurrently to avoid ~40-70 sequential writes
  const rows: Record<string, unknown>[] = [];

  // monthly salary for the last 6 months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const baseDate = new Date(today);

    baseDate.setMonth(today.getMonth() - monthOffset);

    const salaryDate = new Date(baseDate);
    salaryDate.setDate(1);

    rows.push({
      bankId,
      name: "Salary",
      amount: Math.floor(Math.random() * 10000) + 10000,
      category: "INCOME",
      type: "credit",
      date: salaryDate.toISOString(),
    });
  }

  // random transactions
  const randomTransactionCount = Math.floor(Math.random() * 35) + 30;

  for (let i = 0; i < randomTransactionCount; i++) {
    const randomTx =
      sampleTransactions[Math.floor(Math.random() * sampleTransactions.length)];

    const [name, category, type, range] = randomTx;

    const [min, max] = range as number[];

    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    const randomDate = new Date();

    const monthOffset = Math.floor(Math.random() * 6);

    randomDate.setMonth(today.getMonth() - monthOffset);

    // current month: don't go past today
    const maxDay = monthOffset === 0 ? today.getDate() : 28;

    randomDate.setDate(Math.floor(Math.random() * maxDay) + 1);

    rows.push({
      bankId,
      name,
      amount,
      category,
      type,
      date: randomDate.toISOString(),
    });
  }

  await Promise.all(
    rows.map((data) =>
      database.createDocument(
        APPWRITE_DATABASE_ID!,
        APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
        ID.unique(),
        data,
      ),
    ),
  );
};

export const getDemoTransactions = async (bankId: string) => {
  try {
    const { database } = await createAdminClient();

    const transactions = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
      [Query.equal("bankId", [bankId]), Query.limit(100)],
    );

    return transactions.documents;
  } catch (error) {
    console.log(error);
  }
};

export const createDemoTransaction = async ({
  bankId,
  name,
  amount,
  category,
  type,
  date,
}: {
  bankId: string;
  name: string;
  amount: number;
  category: string;
  type: "credit" | "debit";
  date: string;
}) => {
  const { database } = await createAdminClient();

  return await database.createDocument(
    APPWRITE_DATABASE_ID!,
    APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
    ID.unique(),
    {
      bankId,
      name,
      amount,
      category,
      type,
      date,
    },
  );
};

export const deleteDemoTransactionsByBankId = async (bankId: string) => {
  try {
    const { database } = await createAdminClient();

    const transactions = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
      [Query.equal("bankId", [bankId]), Query.limit(100)],
    );

    await Promise.all(
      transactions.documents.map((doc) =>
        database.deleteDocument(
          APPWRITE_DATABASE_ID!,
          APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
          doc.$id,
        ),
      ),
    );
  } catch (error) {
    console.log(error);
  }
};
