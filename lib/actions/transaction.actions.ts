"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async (
  transaction: CreateTransactionProps,
) => {
  // console.log("TRANSACTION OBJECT:", transaction);
  // console.log("senderId:", transaction.senderId);
  // console.log("receiverId:", transaction.receiverId);

  try {
    const { database } = await createAdminClient();

    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        channel: "online",
        category: "Transfer",
        ...transaction,
      },
    );

    revalidatePath("/");
    revalidatePath("/transaction-history");

    return parseStringify(newTransaction);
  } catch (error) {
    console.log(error);
  }
};

// delete transfer records involving any of the given bank ids
export const deleteTransactionsByBankIds = async (bankIds: string[]) => {
  try {
    if (bankIds.length === 0) return;

    const { database } = await createAdminClient();

    const [sent, received] = await Promise.all([
      database.listDocuments(DATABASE_ID!, TRANSACTION_COLLECTION_ID!, [
        Query.equal("senderBankId", bankIds),
        Query.limit(200),
      ]),
      database.listDocuments(DATABASE_ID!, TRANSACTION_COLLECTION_ID!, [
        Query.equal("receiverBankId", bankIds),
        Query.limit(200),
      ]),
    ]);

    const ids = Array.from(
      new Set(
        [...sent.documents, ...received.documents].map((doc) => doc.$id),
      ),
    );

    await Promise.all(
      ids.map((id) =>
        database.deleteDocument(DATABASE_ID!, TRANSACTION_COLLECTION_ID!, id),
      ),
    );
  } catch (error) {
    console.log(error);
  }
};

export const getTransactionsByBankId = async ({
  bankId,
}: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal("senderBankId", bankId)],
    );

    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal("receiverBankId", bankId)],
    );

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderTransactions.documents,
        ...receiverTransactions.documents,
      ],
    };

    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
  }
};
