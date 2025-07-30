import React from "react";
import { QueryBuilder } from "react-querybuilder";

function QueryBuilderSection({ fields, query, setQuery, fetchFilteredData }) {
  return (
    <div className="pg-query-builder">
      <h3>Query Builder</h3>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      <button className="pg-query-button" onClick={fetchFilteredData}>Run Query</button>
    </div>
  );
}

export default QueryBuilderSection;
