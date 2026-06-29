import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Landmark, Wallet } from "lucide-react";

import RecentTransactions from "@/components/RecentTransactions";
import ConnectAccountModal from "@/components/ConnectAccountModal";
import DoughnutChart from "@/components/DoughnutChart";
import Category from "@/components/Category";
import Money from "@/components/Money";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/auth";
import { countTransactionCategories } from "@/lib/utils";
import { redirect } from "next/navigation";

// small month-over-month delta badge; color depends on whether "up" is good
const TrendChip = ({
  pct,
  goodWhenUp,
}: {
  pct: number | null;
  goodWhenUp: boolean;
}) => {
  if (pct === null || !Number.isFinite(pct)) return null;

  const up = pct >= 0;
  const positive = up === goodWhenUp;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
        positive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      }`}>
      {up ? "↑" : "↓"} {Math.abs(Math.round(pct))}%
    </span>
  );
};

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  // getAccounts swallows its errors and returns undefined on failure — show a
  // friendly fallback instead of a blank screen
  if (!accounts) {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            We couldn&apos;t load your dashboard
          </h1>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Something went wrong while fetching your accounts. Please refresh the
            page or try again in a moment.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Retry
          </Link>
        </div>
      </section>
    );
  }

  // remittance is USD, handled on my-banks
  const accountsData =
    accounts?.data?.filter(
      (account: Account) => account.accountType !== "remittance",
    ) || [];
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  // pull all accounts' txns so stats cover everything; table shows the selected one
  const accountResults = await Promise.all(
    accountsData.map((a: Account) =>
      getAccount({ appwriteItemId: a.appwriteItemId }),
    ),
  );

  const selected =
    accountResults.find((r) => r?.data?.appwriteItemId === appwriteItemId) ||
    accountResults[0];

  const transactions: Transaction[] = selected?.transactions || [];

  const allTransactions: Transaction[] = accountResults.flatMap(
    (r) => r?.transactions || [],
  );

  // this month's income & spending across all accounts
  const now = new Date();
  const inCurrentMonth = (date: string) => {
    const d = new Date(date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  };

  const monthlyTransactions = allTransactions.filter((t) =>
    inCurrentMonth(t.date),
  );

  // income = anything tagged INCOME; transfers don't count
  const monthlyIncome = monthlyTransactions
    .filter((t) => t.category === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlySpending = monthlyTransactions
    .filter(
      (t) =>
        Number(t.amount) > 0 && t.type !== "credit" && t.category !== "Transfer",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categories = countTransactionCategories(allTransactions);

  // previous calendar month, for the month-over-month trend chips
  const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const inMonthOf = (date: string, ref: Date) => {
    const d = new Date(date);
    return (
      d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
    );
  };
  const lastMonthTransactions = allTransactions.filter((t) =>
    inMonthOf(t.date, prevMonthRef),
  );
  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.category === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const lastMonthSpending = lastMonthTransactions
    .filter(
      (t) =>
        Number(t.amount) > 0 && t.type !== "credit" && t.category !== "Transfer",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pctChange = (current: number, previous: number) =>
    previous > 0 ? ((current - previous) / previous) * 100 : null;
  const incomeTrend = pctChange(monthlyIncome, lastMonthIncome);
  const spendingTrend = pctChange(monthlySpending, lastMonthSpending);

  // account-type breakdown for the stat subtexts
  const walletCount = accountsData.filter(
    (a: Account) => a.accountType === "mfs",
  ).length;
  const bankCount = accountsData.length - walletCount;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const firstName = loggedIn?.firstName || "Guest";

  return (
    <section className="no-scrollbar flex h-full w-full flex-col gap-6 overflow-y-auto p-5 sm:p-8 xl:py-10">
      {/* welcome hero */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{greeting},</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {firstName} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Here&apos;s a quick overview of your money across all your accounts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/payment-transfer"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50">
              Transfer Funds
            </Link>
            <Link
              href="/financial-insights"
              className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/25">
              View Insights
            </Link>
          </div>
        </div>
      </div>

      {accountsData.length === 0 ? (
        /* fresh user with no accounts — guide them to connect one */
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <span className="flex size-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <Wallet size={28} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            No accounts connected yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Connect a bank account, mobile wallet, or remittance service to see
            your balances, transactions, and insights here.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <ConnectAccountModal userId={loggedIn.$id} />
          </div>
        </div>
      ) : (
        <>
          {/* stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Balance
            </p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Wallet size={18} />
            </span>
          </div>
          <p className="mt-3 text-xl font-bold sm:text-2xl text-gray-900 dark:text-white">
            <Money value={accounts?.totalCurrentBalance || 0} />
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Across {accountsData.length} account
            {accountsData.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Accounts
            </p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Landmark size={18} />
            </span>
          </div>
          <p className="mt-3 text-xl font-bold sm:text-2xl text-gray-900 dark:text-white">
            {accountsData.length}
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {bankCount} bank{bankCount === 1 ? "" : "s"} · {walletCount} wallet
            {walletCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Income (This Month)
            </p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft size={18} />
            </span>
          </div>
          <p className="mt-3 text-xl font-bold sm:text-2xl text-emerald-600 dark:text-emerald-400">
            <Money value={monthlyIncome} />
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            {incomeTrend !== null ? (
              <TrendChip pct={incomeTrend} goodWhenUp />
            ) : (
              <span>—</span>
            )}
            vs last month
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Spending (This Month)
            </p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <p className="mt-3 text-xl font-bold sm:text-2xl text-rose-600 dark:text-rose-400">
            <Money value={monthlySpending} />
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            {spendingTrend !== null ? (
              <TrendChip pct={spendingTrend} goodWhenUp={false} />
            ) : (
              <span>—</span>
            )}
            vs last month
          </p>
        </div>
      </div>

      {/* lower section */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800 xl:col-span-2">
          <RecentTransactions
            accounts={accountsData}
            transactions={transactions}
            appwriteItemId={appwriteItemId}
            page={currentPage}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Balance Distribution
            </h2>

            {accountsData.length > 0 ? (
              <div className="mx-auto max-w-[220px]">
                <DoughnutChart accounts={accountsData} />
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No accounts connected yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Top Categories
            </h2>

            <div className="space-y-4">
              {categories.slice(0, 5).map((category) => (
                <Category key={category.name} category={category} />
              ))}

              {categories.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No spending data yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </section>
  );
};

export default Home;
