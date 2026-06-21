"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SpendingBarChart = ({
  categoryMap,
}: {
  categoryMap: Record<string, number>;
}) => {
  const labels = Object.keys(categoryMap);

  const values = Object.values(categoryMap);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#0f172a]">
      <h2 className="mb-4 text-2xl font-bold dark:text-white">
        Category Spending Analysis
      </h2>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Breakdown of spending across transaction categories.
      </p>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Amount ($)",
              data: values,
              backgroundColor: [
                "#ef4444", // FOOD AND DRINK
                "#3b82f6", // GENERAL MERCHANDISE
                "#10b981", // TRANSFER
                "#f59e0b", // TRANSPORTATION
                "#8b5cf6", // LOAN PAYMENTS
                "#ec4899", // fallback
              ],
              borderRadius: 8,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#d1d5db",
                font: {
                  size: 12,
                  weight: "bold",
                },
              },
              grid: {
                color: "rgba(255,255,255,0.08)",
              },
            },
            y: {
              ticks: {
                color: "#d1d5db",
              },
              grid: {
                color: "rgba(255,255,255,0.08)",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default SpendingBarChart;
