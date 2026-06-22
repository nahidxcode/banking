import HeaderBox from "@/components/HeaderBox";
import BudgetForm from "@/components/BudgetForm";
import BudgetCard from "@/components/BudgetCard";
import Money from "@/components/Money";
import { Progress } from "@/components/ui/progress";
import BudgetComparisonChart from "@/components/BudgetComparisonChart";
import BudgetRecommendations from "@/components/BudgetRecommendations";
import { AlertTriangle, ReceiptText, Wallet } from "lucide-react";

import { getLoggedInUser } from "@/lib/auth";
import { getBanks } from "@/lib/actions/user.actions";
import { getAccount } from "@/lib/actions/bank.actions";
import { getBudgets } from "@/lib/actions/budget.actions";
import { calculateBudgetUsage } from "@/lib/budget-utils";

const BudgetPlannerPage = async () => {
  const user = await getLoggedInUser();

  const banks = await getBanks({
    userId: user.$id,
  });

  if (!banks) return null;

  const accountResults = await Promise.all(
    banks
      .filter((bank: Bank) => bank.accountType !== "remittance")
      .map(async (bank: Bank) => {
        return await getAccount({
          appwriteItemId: bank.$id,
        });
      }),
  );

  const allTransactions = accountResults.flatMap(
    (account) => account?.transactions || [],
  );

  const budgets = await getBudgets(user.$id);

  // per-budget usage so the overview matches the cards
  const budgetUsages: {
    budget: Budget;
    spent: number;
    remaining: number;
    percentage: number;
  }[] = (budgets || []).map((budget: Budget) => ({
    budget,
    ...calculateBudgetUsage(
      budget.category,
      Number(budget.monthlyLimit),
      allTransactions,
    ),
  }));

  const totalBudget = budgetUsages.reduce(
    (sum: number, u) => sum + Number(u.budget.monthlyLimit),
    0,
  );

  const totalSpent = budgetUsages.reduce((sum: number, u) => sum + u.spent, 0);

  const overBudgetCount = budgetUsages.filter(
    (u) => u.percentage >= 100,
  ).length;

  const remainingBudget = totalBudget - totalSpent;

  const usagePercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <section className="h-full w-full space-y-6 overflow-y-auto px-6 py-8 lg:px-8 xl:py-12">
      <HeaderBox
        title="Budget Planner"
        subtext="Set monthly spending limits and track your progress."
      />

      {/* monthly budget overview */}
      {budgets?.length > 0 && (
        <div className="rounded-xl border p-6 dark:border-gray-700 dark:bg-slate-800">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Monthly Budget Overview
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              Spending this month across your budgeted categories.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Budget
              </p>
              <p className="text-3xl font-bold text-blue-500">
                <Money value={totalBudget} />
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Spent
              </p>
              <p className="text-3xl font-bold text-red-500">
                <Money value={totalSpent} />
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remaining
              </p>
              <p
                className={`text-3xl font-bold ${
                  remainingBudget >= 0 ? "text-emerald-500" : "text-red-500"
                }`}>
                <Money value={remainingBudget} />
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Progress
              value={Math.min(usagePercentage, 100)}
              className="h-4"
              indicatorClassName={
                usagePercentage >= 100
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
                {usagePercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <BudgetForm userId={user.$id} />

      <BudgetRecommendations transactions={allTransactions} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-800">
          <span className="flex size-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Wallet size={22} />
          </span>
          <div>
            <h3 className="text-sm text-gray-600 dark:text-gray-300">
              Active Budgets
            </h3>
            <p className="text-3xl font-bold text-blue-500">
              {budgets?.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-800">
          <span
            className={`flex size-11 items-center justify-center rounded-lg ${
              overBudgetCount > 0
                ? "bg-red-500/10 text-red-500"
                : "bg-emerald-500/10 text-emerald-500"
            }`}>
            <AlertTriangle size={22} />
          </span>
          <div>
            <h3 className="text-sm text-gray-600 dark:text-gray-300">
              Over Budget
            </h3>
            <p
              className={`text-3xl font-bold ${
                overBudgetCount > 0 ? "text-red-500" : "text-emerald-500"
              }`}>
              {overBudgetCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-800">
          <span className="flex size-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <ReceiptText size={22} />
          </span>
          <div>
            <h3 className="text-sm text-gray-600 dark:text-gray-300">
              Transactions Analyzed
            </h3>
            <p className="text-3xl font-bold text-purple-500">
              {allTransactions.length}
            </p>
          </div>
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

            <p className="mt-2 text-gray-500 dark:text-gray-400">
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
