"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3 } from "lucide-react";
import { calculateMonthlyAnalytics } from "@/lib/monthly-analytics";
import Money from "./Money";
import DailySpendingChart from "./DailySpendingChart";

// previous month key as "YYYY-MM"
const getPreviousMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// change vs last month; higherIsBetter flips the color (rising expenses = red)
const DeltaBadge = ({
  delta,
  suffix = "%",
  higherIsBetter,
}: {
  delta: number | null;
  suffix?: string;
  higherIsBetter: boolean;
}) => {
  if (delta === null || !isFinite(delta)) return null;

  const rounded = Math.round(delta * 10) / 10;
  const isUp = rounded > 0;
  const isFlat = rounded === 0;
  const good = isFlat || (isUp ? higherIsBetter : !higherIsBetter);

  return (
    <span
      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
        good
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      }`}>
      {!isFlat &&
        (isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      {Math.abs(rounded)}
      {suffix} vs last month
    </span>
  );
};

type AnalyticsAccount = {
  appwriteItemId: string;
  name: string;
  transactions: Transaction[];
};

const MonthlyAnalytics = ({
  accounts,
}: {
  accounts: AnalyticsAccount[];
}) => {
  // "all" merges every account; otherwise scope analytics to one account
  const [selectedAccount, setSelectedAccount] = useState("all");

  const transactions = useMemo(
    () =>
      selectedAccount === "all"
        ? accounts.flatMap((a) => a.transactions)
        : accounts.find((a) => a.appwriteItemId === selectedAccount)
            ?.transactions || [],
    [selectedAccount, accounts],
  );

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

  const [selectedMonth, setSelectedMonth] = useState("");

  // keep a valid month selected even when switching accounts changes the list
  const effectiveMonth = availableMonths.includes(selectedMonth)
    ? selectedMonth
    : availableMonths[0] || "";

  const analytics = calculateMonthlyAnalytics(transactions, effectiveMonth);

  // prev month for the delta badges
  const prevAnalytics = calculateMonthlyAnalytics(
    transactions,
    getPreviousMonth(effectiveMonth),
  );
  const hasPrevData =
    prevAnalytics.totalIncome > 0 || prevAnalytics.totalExpenses > 0;

  const pctChange = (current: number, previous: number) =>
    hasPrevData && previous !== 0
      ? ((current - previous) / Math.abs(previous)) * 100
      : null;

  const monthlyTransactionCount = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    return month === effectiveMonth;
  }).length;

  const savingsRate =
    analytics.totalIncome > 0
      ? (analytics.netCashflow / analytics.totalIncome) * 100
      : 0;

  const prevSavingsRate =
    prevAnalytics.totalIncome > 0
      ? (prevAnalytics.netCashflow / prevAnalytics.totalIncome) * 100
      : 0;

  // average daily spend (elapsed days so far if this is the current month)
  const [emYear, emMonth] = effectiveMonth
    ? effectiveMonth.split("-").map(Number)
    : [0, 0];
  const todayRef = new Date();
  const isCurrentMonth =
    emYear === todayRef.getFullYear() && emMonth === todayRef.getMonth() + 1;
  const daysInMonth = emYear ? new Date(emYear, emMonth, 0).getDate() : 0;
  const daysElapsed = isCurrentMonth ? todayRef.getDate() : daysInMonth;
  const avgDailySpend =
    daysElapsed > 0 ? analytics.totalExpenses / daysElapsed : 0;

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

  const summaryCards = [
    {
      label: "Total Income",
      value: <Money value={analytics.totalIncome} />,
      box: "border-emerald-500/20 bg-emerald-500/5",
      text: "text-emerald-500",
      delta: pctChange(analytics.totalIncome, prevAnalytics.totalIncome),
      suffix: "%",
      higherIsBetter: true,
    },
    {
      label: "Total Expenses",
      value: <Money value={analytics.totalExpenses} />,
      box: "border-rose-500/20 bg-rose-500/5",
      text: "text-rose-500",
      delta: pctChange(analytics.totalExpenses, prevAnalytics.totalExpenses),
      suffix: "%",
      higherIsBetter: false,
    },
    {
      label: "Net Cashflow",
      value: <Money value={analytics.netCashflow} />,
      box: "border-blue-500/20 bg-blue-500/5",
      text: analytics.netCashflow >= 0 ? "text-blue-500" : "text-rose-500",
      delta: pctChange(analytics.netCashflow, prevAnalytics.netCashflow),
      suffix: "%",
      higherIsBetter: true,
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      box: "border-violet-500/20 bg-violet-500/5",
      text: "text-violet-500",
      delta: hasPrevData ? savingsRate - prevSavingsRate : null,
      suffix: "%",
      higherIsBetter: true,
    },
  ];

  return (
    <section className="monthly-analytics">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Monthly Analytics
          </h1>

          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Analyze spending and income by month across all connected accounts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

          {availableMonths.length > 0 && (
            <select
              value={effectiveMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-slate-900 dark:text-white">
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {availableMonths.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-slate-800">
          <span className="flex size-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <BarChart3 size={26} />
          </span>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            No analytics yet
          </p>
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Once you have transactions, your monthly income, spending, and
            category trends will appear here.
          </p>
        </div>
      ) : (
        <>
      {/* summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 ${card.box}`}>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              {card.label}
            </h3>
            <p className={`mt-2 text-2xl font-bold ${card.text}`}>
              {card.value}
            </p>
            <div className="mt-2">
              <DeltaBadge
                delta={card.delta}
                suffix={card.suffix}
                higherIsBetter={card.higherIsBetter}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="-mt-2 text-sm text-gray-500 dark:text-gray-400">
        {monthlyTransactionCount} transactions in {formatMonth(effectiveMonth)}
      </p>

      {/* quick stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Biggest transaction
          </p>
          {analytics.biggestTransaction ? (
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <span className="truncate text-base font-semibold text-gray-900 dark:text-white">
                {analytics.biggestTransaction.name}
              </span>
              <span className="shrink-0 text-xl font-bold text-rose-600 dark:text-rose-400">
                <Money value={analytics.biggestTransaction.amount} />
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No expenses this month</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Avg daily spend
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            <Money value={avgDailySpend} />
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Over {daysElapsed} day{daysElapsed === 1 ? "" : "s"}
            {isCurrentMonth ? " so far" : ""}
          </p>
        </div>
      </div>

      {/* category breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Spending Categories
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Breakdown of expenses for {formatMonth(effectiveMonth)}.
        </p>

        {analytics.sortedCategories.length > 0 ? (
          <div className="mt-6 space-y-5">
            {analytics.sortedCategories.map((category) => {
              const percentage =
                analytics.totalExpenses > 0
                  ? (category.amount / analytics.totalExpenses) * 100
                  : 0;

              return (
                <div key={category.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        <Money value={category.amount} />
                      </span>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            No transactions found for this month.
          </div>
        )}
      </div>

      {/* top merchants */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Top Merchants
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Where most of your money went in {formatMonth(effectiveMonth)}.
        </p>

        {analytics.topMerchants.length > 0 ? (
          <div className="mt-6 space-y-3">
            {analytics.topMerchants.map((merchant, index) => (
              <div
                key={merchant.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-slate-900/40">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-500">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {merchant.name}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-white">
                  <Money value={merchant.amount} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            No transactions found for this month.
          </div>
        )}
      </div>

      <DailySpendingChart transactions={transactions} month={effectiveMonth} />
        </>
      )}
    </section>
  );
};

export default MonthlyAnalytics;
