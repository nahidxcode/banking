import { Progress } from "./ui/progress";
import AddContribution from "./AddContribution";
import DeleteGoalButton from "./DeleteGoalButton";
import Money from "./Money";

const GoalCard = ({ goal }: { goal: Goal }) => {
  const percentage = Math.min(
    (goal.savedAmount / goal.targetAmount) * 100,
    100,
  );

  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

  const completed = goal.savedAmount >= goal.targetAmount;

  const deadlineDate = new Date(goal.deadline);
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - Date.now()) / 86_400_000,
  );
  const overdue = !completed && daysLeft < 0;

  const dueLabel = deadlineDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const indicator = completed
    ? "bg-emerald-500"
    : overdue
      ? "bg-rose-500"
      : "bg-bank-gradient";

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate font-bold text-gray-900 dark:text-white">
          {goal.title}
        </h3>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              completed
                ? "bg-emerald-500/10 text-emerald-500"
                : overdue
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-blue-500/10 text-blue-500"
            }`}>
            {percentage.toFixed(0)}%
          </span>

          <DeleteGoalButton goalId={goal.$id} title={goal.title} />
        </div>
      </div>

      <p className="mt-2 text-sm font-medium">
        <Money value={goal.savedAmount} className="text-emerald-500" />
        <span className="mx-1.5 text-gray-400">/</span>
        <Money
          value={goal.targetAmount}
          className="text-gray-900 dark:text-white"
        />
      </p>

      <Progress
        value={percentage}
        className="mt-4 h-2.5 bg-gray-100 dark:bg-gray-700"
        indicatorClassName={indicator}
      />

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          Remaining:{" "}
          <Money
            value={remaining}
            className="font-semibold text-gray-900 dark:text-white"
          />
        </span>

        <span
          className={
            overdue
              ? "font-semibold text-rose-500"
              : "text-gray-500 dark:text-gray-400"
          }>
          {completed
            ? `Due ${dueLabel}`
            : overdue
              ? "Overdue"
              : daysLeft === 0
                ? "Due today"
                : `${daysLeft}d left`}
        </span>
      </div>

      {!completed && <AddContribution goalId={goal.$id} />}

      {completed && (
        <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-center font-semibold text-emerald-500">
          Goal Completed 🎉
        </div>
      )}
    </div>
  );
};

export default GoalCard;
