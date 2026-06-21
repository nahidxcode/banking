const InsightsSummary = ({ insights }: { insights: any }) => {
  const categories = Object.entries(insights.categoryMap) as [string, number][];

  const highest = [...categories].sort((a, b) => b[1] - a[1])[0];

  const percentage =
    highest && insights.totalSpent
      ? ((highest[1] / insights.totalSpent) * 100).toFixed(1)
      : "0";

  const insightCards = [
    {
      icon: "📊",
      title: "Top Spending Category",
      value: highest?.[0] || "N/A",
      text: `${percentage}% of all spending`,
    },
    {
      icon: "💰",
      title: "Average Transaction",
      value: `BDT ${insights.averageTransaction.toFixed(2)}`,
      text: "Average amount per transaction",
    },
    {
      icon: "🔥",
      title: "Most Active Category",
      value: insights.mostActiveCategory,
      text: "Highest transaction frequency",
    },
    {
      icon: "🔄",
      title: "Transfers",
      value: insights.transferCount,
      text: "Completed transfer transactions",
    },
    {
      icon: "🧾",
      title: "Transactions",
      value: insights.totalTransactions,
      text: "Total recorded transactions",
    },
    {
      icon: "📈",
      title: "Categories",
      value: Object.keys(insights.categoryMap).length,
      text: "Unique spending categories",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#0f172a]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Spending Intelligence
        </h2>

        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Key trends and financial patterns across all linked accounts.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {insightCards.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:shadow-md dark:border-gray-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{item.icon}</span>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
            </div>

            <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {item.value}
            </div>

            <p className="text-base text-gray-600 dark:text-gray-300">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsSummary;
