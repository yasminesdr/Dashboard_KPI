import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Scatter } from "react-chartjs-2";
import { downloadCSV } from '../utils/exportCSV';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

const ScatterPlotBuilder = forwardRef(({ data, xAxis, yAxis, groupBy }, ref) => {
  const chartRef = useRef();

  useImperativeHandle(ref, () => ({
    toBase64Image: () => chartRef.current?.toBase64Image?.(),
    chartInstance: chartRef.current
  }));

  if (!data || !xAxis || !yAxis) return null;

  const groups = groupBy ? [...new Set(data.map(row => row[groupBy]))] : ["All"];
  const datasets = groups.map((group, i) => {
    const groupData = groupBy ? data.filter(row => row[groupBy] === group) : data;

    return {
      label: group,
      data: groupData.map(row => ({
        x: Number(row[xAxis]),
        y: Number(row[yAxis])
      })),
      backgroundColor: `hsl(${i * 60}, 70%, 60%)`
    };
  });

  return (
    <div>
      <Scatter
        ref={chartRef}
        data={{ datasets }}
        options={{
          responsive: true,
          plugins: {
            title: { display: true, text: `Scatter Plot: ${yAxis} vs ${xAxis}` },
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: context => {
                  const { x, y } = context.parsed;
                  return `X: ${x}, Y: ${y}`;
                }
              }
            }
          },
          scales: {
            x: { title: { display: true, text: xAxis }, type: "linear" },
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
      </button>
    </div>
  );
});

export default ScatterPlotBuilder;
