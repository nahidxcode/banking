"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

    if (transaction.type === "credit") {
      monthlyData[monthKey].income += Number(transaction.amount);
    } else {
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-slate-900/30">
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Financial Trend Analysis
      </h2>

      <p className="mb-5 text-gray-500 dark:text-gray-400">
        Compare income and expenses across months to identify savings trends.
      </p>

      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Income",
              data: incomeValues,
              borderColor: "#10b981",
              backgroundColor: "#10b981",
              tension: 0.35,
              borderWidth: 3,
            },
            {
              label: "Expenses",
              data: expenseValues,
              borderColor: "#ef4444",
              backgroundColor: "#ef4444",
              tension: 0.35,
              borderWidth: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: {
                color: "#d1d5db",
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
                  ).toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#d1d5db",
              },
              grid: {
                color: "rgba(255,255,255,0.06)",
              },
            },
            y: {
              ticks: {
                color: "#d1d5db",
                callback: (value) => `৳${value}`,
              },
              grid: {
                color: "rgba(255,255,255,0.06)",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default SpendingTrendChart;
