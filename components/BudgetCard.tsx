"use client";

import { Trash2 } from "lucide-react";

import { deleteBudget } from "@/lib/actions/budget.actions";
import { calculateBudgetUsage } from "@/lib/budget-utils";

import { Progress } from "./ui/progress";

const BudgetCard = ({
  budget,
  transactions,
}: {
  budget: Budget;
  transactions: Transaction[];
}) => {
  const { spent, remaining, percentage } = calculateBudgetUsage(
    budget.category,
    budget.monthlyLimit,
    transactions,
  );

  const status =
    percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "good";

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${budget.category}" budget?`);

    if (!confirmed) return;

    await deleteBudget(budget.$id);

    window.location.reload();
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-5 transition-all dark:bg-slate-800 ${
        status === "over"
          ? "border-red-500/40"
          : status === "warning"
            ? "border-yellow-500/40"
            : "border-gray-200 dark:border-gray-700"
      }`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {budget.category}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly spending budget
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              status === "over"
                ? "bg-red-500/10 text-red-500"
                : status === "warning"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-green-500/10 text-green-500"
            }`}>
            {status === "over"
              ? "Over Budget"
              : status === "warning"
                ? "Warning"
                : "On Track"}
          </span>

          <button
            onClick={handleDelete}
            className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>

          <p className="text-2xl font-bold text-red-500">
            <span className="mr-1 font-black text-inherit">৳</span>
            {spent.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>

          <p className="text-2xl font-bold text-blue-500">
            <span className="mr-1 font-black text-inherit">৳</span>
            {budget.monthlyLimit.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>

          <p
            className={`text-2xl font-bold ${
              remaining >= 0 ? "text-emerald-500" : "text-red-500"
            }`}>
            <span className="mr-1 font-black text-inherit">৳</span>
            {remaining.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Progress
          value={Math.min(percentage, 100)}
          className="h-3"
          indicatorClassName={
            status === "over"
              ? "bg-red-500"
              : status === "warning"
                ? "bg-yellow-500"
                : "bg-emerald-500"
          }
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Budget Usage
          </span>

          <span
            className={`font-bold ${
              status === "over"
                ? "text-red-500"
                : status === "warning"
                  ? "text-yellow-500"
                  : "text-emerald-500"
            }`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
