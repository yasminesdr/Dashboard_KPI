import React from "react";

const isReachableThroughSelected = (graph, selectedSet, candidate) => {
  const queue = Array.from(selectedSet);
  const visited = new Set(queue);
  while (queue.length) {
    const current = queue.shift();
    if (current === candidate) return true;
    for (const neighbor of graph[current] || []) {
      if (!visited.has(neighbor) && (selectedSet.has(neighbor) || neighbor === candidate)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
};

const getJoinableSuggestions = (selected, graph) => {
  if (selected.length === 0) return Object.keys(graph);
  const selectedSet = new Set(selected);
  return Object.keys(graph).filter(t =>
    !selectedSet.has(t) && isReachableThroughSelected(graph, selectedSet, t)
  );
};

const TableSelector = ({ tables, selectedTables, setSelectedTables, joinGraph, fetchData }) => (
  <div style={{ marginTop: "20px" }}>
    <label>Select tables (CTRL+Click):</label>
    <select
      multiple
      value={selectedTables}
      onChange={e => {
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
    <button onClick={fetchData}>Load Data</button>
  </div>
);

export default TableSelector;
