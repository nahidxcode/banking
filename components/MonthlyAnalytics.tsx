"use client";
import { useMemo, useState } from "react";
import { calculateMonthlyAnalytics } from "@/lib/monthly-analytics";
import SpendingBarChart from "./SpendingBarChart";
import SpendingTrendChart from "./SpendingTrendChart";

const MonthlyAnalytics = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      months.add(value);
    });

    return Array.from(months).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || "");

  const analytics = calculateMonthlyAnalytics(transactions, selectedMonth);

  const monthlyTransactionCount = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    return month === selectedMonth;
  }).length;

  const formatMonth = (month: string) => {
    const [year, monthNumber] = month.split("-");

    return new Date(Number(year), Number(monthNumber) - 1).toLocaleString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      },
    );
  };

  return (
    <section className="monthly-analytics">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Monthly Analytics
          </h1>

          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Analyze spending and income by month across all connected accounts.
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-slate-900 dark:text-white">
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
          <h3 className="text-gray-500 dark:text-gray-400">Total Income</h3>

          <p className="mt-2 text-3xl font-bold text-green-500">
            <span className="mr-1 font-black text-inherit">৳</span>
            {analytics.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h3 className="text-gray-500 dark:text-gray-400">Total Expenses</h3>

          <p className="mt-2 text-3xl font-bold text-red-500">
            <span className="mr-1 font-black text-inherit">৳</span>
            {analytics.totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <h3 className="text-gray-500 dark:text-gray-400">Net Cashflow</h3>

          <p
            className={`mt-2 text-3xl font-bold ${
              analytics.netCashflow >= 0 ? "text-blue-500" : "text-red-500"
            }`}>
            <span className="mr-1 font-black text-inherit">৳</span>
            {analytics.netCashflow.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
          <h3 className="text-gray-500 dark:text-gray-400">Transactions</h3>

          <p className="mt-2 text-3xl font-bold text-purple-500">
            {monthlyTransactionCount}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-900/30">
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Spending Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Breakdown of expenses for {formatMonth(selectedMonth)}
          </p>
        </div>

        {analytics.sortedCategories.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Category
                </th>

                <th className="pb-3 text-right text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {analytics.sortedCategories.map((category) => {
                const percentage =
                  analytics.totalExpenses > 0
                    ? (
                        (category.amount / analytics.totalExpenses) *
                        100
                      ).toFixed(1)
                    : "0";

                return (
                  <tr
                    key={category.name}
                    className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-bold text-red-500">
                          <span className="mr-1 font-black text-inherit">
                            ৳
                          </span>
                          {category.amount.toFixed(2)}
                        </span>

                        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-500">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No transactions found for this month.
          </div>
        )}
      </div>

      <SpendingTrendChart transactions={transactions} />

      <SpendingBarChart categoryMap={analytics.categoryMap} />
    </section>
  );
};

export default MonthlyAnalytics;
