"use client";

import { useState } from "react";
import { createBudget } from "@/lib/actions/budget.actions";

const categories = [
  "FOOD AND DRINK",
  "GENERAL MERCHANDISE",
  "TRANSPORTATION",
  "BILLS",
  "SHOPPING",
  "TRAVEL",
];

const BudgetForm = ({ userId }: { userId: string }) => {
  const [category, setCategory] = useState(categories[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createBudget({
      userId,
      category,
      monthlyLimit: Number(monthlyLimit),
    });

    window.location.reload();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-5 dark:border-gray-700">
      <h2 className="mb-1 text-xl font-bold dark:text-white">
        Create Monthly Budget
      </h2>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Set a spending limit for a category and track your progress.
      </p>

      <div className="grid gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border bg-transparent p-3 dark:border-gray-600 dark:text-white">
          {categories.map((item) => (
            <option
              key={item}
              value={item}
              className="bg-white text-black dark:bg-slate-900 dark:text-white">
              {item}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Monthly Budget Amount"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          className="rounded-lg border bg-transparent p-3 dark:border-gray-600"
          required
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 py-3 font-semibold text-white">
          Create Budget
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
