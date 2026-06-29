import { CheckCircle2, PiggyBank, Target, TrendingUp } from "lucide-react";

import HeaderBox from "@/components/HeaderBox";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";
import Money from "@/components/Money";

import { getGoals } from "@/lib/actions/goal.actions";
import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const GoalsPage = async () => {
  const user = await getLoggedInUser();
  if (!user) redirect("/sign-in");

  const goals: Goal[] = (await getGoals(user.$id)) || [];

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const completedGoals = goals.filter(
    (goal) => goal.savedAmount >= goal.targetAmount,
  ).length;
  const savingsProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const stats = [
    {
      label: "Total Goals",
      value: goals.length,
      icon: Target,
      accent: "bg-blue-500/10 text-blue-500",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      label: "Completed",
      value: completedGoals,
      icon: CheckCircle2,
      accent: "bg-emerald-500/10 text-emerald-500",
      valueColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Saved",
      value: <Money value={totalSaved} />,
      icon: PiggyBank,
      accent: "bg-violet-500/10 text-violet-500",
      valueColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Overall Progress",
      value: `${savingsProgress.toFixed(0)}%`,
      icon: TrendingUp,
      accent: "bg-amber-500/10 text-amber-500",
      valueColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <section className="h-full w-full space-y-6 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:py-10">
      <HeaderBox
        title="Financial Goals"
        subtext="Set savings targets and track your progress toward them."
      />

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {s.label}
              </p>
              <span
                className={`flex size-9 items-center justify-center rounded-lg ${s.accent}`}>
                <s.icon size={18} />
              </span>
            </div>
            <p className={`mt-3 text-xl font-bold sm:text-2xl ${s.valueColor}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* overall progress */}
      {goals.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              <Money value={totalSaved} /> saved of <Money value={totalTarget} />
            </span>
            <span className="font-semibold text-blue-500">
              {savingsProgress.toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-bank-gradient"
              style={{ width: `${Math.min(savingsProgress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <GoalForm userId={user.$id} />

      {/* goals */}
      {goals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.$id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-slate-800">
          <span className="flex size-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <Target size={26} />
          </span>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            No goals yet
          </p>
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Create your first savings goal above to start tracking your progress.
          </p>
        </div>
      )}
    </section>
  );
};

export default GoalsPage;
