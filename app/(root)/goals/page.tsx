import HeaderBox from "@/components/HeaderBox";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";

import { getGoals } from "@/lib/actions/goal.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const GoalsPage = async () => {
  const user = await getLoggedInUser();

  const goals = await getGoals(user.$id);

  const totalTarget =
    goals?.reduce((sum: number, goal: Goal) => sum + goal.targetAmount, 0) || 0;

  const totalSaved =
    goals?.reduce((sum: number, goal: Goal) => sum + goal.savedAmount, 0) || 0;

  const completedGoals =
    goals?.filter((goal: Goal) => goal.savedAmount >= goal.targetAmount)
      .length || 0;

  const savingsProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <section className="space-y-6 px-6 lg:px-8">
      <HeaderBox
        title="Financial Goals"
        subtext="Track your savings goals and progress."
      />
      <GoalForm userId={user.$id} />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">Total Goals</h3>

          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {goals.length}
          </p>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">Completed Goals</h3>

          <p className="text-3xl font-bold text-green-500">{completedGoals}</p>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">Total Saved</h3>

          <p className="text-3xl font-bold text-emerald-500">
            <span className="mr-1 font-black text-inherit">৳</span>
            {totalSaved.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
          <h3 className="text-gray-600 dark:text-gray-300">Overall Progress</h3>

          <p className="text-3xl font-bold text-blue-500">
            {savingsProgress.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {goals.map((goal: Goal) => (
          <GoalCard key={goal.$id} goal={goal} />
        ))}
      </div>
    </section>
  );
};

export default GoalsPage;
