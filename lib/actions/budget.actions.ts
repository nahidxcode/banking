"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BUDGETS_COLLECTION_ID: BUDGETS_COLLECTION_ID,
} = process.env;

export const createBudget = async ({
  userId,
  category,
  monthlyLimit,
}: CreateBudgetProps) => {
  try {
    const { database } = await createAdminClient();

    // one budget per category — duplicates double-count in the overview totals
    const existing = await database.listDocuments(
      DATABASE_ID!,
      BUDGETS_COLLECTION_ID!,
      [Query.equal("userId", [userId]), Query.equal("category", [category])],
    );

    if (existing.total > 0) {
      throw new Error(`A budget for ${category} already exists.`);
    }

    const budget = await database.createDocument(
      DATABASE_ID!,
      BUDGETS_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        category,
        monthlyLimit,
      },
    );

    return parseStringify(budget);
  } catch (error: any) {
    console.log(error);

    throw new Error(error?.message || "Failed to create budget");
  }
};

export const getBudgets = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    const budgets = await database.listDocuments(
      DATABASE_ID!,
      BUDGETS_COLLECTION_ID!,
      [Query.equal("userId", [userId])],
    );

    return parseStringify(budgets.documents);
  } catch (error) {
    console.log(error);
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    const { database } = await createAdminClient();

    await database.deleteDocument(
      DATABASE_ID!,
      BUDGETS_COLLECTION_ID!,
      budgetId,
    );

    return { success: true };
  } catch (error) {
    console.log(error);

    return { success: false };
  }
};
