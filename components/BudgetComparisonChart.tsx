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

  const usages = budgets.map((budget) =>
    calculateBudgetUsage(budget.category, budget.monthlyLimit, transactions),
  );

  const spentValues = usages.map((u) => u.spent);

  // color the spent bar by how close it is to the limit
  const spentColors = usages.map((u) =>
    u.percentage > 100
      ? "#ef4444" // over budget
      : u.percentage >= 80
        ? "#f59e0b" // close
        : "#10b981", // healthy
  );

  const axis = "#94a3b8";
  const grid = "rgba(148,163,184,0.15)";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Budget vs Actual Spending
      </h2>

      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Spent bars turn amber as you near a limit and red once you exceed it.
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#3b82f6" }}
          />
          Budget
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#10b981" }}
          />
          On track
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#f59e0b" }}
          />
          Near limit
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#ef4444" }}
          />
          Over budget
        </span>
      </div>

      <div className="h-[360px] w-full">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Budget",
                data: budgetValues,
                backgroundColor: "#3b82f6",
                borderRadius: 6,
                maxBarThickness: 36,
              },
              {
                label: "Spent",
                data: spentValues,
                backgroundColor: spentColors,
                borderRadius: 6,
                maxBarThickness: 36,
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
                  label: (ctx) =>
                    `${ctx.dataset.label}: ৳${Number(
                      ctx.parsed.y,
                    ).toLocaleString()}`,
                },
              },
            },
            scales: {
              x: {
                ticks: { color: axis, autoSkip: false },
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

export default BudgetComparisonChart;
