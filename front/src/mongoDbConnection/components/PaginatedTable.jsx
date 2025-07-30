import React, { useState, useMemo } from "react";

const PaginatedTable = ({ documents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const rowsPerPage = 10;

  const keys = useMemo(() => {
    const allKeys = new Set();
    documents.forEach(doc => Object.keys(doc).forEach(k => allKeys.add(k)));
    return Array.from(allKeys);
  }, [documents]);

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Filtering logic
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const globalMatch = !globalSearch || keys.some(key =>
        String(doc[key] ?? "").toLowerCase().includes(globalSearch.toLowerCase())
      );
      const columnMatch = Object.entries(columnFilters).every(([key, value]) =>
        String(doc[key] ?? "").toLowerCase().includes(value.toLowerCase())
      );
      return globalMatch && columnMatch;
    });
  }, [documents, globalSearch, columnFilters, keys]);

  // Sorting logic
  const sortedDocs = useMemo(() => {
    if (!sortConfig.key) return filteredDocs;
    return [...filteredDocs].sort((a, b) => {
      const valA = String(a[sortConfig.key] ?? "");
      const valB = String(b[sortConfig.key] ?? "");
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    });
  }, [filteredDocs, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedDocs.length / rowsPerPage);
  const paginatedDocs = sortedDocs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " 🔼" : " 🔽";
  };

  return (
    <div className="container mt-5">
      <h5 className="mb-3">Loaded Documents</h5>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Global Search..."
        value={globalSearch}
        onChange={e => {
          setGlobalSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm">
          <thead className="table-light">
            <tr>
              {keys.map((key, idx) => (
                <th
                  key={idx}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort(key)}
                >
                  {key}{renderSortIndicator(key)}
                </th>
              ))}
            </tr>
            <tr>
              {keys.map((key, idx) => (
                <th key={idx}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={`Filter ${key}`}
                    value={columnFilters[key] || ""}
                    onChange={e => handleColumnFilterChange(key, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedDocs.map((doc, i) => (
              <tr key={i}>
                {keys.map((key, idx) => (
                  <td key={idx}>{String(doc[key] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-outline-secondary btn-sm ms-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaginatedTable;
