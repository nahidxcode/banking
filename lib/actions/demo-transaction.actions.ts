"use server";

import { Query, ID } from "node-appwrite";
import { createAdminClient } from "../appwrite";

const { APPWRITE_DATABASE_ID, APPWRITE_DEMO_TRANSACTION_COLLECTION_ID } =
  process.env;

const sampleTransactions = [
  ["Amazon", "GENERAL MERCHANDISE", "debit", [40, 160]],
  ["Walmart", "GENERAL MERCHANDISE", "debit", [30, 140]],
  ["Target", "GENERAL MERCHANDISE", "debit", [25, 120]],

  ["McDonald's", "FOOD AND DRINK", "debit", [40, 110]],
  ["Starbucks", "FOOD AND DRINK", "debit", [30, 150]],
  ["Pizza Hut", "FOOD AND DRINK", "debit", [45, 120]],
  ["KFC", "FOOD AND DRINK", "debit", [30, 105]],

  ["Uber", "TRANSPORTATION", "debit", [30, 95]],
  ["Shell Gas", "TRANSPORTATION", "debit", [60, 120]],
  ["Fuel Station", "TRANSPORTATION", "debit", [70, 150]],

  ["Electric Bill", "BILLS", "debit", [50, 120]],
  ["Internet Bill", "BILLS", "debit", [50, 90]],
  ["Water Bill", "BILLS", "debit", [50, 60]],

  ["Best Buy", "SHOPPING", "debit", [50, 250]],
  ["Fashion Store", "SHOPPING", "debit", [40, 280]],

  ["Booking.com", "TRAVEL", "debit", [120, 250]],
  ["Airline Ticket", "TRAVEL", "debit", [100, 350]],

  ["Freelance Payment", "INCOME", "credit", [100, 800]],
];

export const generateDemoTransactions = async (bankId: string) => {
  const { database } = await createAdminClient();

  const today = new Date();

  // RECURRING MONTHLY TRANSACTIONS
  // Salary every month
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const baseDate = new Date(today);

    baseDate.setMonth(today.getMonth() - monthOffset);

    const salaryDate = new Date(baseDate);
    salaryDate.setDate(1);

    await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        bankId,
        name: "Salary",
        amount: Math.floor(Math.random() * 1000) + 1000,
        category: "INCOME",
        type: "credit",
        date: salaryDate.toISOString(),
      },
    );
  }

  // RANDOM TRANSACTIONS
  const randomTransactionCount = Math.floor(Math.random() * 35) + 30;

  for (let i = 0; i < randomTransactionCount; i++) {
    const randomTx =
      sampleTransactions[Math.floor(Math.random() * sampleTransactions.length)];

    const [name, category, type, range] = randomTx;

    const [min, max] = range as number[];

    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    const randomDate = new Date();

    randomDate.setMonth(randomDate.getMonth() - Math.floor(Math.random() * 6));

    randomDate.setDate(Math.floor(Math.random() * 28) + 1);

    await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        bankId,
        name,
        amount,
        category,
        type,
        date: randomDate.toISOString(),
      },
    );
  }
};

export const getDemoTransactions = async (bankId: string) => {
  try {
    const { database } = await createAdminClient();

    const transactions = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_DEMO_TRANSACTION_COLLECTION_ID!,
      [Query.equal("bankId", [bankId])],
    );

    return transactions.documents;
  } catch (error) {
    console.log(error);
  }
};
