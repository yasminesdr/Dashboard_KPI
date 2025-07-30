import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { downloadCSV }  from '../utils/exportCSV';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Use forwardRef to expose chart instance to parent
const LineChartBuilder = forwardRef(({ data, fields, xAxis, yAxis, groupBy }, ref) => {
  const chartRef = useRef();

  // Expose ChartJS instance to parent via ref
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
    chartInstance: chartRef.current
  }));

  if (!data || !xAxis || !yAxis) return null;

  const labels = [...new Set(data.map(row => row[xAxis]))];

  const datasets = groupBy
    ? [...new Set(data.map(row => row[groupBy]))].map((group, i) => ({
        label: group,
        data: data
          .filter(row => row[groupBy] === group)
          .sort((a, b) => a[xAxis] > b[xAxis] ? 1 : -1)
          .map(row => row[yAxis]),
        borderColor: `hsl(${i * 60}, 70%, 50%)`,
        backgroundColor: `hsl(${i * 60}, 70%, 80%)`,
        tension: 0.4
      }))
    : [
        {
          label: yAxis,
          data: data
            .sort((a, b) => a[xAxis] > b[xAxis] ? 1 : -1)
            .map(row => row[yAxis]),
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          tension: 0.4
        }
      ];

  return (
    <>
      <Line
        ref={chartRef}
        data={{ labels, datasets }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `${yAxis} over ${xAxis}` }
          },
          scales: {
            x: { title: { display: true, text: xAxis } },
            y: { title: { display: true, text: yAxis } }
          }
        }}
      />

      <button onClick={() => downloadCSV(data, "my-chart-data.csv")}>
        📊 Export CSV
      </button>

      <button
        onClick={() => {
          const url = chartRef.current.toBase64Image();
          const a = document.createElement("a");
          a.href = url;
          a.download = `${yAxis} over ${xAxis}`;
          a.click();
        }}
        style={{ marginTop: "10px" }}
      >
        📥 Download PNG
      </button>
    </>
  );
});

export default LineChartBuilder;
