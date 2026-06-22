"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DailySpendingChart = ({
  transactions,
  month,
}: {
  transactions: Transaction[];
  month: string; // "YYYY-MM"
}) => {
  const [yearStr, monthStr] = (month || "").split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const valid = Boolean(year) && monthIndex >= 0;

  const daysInMonth = valid ? new Date(year, monthIndex + 1, 0).getDate() : 0;

  const daily = new Array(daysInMonth).fill(0);

  transactions.forEach((t) => {
    // spending only, skip income and transfers
    if (t.category === "Transfer" || t.category === "INCOME") return;
    if (!(Number(t.amount) > 0 && t.type !== "credit")) return;

    const d = new Date(t.date);

    if (d.getFullYear() === year && d.getMonth() === monthIndex) {
      daily[d.getDate() - 1] += Number(t.amount);
    }
  });

  const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  const axis = "#94a3b8";
  const grid = "rgba(148,163,184,0.15)";

  const hasData = daily.some((v) => v > 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Daily Spending
      </h2>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        How your spending was distributed across the days of the month.
      </p>

      {hasData ? (
        <div className="h-[360px] w-full">
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Spending",
                  data: daily,
                  backgroundColor: "#8b5cf6",
                  borderRadius: 4,
                  maxBarThickness: 18,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (items) => `Day ${items[0].label}`,
                    label: (ctx) => `৳${Number(ctx.parsed.y).toLocaleString()}`,
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: axis,
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 16,
                  },
                  grid: { display: false },
                },
                y: {
                  ticks: { color: axis, callback: (v) => `৳${v}` },
                  grid: { color: grid },
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No spending recorded for this month.
        </p>
      )}
    </div>
  );
};

export default DailySpendingChart;
