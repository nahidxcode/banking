"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const accountNames = accounts.map((a) => a.name);
  const balances = accounts.map((a) => a.currentBalance);

  const data = {
    datasets: [
      {
        label: "Balance",
        data: balances,
        backgroundColor: [
          "#2E90FA",
          "#9b8afb",
          "#16a34a",
          "#6172F3",
          "#f59e0b",
          "#ef4444",
          "#14b8a6",
          "#ec4899",
        ],
        // Gaps between slices separate the colors without drawing a ring
        // around the outer/inner edges.
        borderWidth: 0,
        spacing: 4,
      },
    ],
    labels: accountNames,
  };

  return (
    <Doughnut
      data={data}
      options={{
        cutout: "68%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
      }}
    />
  );
};

export default DoughnutChart;
