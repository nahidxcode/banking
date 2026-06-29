"use client";

import { calculateBudgetRecommendations } from "@/lib/budget-recommendations";

const BudgetRecommendations = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const recommendations = calculateBudgetRecommendations(transactions);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Smart Budget Recommendations
      </h2>

      <p className="mt-1 text-gray-500 dark:text-gray-400">
        Based on your recent spending patterns.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {recommendations.slice(0, 6).map((item) => (
          <div
            key={item.category}
            className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {item.category}
            </h3>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Avg Monthly Spending</span>

                <span className="font-bold text-red-500">
                  <span className="mr-1 font-black text-inherit">৳</span>
                  {item.average.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Suggested Budget</span>

                <span className="font-bold text-emerald-500">
                  <span className="mr-1 font-black text-inherit">৳</span>
                  {item.suggestedBudget.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetRecommendations;
