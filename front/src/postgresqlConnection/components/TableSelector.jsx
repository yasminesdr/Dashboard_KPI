import React from "react";

function TableSelector({ tables, selectedTables, setSelectedTables, joinGraph, fetchPostgresMultiData }) {
  const getJoinableSuggestions = (selected, graph) => {
    if (selected.length === 0) return [];
    const joinable = new Set();

    for (const table of selected) {
      if (graph[table]) {
        graph[table].forEach(neighbor => {
          if (!selected.includes(neighbor)) {
            joinable.add(neighbor);
          }
        });
      }
    }

    return Array.from(joinable);
  };

  return (
    <div className="pg-tables-section">
      <label>Select tables (CTRL+Click):</label>
      <select
        multiple
        value={selectedTables}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
          setSelectedTables(selected);
        }}
      >
        {tables.map(t => (
          <option
            key={t}
            value={t}
            disabled={
              selectedTables.length > 0 &&
              !getJoinableSuggestions(selectedTables, joinGraph).includes(t) &&
              !selectedTables.includes(t)
            }
          >
            {t}
          </option>
        ))}
      </select>
      <button onClick={fetchPostgresMultiData}>Load Data</button>
    </div>
  );
}

export default TableSelector;
