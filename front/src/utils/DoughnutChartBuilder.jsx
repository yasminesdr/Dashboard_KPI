import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import { downloadCSV } from '../utils/exportCSV';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const DoughnutChartBuilder = forwardRef(({ data, xAxis, yAxis }, ref) => {
  const chartRef = useRef();

  // Expose chart instance and .toBase64Image to parent
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
    chartInstance: chartRef.current
  }));

  if (!data || !xAxis || !yAxis) return null;

  const grouped = data.reduce((acc, row) => {
    const key = row[xAxis];
    acc[key] = (acc[key] || 0) + Number(row[yAxis]);
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);
  const backgroundColors = labels.map((_, i) => `hsl(${i * 60}, 70%, 60%)`);

  return (
    <>
      <Doughnut
        ref={chartRef}
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: backgroundColors,
              borderWidth: 1
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "right" },
            title: {
              display: true,
              text: `Doughnut Chart: ${yAxis} by ${xAxis}`
            }
          }
        }}
      />

      <button onClick={() => downloadCSV(data, "my-chart-data.csv")}>
        📊 Export CSV
      </button>

      <button
        onClick={() => {
          const url = chartRef.current?.toBase64Image?.();
          if (url) {
            const a = document.createElement("a");
            a.href = url;
            a.download = "doughnut-chart.png";
            a.click();
          }
        }}
        style={{ marginTop: "10px" }}
      >
        📥 Download PNG
      </button>
    </>
  );
});

export default DoughnutChartBuilder;
