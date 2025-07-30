import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDatabases = ({ onSelectDatabase }) => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const res = await axios.get("http://localhost:8000/databases", {
          withCredentials: true,
        });

        // ✅ Ensure _id is kept in unique list
        const seen = new Set();
        const uniqueDatabases = [];
        res.data.forEach((db) => {
          const key = `${db.Name}-${db.Type}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueDatabases.push(db); // preserves _id
          }
        });

        setDatabases(uniqueDatabases);
      } catch (err) {
        setError("Failed to fetch databases.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  const handleDelete = async (dbId) => {
    if (!window.confirm("Are you sure you want to delete this database?")) return;

    try {
      await axios.delete(`http://localhost:8000/databases/${dbId}`, {
        withCredentials: true,
      });

      setDatabases((prev) => prev.filter((db) => db._id !== dbId));
    } catch (err) {
      console.error("Failed to delete DB", err);
      alert("Failed to delete database.");
    }
  };

  if (loading)
    return <p style={{ padding: "1rem", fontFamily: "Segoe UI" }}>Loading databases...</p>;
  if (error)
    return (
      <p
        style={{
          padding: "1rem",
          color: "#dc2626",
          fontFamily: "Segoe UI",
        }}
      >
        {error}
      </p>
    );

  return (
    <div
      style={{
        padding: "1.5rem",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {databases.length === 0 ? (
        <p>No databases found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border={2}
            style={{
              minWidth: "100%",
              borderCollapse: "collapse",
              border: "2px solid #d1d5db",
              color: "black",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={cellStyle}>#</th>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Type</th>
                <th style={cellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {databases.map((db, index) => (
                <tr
                  key={db._id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle} onClick={() => onSelectDatabase && onSelectDatabase(db)}>
                    {db.Name}
                  </td>
                  <td style={cellStyle} onClick={() => onSelectDatabase && onSelectDatabase(db)}>
                    {db.Type}
                  </td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => handleDelete(db._id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        color: "#dc2626",
                      }}
                      title="Delete database"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const cellStyle = {
  border: "1px solid #d1d5db",
  padding: "0.5rem 1rem",
  textAlign: "left",
};

export default UserDatabases;
