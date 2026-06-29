"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createBudget } from "@/lib/actions/budget.actions";

const categories = [
  "FOOD AND DRINK",
  "GENERAL MERCHANDISE",
  "TRANSPORTATION",
  "BILLS",
  "SHOPPING",
  "TRAVEL",
];

const BudgetForm = ({
  userId,
  existingCategories = [],
}: {
  userId: string;
  existingCategories?: string[];
}) => {
  // a category can only have one budget, so hide ones already in use
  const available = categories.filter((c) => !existingCategories.includes(c));

  const [category, setCategory] = useState(available[0] || "");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allBudgeted = available.length === 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError("Every category already has a budget.");
      return;
    }

    setLoading(true);

    try {
      await createBudget({
        userId,
        category,
        monthlyLimit: Number(monthlyLimit),
      });

      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Failed to create budget.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-slate-800">
      <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
        Create Monthly Budget
      </h2>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Set a spending limit for a category and track your progress.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {allBudgeted ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          You&apos;ve created a budget for every category. Delete one to add a
          different limit.
        </p>
      ) : (
        <div className="grid gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border bg-transparent p-3 text-gray-900 dark:border-gray-600 dark:text-white">
            {available.map((item) => (
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
            min="0"
            placeholder="Monthly Budget Amount"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            className="rounded-lg border bg-transparent p-3 text-gray-900 dark:border-gray-600 dark:text-white"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating" : "Create Budget"}
          </button>
        </div>
      )}
    </form>
  );
};

export default BudgetForm;
