"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingPieChart = ({
  categoryMap,
}: {
  categoryMap: Record<string, number>;
}) => {
  // sort desc so colors line up with the breakdown list
  const entries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const labels = entries.map(([name]) => name);

  const values = entries.map(([, value]) => value);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
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
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Spending by Category
      </h2>

      {labels.length > 0 ? (
        <div className="mx-auto h-[320px] w-full max-w-[560px] sm:h-[380px]">
          <Pie
            data={data}
            options={{
              maintainAspectRatio: false,
              layout: {
                padding: 16,
              },
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#94a3b8",
                    boxWidth: 14,
                    boxHeight: 14,
                    padding: 16,
                    font: {
                      size: 13,
                      weight: "bold",
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      ` ৳${Number(ctx.parsed).toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No spending data yet.
        </p>
      )}
    </div>
  );
};

export default SpendingPieChart;
