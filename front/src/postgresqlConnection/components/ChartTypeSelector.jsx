import React from "react";

const chartTypes = ["line", "bar", "pie", "doughnut", "scatter"];

function ChartTypeSelector({ selectedCharts, setSelectedCharts }) {
  const toggleChart = type => {
    setSelectedCharts(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  return (
   <div className="chart-type-selector">
  {chartTypes.map(type => (
    <label key={type} className="chart-type-label form-check form-check-inline">
      <input
        type="checkbox"
        className="form-check-input"
        checked={selectedCharts.has(type)}
        onChange={() =>
          setSelectedCharts(prev => {
            const next = new Set(prev);
            next.has(type) ? next.delete(type) : next.add(type);
            return next;
          })
        }
      />
      <span className="form-check-label">{type}</span>
    </label>
  ))}
</div>

  );
}

export default ChartTypeSelector;
