// components/QueryBuilderSection.jsx
import React from "react";
import { QueryBuilder } from "react-querybuilder";

const QueryBuilderSection = ({ fields, query, setQuery, getOperators, CustomValueSelector, fetchFilteredDocuments }) => (
  <div className="query-builder-container mt-4 p-3 border rounded shadow-sm bg-light">
  <h3 className="mb-3">Build Your Query</h3>
  <QueryBuilder
 
    fields={fields}
    query={query}
    onQueryChange={q => setQuery(q)}
    getOperators={getOperators}
    controlElements={{ valueSelector: CustomValueSelector }}
  />
  <div className="mt-3">
    <button className="btn btn-success px-4 py-2" onClick={fetchFilteredDocuments}>
      Run Query
    </button>
  </div>
</div>

);

export default QueryBuilderSection;
