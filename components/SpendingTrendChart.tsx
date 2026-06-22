"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const SpendingTrendChart = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const monthlyData: Record<
    string,
    {
      income: number;
      expenses: number;
    }
  > = {};

  transactions.forEach((transaction) => {
    // transfers are internal, not income or spending
    if (transaction.category === "Transfer") return;

    const date = new Date(transaction.date);

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        income: 0,
        expenses: 0,
      };
    }

    if (transaction.category === "INCOME") {
      monthlyData[monthKey].income += Number(transaction.amount);
    } else if (
      Number(transaction.amount) > 0 &&
      transaction.type !== "credit"
    ) {
      monthlyData[monthKey].expenses += Number(transaction.amount);
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();

  const labels = sortedMonths.map((month) => {
    const [year, monthNumber] = month.split("-");

    return new Date(Number(year), Number(monthNumber) - 1).toLocaleString(
      "en-US",
      {
        month: "short",
        year: "2-digit",
      },
    );
  });

  const incomeValues = sortedMonths.map((month) => monthlyData[month].income);

  const expenseValues = sortedMonths.map(
    (month) => monthlyData[month].expenses,
  );

  // neutral grays work on light and dark
  const axis = "#94a3b8";
  const grid = "rgba(148,163,184,0.15)";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Income vs Expenses
      </h2>

      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Track your cashflow across months to spot savings trends.
      </p>

      <div className="h-[500px] w-full">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Income",
              data: incomeValues,
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.12)",
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 3,
            },
            {
              label: "Expenses",
              data: expenseValues,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.12)",
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: {
                color: axis,
                font: {
                  size: 13,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.dataset.label}: ৳${Number(
                    context.parsed.y,
                  ).toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: axis },
              grid: { color: grid },
            },
            y: {
              ticks: {
                color: axis,
                callback: (value) => `৳${value}`,
              },
              grid: { color: grid },
            },
          },
        }}
      />
      </div>
    </div>
  );
};

export default SpendingTrendChart;
