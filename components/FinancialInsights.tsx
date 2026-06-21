"use client";

import { calculateFinancialInsights } from "@/lib/financial-insights";

import SpendingPieChart from "./SpendingPieChart";
import SpendingBarChart from "./SpendingBarChart";
import InsightsSummary from "./InsightsSummary";

const FinancialInsights = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const insights = calculateFinancialInsights(transactions);

  return (
    <div className="financial-insights">
      <section className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Financial Insights
        </h1>

        {/* Total Spending Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <h3 className="text-center text-sm font-medium text-gray-500 dark:text-white">
              Total Spending
            </h3>

            <p className="mt-2 text-center text-4xl font-bold text-red-500 dark:text-red-500">
              <span className="mr-1 font-black text-inherit">৳</span>
              {insights.totalSpent.toFixed(2)}
            </p>

            <p className="mt-2 text-center text-sm text-gray-500 dark:text-white">
              Across all linked accounts
            </p>
          </div>
        </div>
        {/* Spending Intelligence */}
        <InsightsSummary insights={insights} />

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingPieChart categoryMap={insights.categoryMap} />

          <SpendingBarChart categoryMap={insights.categoryMap} />
        </div>
      </section>
    </div>
  );
};

export default FinancialInsights;
