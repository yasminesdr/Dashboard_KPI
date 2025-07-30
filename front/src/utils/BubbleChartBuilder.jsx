import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import { downloadCSV } from '../utils/exportCSV';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

const BubbleChartBuilder = forwardRef(({ data, xAxis, yAxis, sizeField, groupBy }, ref) => {
  const chartRef = useRef();

  // Expose Chart.js instance and toBase64Image method to parent
  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
    chartInstance: chartRef.current
  }));

  if (!data || !xAxis || !yAxis || !sizeField) return null;

  const groups = groupBy
    ? [...new Set(data.map(row => row[groupBy]))]
    : ["All"];

  const datasets = groups.map((group, i) => {
    const groupData = groupBy
      ? data.filter(row => row[groupBy] === group)
      : data;

    return {
      label: group,
      data: groupData.map(row => ({
        x: Number(row[xAxis]),
        y: Number(row[yAxis]),
        r: Math.max(3, Number(row[sizeField]) / 5)
      })),
      backgroundColor: `hsl(${i * 60}, 70%, 60%)`
    };
  });

  return (
    <>
    <Bubble
      ref={chartRef}
      data={{ datasets }}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Bubble Chart: ${yAxis} vs ${xAxis}`
          },
          legend: { position: "top" }
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
          </button></>
  );
});

export default BubbleChartBuilder;
