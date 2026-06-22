"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_GOALS_COLLECTION_ID: GOALS_COLLECTION_ID,
} = process.env;

export const createGoal = async ({
  userId,
  title,
  targetAmount,
  deadline,
}: {
  userId: string;
  title: string;
  targetAmount: number;
  deadline: string;
}) => {
  try {
    const { database } = await createAdminClient();

    const goal = await database.createDocument(
      DATABASE_ID!,
      GOALS_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        title,
        targetAmount,
        savedAmount: 0,
        deadline,
      },
    );

    return parseStringify(goal);
  } catch (error) {
    console.log(error);
  }
};

export const getGoals = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    const goals = await database.listDocuments(
      DATABASE_ID!,
      GOALS_COLLECTION_ID!,
      [Query.equal("userId", [userId])],
    );

    return parseStringify(goals.documents);
  } catch (error) {
    console.log(error);
  }
};

export const deleteGoal = async (goalId: string) => {
  try {
    const { database } = await createAdminClient();

    await database.deleteDocument(DATABASE_ID!, GOALS_COLLECTION_ID!, goalId);

    return { success: true };
  } catch (error) {
    console.log(error);

    return { success: false };
  }
};

export const updateGoalProgress = async (goalId: string, amount: number) => {
  try {
    const { database } = await createAdminClient();

    const goal = await database.getDocument(
      DATABASE_ID!,
      GOALS_COLLECTION_ID!,
      goalId,
    );

    const updated = await database.updateDocument(
      DATABASE_ID!,
      GOALS_COLLECTION_ID!,
      goalId,
      {
        savedAmount: goal.savedAmount + amount,
      },
    );

    return parseStringify(updated);
  } catch (error) {
    console.log(error);
  }
};
export const addGoalContribution = async (goalId: string, amount: number) => {
  try {
    const { database } = await createAdminClient();

    const goal = await database.getDocument(
      DATABASE_ID!,
      GOALS_COLLECTION_ID!,
      goalId,
    );

    const updatedGoal = await database.updateDocument(
      DATABASE_ID!,
      GOALS_COLLECTION_ID!,
      goalId,
      {
        savedAmount: Number(goal.savedAmount) + Number(amount),
      },
    );

    return parseStringify(updatedGoal);
  } catch (error) {
    console.log(error);
  }
};
