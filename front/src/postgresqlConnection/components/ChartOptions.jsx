import React from "react";

function ChartOptions({ fields, xAxis, yAxis, groupBy, sizeField, setXAxis, setYAxis, setGroupBy, setSizeField }) {
  return (
    <div className="pg-chart-options">
      <h3>Dynamic Chart Options</h3>
      <label>
        X-Axis:
        <select value={xAxis} onChange={e => setXAxis(e.target.value)}>
          <option value="">-- Select --</option>
          {fields.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
        </select>
      </label>
      <label>
        Y-Axis:
        <select value={yAxis} onChange={e => setYAxis(e.target.value)}>
          <option value="">-- Select --</option>
          {fields.filter(f => f.type === "number").map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
        </select>
      </label>
      <label>
        Group By:
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
          <option value="">-- None --</option>
          {fields.filter(f => f.type === "string").map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
        </select>
      </label>
      <label>
        Size Field (for Bubble):
        <select value={sizeField} onChange={e => setSizeField(e.target.value)}>
          <option value="">-- Select --</option>
          {fields.filter(f => f.type === "number").map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
        </select>
      </label>
    </div>
  );
}

export default ChartOptions;
