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

import { calculateBudgetUsage } from "@/lib/budget-utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BudgetComparisonChart = ({
  budgets,
  transactions,
}: {
  budgets: Budget[];
  transactions: Transaction[];
}) => {
  const labels = budgets.map((budget) => budget.category);

  const budgetValues = budgets.map((budget) => budget.monthlyLimit);

  const spentValues = budgets.map((budget) => {
    const result = calculateBudgetUsage(
      budget.category,
      budget.monthlyLimit,
      transactions,
    );

    return result.spent;
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-slate-900/30">
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Budget vs Actual Spending
      </h2>

      <p className="mb-6 text-gray-500 dark:text-gray-400">
        Compare your monthly budgets against actual spending.
      </p>

      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Budget",
              data: budgetValues,
              backgroundColor: "#3b82f6",
              borderRadius: 6,
            },
            {
              label: "Spent",
              data: spentValues,
              backgroundColor: "#ef4444",
              borderRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#d1d5db",
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

export default BudgetComparisonChart;
