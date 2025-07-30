import React from "react";

const chartTypes = ["line", "bar", "pie", "bubble", "doughnut", "scatter"];

const ChartTypeSelector = ({ selectedCharts, setSelectedCharts }) => (
  <div className="chart-type-selector d-flex flex-wrap gap-3 mb-3">
    {chartTypes.map(type => (
      <div className="form-check form-check-inline" key={type}>
        <input
          className="form-check-input"
          type="checkbox"
          id={`chart-${type}`}
          checked={selectedCharts.has(type)}
          onChange={() =>
            setSelectedCharts(prev => {
              const next = new Set(prev);
              next.has(type) ? next.delete(type) : next.add(type);
              return next;
            })
          }
        />
        <label className="form-check-label" htmlFor={`chart-${type}`}>
          {type}
        </label>
      </div>
    ))}
  </div>
);

export default ChartTypeSelector;
