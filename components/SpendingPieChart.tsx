"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingPieChart = ({
  categoryMap,
}: {
  categoryMap: Record<string, number>;
}) => {
  const labels = Object.keys(categoryMap);

  const values = Object.values(categoryMap);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#ef4444",
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#8b5cf6",
          "#ec4899",
        ],
      },
    ],
  };

  return (
    <div className="rounded-xl border p-5 dark:border-gray-700">
      <h2 className="mb-4 text-xl font-semibold dark:text-white">
        Spending by Category
      </h2>

      <div className="mx-auto h-[500px] w-full max-w-[700px]">
        <Pie
          data={data}
          options={{
            maintainAspectRatio: false,
            layout: {
              padding: 20,
            },
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "#d1d5db",
                  boxWidth: 20,
                  boxHeight: 20,
                  padding: 20,
                  font: {
                    size: 15,
                    weight: "bold",
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default SpendingPieChart;
