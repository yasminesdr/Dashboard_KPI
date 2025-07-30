import React from "react";
import { QueryBuilder } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

const QuerySection = ({ fields, query, setQuery, fetchData }) => (
  <div style={{ marginTop: "20px" }}>
    <h3>Build a Query</h3>
    <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
    <button onClick={fetchData}>Apply Query</button>
  </div>
);

export default QuerySection;
