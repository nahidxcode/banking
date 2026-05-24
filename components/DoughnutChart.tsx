"use client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const data = {
    datasets: [
      {
        label: "Banks",
        data: [1500, 2500, 3750],
        backgroundColor: ["#37f194", "#2ae02a", "#09a804"],
      },
    ],
    labels: ["Bank 1", "Bank 2", "Bank 3"],
  };

  return (
    <Doughnut
      data={data}
      options={{
        cutout: "10%",
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
};

export default DoughnutChart;
