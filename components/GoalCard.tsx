import { Progress } from "./ui/progress";
import AddContribution from "./AddContribution";

const GoalCard = ({ goal }: { goal: Goal }) => {
  const percentage = Math.min(
    (goal.savedAmount / goal.targetAmount) * 100,
    100,
  );

  const remaining = goal.targetAmount - goal.savedAmount;

  const completed = goal.savedAmount >= goal.targetAmount;

  return (
    <div className="rounded-xl border p-5 dark:border-gray-700 dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">
          {goal.title}
        </h3>

        <span
          className={`font-semibold ${
            completed ? "text-green-500" : "text-blue-500"
          }`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      <p className="mt-2 font-medium">
        <span className="text-green-500">
          <span className="mr-1 font-black text-inherit">৳</span>
          {goal.savedAmount.toFixed(2)}
        </span>

        <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>

        <span className="text-blue-500">
          <span className="mr-1 font-black text-inherit">৳</span>
          {goal.targetAmount.toFixed(2)}
        </span>
      </p>

      <Progress value={percentage} className="mt-4" />

      <div className="mt-3 flex justify-between text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Remaining: <span className="mr-1 font-black text-inherit">৳</span>
          {remaining.toFixed(2)}
        </span>

        <span className="text-slate-600 dark:text-slate-300">
          Due: {goal.deadline.slice(0, 10)}
        </span>
      </div>

      {!completed && <AddContribution goalId={goal.$id} />}

      {completed && (
        <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-center font-semibold text-green-400">
          Goal Completed 🎉
        </div>
      )}
    </div>
  );
};

export default GoalCard;
