import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import { downloadCSV } from '../utils/exportCSV';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChartBuilder = forwardRef(({ data, xAxis, yAxis, countField, mode }, ref) => {
  const chartRef = useRef();

  // Expose to parent for save/share functionality
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
    chartInstance: chartRef.current
  }));

  if (!data || data.length === 0) return null;

  let chartData;
  let csvData;

  if (mode === "multi-count" && data) {
    chartData = {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: "Count Summary",
          data: data.map(d => d.value),
          backgroundColor: generateColors(data.length)
        }
      ]
    };

    csvData = data.map(d => ({
      Label: d.label,
      Value: d.value
    }));
  } else if (xAxis && yAxis) {
    const labels = data.map(doc => doc[xAxis] ?? "undefined");
    const values = data.map(doc => Number(doc[yAxis]) || 0);

    chartData = {
      labels,
      datasets: [
        {
          label: `${yAxis} by ${xAxis}`,
          data: values,
          backgroundColor: generateColors(labels.length)
        }
      ]
    };

    csvData = data.map(doc => ({
      [xAxis]: doc[xAxis],
      [yAxis]: doc[yAxis]
    }));
  } else {
    return null;
  }

  const handleDownloadCSV = () => {
    downloadCSV(csvData, "pie-chart-data.csv");
  };

  const handleDownloadPNG = () => {
    const url = chartRef.current?.toBase64Image?.();
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "pie-chart.png";
      a.click();
    }
  };

  return (
    <div>
      <Pie ref={chartRef} data={chartData} />
      <button onClick={handleDownloadCSV} style={{ marginTop: "1rem" }}>
        📊 Download CSV
      </button>
      <button onClick={handleDownloadPNG} style={{ marginTop: "0.5rem" }}>
        📥 Download PNG
      </button>
    </div>
  );
});

// Generate a dynamic array of colors
const generateColors = (count) => {
  const baseColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8B0000', '#2E8B57',
    '#FFD700', '#00CED1', '#C71585', '#40E0D0'
  ];

  while (baseColors.length < count) {
    baseColors.push(...baseColors);
  }

  return baseColors.slice(0, count);
};

export default PieChartBuilder;
