import React from "react";

const ChartOptions = ({ fields, xAxis, yAxis, groupBy, sizeField, setXAxis, setYAxis, setGroupBy, setSizeField }) => (
 <div className="dynamic-chart-options mt-4 p-4 border rounded bg-light shadow-sm">
  <h3 className="mb-4">Dynamic Chart Options</h3>

  <div className="row">
    {/* X-Axis */}
    <div className="col-12 col-md-6 mb-3">
      <label className="form-label fw-semibold">X-Axis:</label>
      <select className="form-select" value={xAxis} onChange={e => setXAxis(e.target.value)}>
        <option value="">-- Select --</option>
        {fields.map(f => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>
    </div>

    {/* Y-Axis */}
    <div className="col-12 col-md-6 mb-3">
      <label className="form-label fw-semibold">Y-Axis:</label>
      <select className="form-select" value={yAxis} onChange={e => setYAxis(e.target.value)}>
        <option value="">-- Select --</option>
        {fields.filter(f => f.type === "number").map(f => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>
    </div>

    {/* Group By */}
    <div className="col-12 col-md-6 mb-3">
      <label className="form-label fw-semibold">Group By:</label>
      <select className="form-select" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
        <option value="">-- None --</option>
        {fields.filter(f => f.type === "string").map(f => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>
    </div>

    {/* Size Field */}
    <div className="col-12 col-md-6 mb-3">
      <label className="form-label fw-semibold">Size Field (for Bubble):</label>
      <select className="form-select" value={sizeField} onChange={e => setSizeField(e.target.value)}>
        <option value="">-- Select --</option>
        {fields.filter(f => f.type === "number").map(f => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>
    </div>
  </div>
</div>

);

export default ChartOptions;
