"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LineChart,
  Percent,
  PiggyBank,
} from "lucide-react";

import { calculateFinancialInsights } from "@/lib/financial-insights";

import CategoryBreakdown from "./CategoryBreakdown";
import Money from "./Money";
import SpendingPieChart from "./SpendingPieChart";
import SpendingTrendChart from "./SpendingTrendChart";
import InsightsSummary from "./InsightsSummary";

type InsightsAccount = {
  appwriteItemId: string;
  name: string;
  transactions: Transaction[];
};

const FinancialInsights = ({
  accounts,
}: {
  accounts: InsightsAccount[];
}) => {
  // "all" merges every account; otherwise scope insights to one account
  const [selectedAccount, setSelectedAccount] = useState("all");

  const transactions = useMemo(
    () =>
      selectedAccount === "all"
        ? accounts.flatMap((a) => a.transactions)
        : accounts.find((a) => a.appwriteItemId === selectedAccount)
            ?.transactions || [],
    [selectedAccount, accounts],
  );

  const insights = calculateFinancialInsights(transactions);

  const hasData = transactions.length > 0;

  const netSavings = insights.totalIncome - insights.totalSpent;
  const savingsRate =
    insights.totalIncome > 0 ? (netSavings / insights.totalIncome) * 100 : 0;

  // qualitative read on the lifetime savings rate
  const savingsHealth =
    savingsRate < 0
      ? {
          label: "Overspending",
          cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        }
      : savingsRate < 20
        ? {
            label: "Tight",
            cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          }
        : {
            label: "Healthy",
            cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          };

  const metrics = [
    {
      label: "Total Income",
      value: <Money value={insights.totalIncome} />,
      icon: ArrowDownLeft,
      accent: "bg-emerald-500/10 text-emerald-500",
      valueColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Spending",
      value: <Money value={insights.totalSpent} />,
      icon: ArrowUpRight,
      accent: "bg-rose-500/10 text-rose-500",
      valueColor: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Net Savings",
      value: <Money value={netSavings} />,
      icon: PiggyBank,
      accent:
        netSavings >= 0
          ? "bg-blue-500/10 text-blue-500"
          : "bg-rose-500/10 text-rose-500",
      valueColor:
        netSavings >= 0
          ? "text-blue-600 dark:text-blue-400"
          : "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: Percent,
      accent: "bg-violet-500/10 text-violet-500",
      valueColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="financial-insights">
      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Financial Insights
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              A complete overview of your money across all linked accounts.
            </p>
          </div>

          {accounts.length > 0 && (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-slate-900 dark:text-white">
              <option value="all">All accounts</option>
              {accounts.map((a) => (
                <option key={a.appwriteItemId} value={a.appwriteItemId}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-slate-800">
            <span className="flex size-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <LineChart size={26} />
            </span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              No insights yet
            </p>
            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
              Once you have transactions across your accounts, your income,
              spending, and category trends will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {m.label}
                    </p>
                    <span
                      className={`flex size-9 items-center justify-center rounded-lg ${m.accent}`}>
                      <m.icon size={18} />
                    </span>
                  </div>
                  <p className={`mt-3 text-2xl font-bold ${m.valueColor}`}>
                    {m.value}
                  </p>
                  {m.label === "Savings Rate" && (
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${savingsHealth.cls}`}>
                      {savingsHealth.label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Spending intelligence */}
            <InsightsSummary insights={insights} />

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingPieChart categoryMap={insights.categoryMap} />
              <CategoryBreakdown
                categoryMap={insights.categoryMap}
                totalSpent={insights.totalSpent}
              />
            </div>

            <SpendingTrendChart transactions={transactions} />
          </>
        )}
      </section>
    </div>
  );
};

export default FinancialInsights;
