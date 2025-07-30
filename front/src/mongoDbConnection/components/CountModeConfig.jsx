import React from "react";

const CountModeConfig = ({ countMode, setCountMode, countConfigs, setCountConfigs, fields }) => {
  const handleConfigChange = (cfgIdx, key, value) => {
    const updated = [...countConfigs];
    updated[cfgIdx][key] = value;
    setCountConfigs(updated);
  };

  const handleConditionChange = (cfgIdx, condIdx, key, value) => {
    const updated = [...countConfigs];
    updated[cfgIdx].conditions[condIdx][key] = value;
    setCountConfigs(updated);
  };

  const addCondition = (cfgIdx) => {
    const updated = [...countConfigs];
    updated[cfgIdx].conditions.push({ field: "", operator: "=", value: "" });
    setCountConfigs(updated);
  };

  const removeCondition = (cfgIdx, condIdx) => {
    const updated = [...countConfigs];
    updated[cfgIdx].conditions.splice(condIdx, 1);
    setCountConfigs(updated);
  };

  const removeCountRule = (cfgIdx) => {
    const updated = countConfigs.filter((_, i) => i !== cfgIdx);
    setCountConfigs(updated);
  };

  const addCountRule = () => {
    setCountConfigs(prev => [
      ...prev,
      {
        label: "",
        targetField: "",
        combinator: "and",
        conditions: [{ field: "", operator: "=", value: "" }]
      }
    ]);
  };

  return (
    <div className="count-mode-options" style={{ marginTop: "30px" }}>
      <label>
        <input
          type="checkbox"
          checked={countMode}
          onChange={() => {
            setCountMode(prev => !prev);
            setCountConfigs([
              {
                label: "",
                targetField: "",
                combinator: "and",
                conditions: [{ field: "", operator: "=", value: "" }]
              }
            ]);
          }}
        />
        Enable Count Mode (Multi-Pie)
      </label>

      {countMode && (
        <div style={{ marginTop: "15px" }}>
          <strong>Count Rules:</strong>
          {countConfigs.map((cfg, cfgIdx) => (
            <div key={cfgIdx} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
              <label>
                Label (optional):
                <input
                  type="text"
                  value={cfg.label}
                  onChange={e => handleConfigChange(cfgIdx, "label", e.target.value)}
                />
              </label>

              <label style={{ marginLeft: "20px" }}>
                Target Field to Count:
                <select
                  value={cfg.targetField}
                  onChange={e => handleConfigChange(cfgIdx, "targetField", e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {fields.map(f => (
                    <option key={f.name} value={f.name}>{f.label}</option>
                  ))}
                </select>
              </label>

              <label style={{ marginLeft: "20px" }}>
                Combine Conditions With:
                <select
                  value={cfg.combinator}
                  onChange={e => handleConfigChange(cfgIdx, "combinator", e.target.value)}
                >
                  <option value="and">AND</option>
                  <option value="or">OR</option>
                </select>
              </label>

              <div style={{ marginTop: "10px" }}>
                <strong>Conditions:</strong>
                {cfg.conditions.map((cond, condIdx) => (
                  <div key={condIdx} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <select
                      value={cond.field}
                      onChange={e => handleConditionChange(cfgIdx, condIdx, "field", e.target.value)}
                    >
                      <option value="">-- Field --</option>
                      {fields.map(f => (
                        <option key={f.name} value={f.name}>{f.label}</option>
                      ))}
                    </select>

                    <select
                      value={cond.operator}
                      onChange={e => handleConditionChange(cfgIdx, condIdx, "operator", e.target.value)}
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value="contains">contains</option>
                      <option value="beginsWith">beginsWith</option>
                      <option value="endsWith">endsWith</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={e => handleConditionChange(cfgIdx, condIdx, "value", e.target.value)}
                    />

                    <button onClick={() => removeCondition(cfgIdx, condIdx)}>❌</button>
                  </div>
                ))}
                <button onClick={() => addCondition(cfgIdx)}>➕ Add Condition</button>
              </div>

              <button style={{ marginTop: "10px" }} onClick={() => removeCountRule(cfgIdx)}>
                🗑 Remove Count Rule
              </button>
            </div>
          ))}

          <button onClick={addCountRule}>➕ Add Count Rule</button>
        </div>
      )}
    </div>
  );
};

export default CountModeConfig;