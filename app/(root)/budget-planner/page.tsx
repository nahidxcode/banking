import HeaderBox from "@/components/HeaderBox";
import BudgetForm from "@/components/BudgetForm";
import BudgetCard from "@/components/BudgetCard";
import { Progress } from "@/components/ui/progress";
import BudgetComparisonChart from "@/components/BudgetComparisonChart";
import BudgetRecommendations from "@/components/BudgetRecommendations";

import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts, getAccount } from "@/lib/actions/bank.actions";
import { getBudgets } from "@/lib/actions/budget.actions";

const BudgetPlannerPage = async () => {
  const user = await getLoggedInUser();

  const accounts = await getAccounts({
    userId: user.$id,
  });

  if (!accounts) return null;

  const accountResults = await Promise.all(
    accounts.data.map(async (account: Account) => {
      return await getAccount({
        appwriteItemId: account.appwriteItemId,
      });
    }),
  );

  const allTransactions = accountResults.flatMap(
    (account) => account?.transactions || [],
  );

  const budgets = await getBudgets(user.$id);

  const now = new Date();

  const currentMonthTransactions = allTransactions.filter((transaction) => {
    const date = new Date(transaction.date);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      transaction.type !== "credit"
    );
  });

  const totalBudget =
    budgets?.reduce(
      (sum: number, budget: Budget) => sum + Number(budget.monthlyLimit),
      0,
    ) || 0;

  const totalSpent = currentMonthTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0,
  );

  const remainingBudget = totalBudget > 0 ? totalBudget - totalSpent : null;

  const usagePercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : null;

  return (
    <section className="space-y-6 px-6 lg:px-8">
      <HeaderBox
        title="Budget Planner"
        subtext="Set monthly spending limits and track your progress."
      />

      {/* <div className="rounded-xl border p-6 dark:border-gray-700 dark:bg-slate-900/30">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Monthly Budget Overview
          </h2>

          <p className="text-gray-500 dark:text-gray-400">
            Current month spending across all accounts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Budget
            </p>

            <p className="text-3xl font-bold text-blue-500">
              <span className="mr-1 font-black text-inherit">৳</span>
              {totalBudget.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Spent
            </p>

            <p className="text-3xl font-bold text-red-500">
              <span className="mr-1 font-black text-inherit">৳</span>
              {totalSpent.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remaining
            </p>

            <p
              className={`text-3xl font-bold ${
                remainingBudget === null
                  ? "text-gray-400"
                  : remainingBudget >= 0
                    ? "text-emerald-500"
                    : "text-red-500"
              }`}>
              {remainingBudget !== null
                ? `BDT ${remainingBudget.toFixed(2)}`
                : "--"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Progress
            value={Math.min(usagePercentage ?? 0, 100)}
            className="h-4"
            indicatorClassName={
              usagePercentage === null
                ? "bg-gray-400"
                : usagePercentage >= 100
                  ? "bg-red-500"
                  : usagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
            }
          />

          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Budget Usage
            </span>

            <span className="font-semibold text-gray-900 dark:text-white">
              {usagePercentage !== null
                ? `${usagePercentage.toFixed(0)}%`
                : "--"}
            </span>
          </div>
        </div>
      </div> */}

      <BudgetForm userId={user.$id} />

      <BudgetRecommendations transactions={allTransactions} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">Active Budgets</h3>

          <p className="text-3xl font-bold text-blue-500">
            {budgets?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">
            Categories Tracked
          </h3>

          <p className="text-3xl font-bold text-purple-500">
            {budgets?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">
            Transactions Analyzed
          </h3>

          <p className="text-3xl font-bold text-emerald-500">
            {allTransactions.length}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {budgets?.map((budget: Budget) => (
          <BudgetCard
            key={budget.$id}
            budget={budget}
            transactions={allTransactions}
          />
        ))}

        {budgets?.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center dark:border-gray-700">
            <h3 className="text-xl font-semibold dark:text-white">
              No budgets created yet
            </h3>

            <p className="mt-2 text-gray-500">
              Create your first monthly budget above.
            </p>
          </div>
        )}
      </div>

      {budgets?.length > 0 && (
        <BudgetComparisonChart
          budgets={budgets}
          transactions={allTransactions}
        />
      )}
    </section>
  );
};

export default BudgetPlannerPage;
