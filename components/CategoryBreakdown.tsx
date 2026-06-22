import Money from "./Money";

// keep in sync with SpendingPieChart so colors match
const COLORS = [
  "#2E90FA",
  "#6172F3",
  "#9b8afb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#ec4899",
  "#f97316",
  "#0ea5e9",
];

const CategoryBreakdown = ({
  categoryMap,
  totalSpent,
}: {
  categoryMap: Record<string, number>;
  totalSpent: number;
}) => {
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Category Breakdown
      </h2>

      {categories.length > 0 ? (
        <ul className="space-y-4">
          {categories.map(([name, amount], index) => {
            const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            const color = COLORS[index % COLORS.length];

            return (
              <li key={name}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate text-sm font-medium capitalize text-gray-900 dark:text-white">
                      {name.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Money
                      value={amount}
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    />
                    <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No spending data yet.
        </p>
      )}
    </div>
  );
};

export default CategoryBreakdown;
