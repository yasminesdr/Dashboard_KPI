import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { downloadCSV } from '../utils/exportCSV';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Forward ref to allow access to Chart instance
const BarChartBuilder = forwardRef(({ data, xAxis, yAxis, groupBy }, ref) => {
  const chartRef = useRef();

  // Expose Chart.js instance to parent through ref
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
    chartInstance: chartRef.current
  }));

  if (!data || !xAxis || !yAxis) return null;

  const labels = [...new Set(data.map(row => row[xAxis]))];

  const datasets = groupBy
    ? [...new Set(data.map(row => row[groupBy]))].map((group, i) => ({
        label: group,
        data: labels.map(label => {
          const entry = data.find(row => row[xAxis] === label && row[groupBy] === group);
          return entry ? entry[yAxis] : 0;
        }),
        backgroundColor: `hsl(${i * 60}, 70%, 50%)`
      }))
    : [
        {
          label: yAxis,
          data: labels.map(label => {
            const entry = data.find(row => row[xAxis] === label);
            return entry ? entry[yAxis] : 0;
          }),
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        }
      ];

  return (
    <>
    <Bar
      ref={chartRef}
      data={{ labels, datasets }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: `${yAxis} by ${xAxis}` }
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
              a.download = "scatter-plot.png";
              a.click();
            }}
            style={{ marginTop: "10px" }}
          >
            📥 Download PNG
          </button> </>
  );
});

export default BarChartBuilder;
