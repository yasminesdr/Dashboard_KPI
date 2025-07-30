


import React, { useState, useEffect } from "react";
import axios from "axios";
import "./postgresqlStyle.css";

// Components
import ConnectionForm from "./components/ConnectionForm";
import TableSelector from "./components/TableSelector";
import QueryBuilderSection from "./components/QueryBuilderSection";
import ChartOptions from "./components/ChartOptions";
import ChartTypeSelector from "./components/ChartTypeSelector";
import ChartRenderer from "./components/ChartRenderer";
import PaginatedTable from "./components/PaginatedTable";

function App({ onConnect, onDisconnect }) {
  const [config, setConfig] = useState({
    host: "localhost",
    port: "5432",
    user: "",
    password: "",
    database: ""
  });
  const [tables, setTables] = useState([]);
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [query, setQuery] = useState({ combinator: "and", rules: [] });
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [sizeField, setSizeField] = useState("");
  const [joinGraph, setJoinGraph] = useState({});
  const [selectedTables, setSelectedTables] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState(new Set([""]));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("pgConnection");
    const connectedFlag = localStorage.getItem("connectedOrNot");
    if (saved && connectedFlag === "true") {
      const savedConfig = JSON.parse(saved);
      (async () => {
        try {
          const res = await axios.post("http://localhost:8000/pg/reconnect", savedConfig, { withCredentials: true });
          setTables(res.data);
          setConfig(savedConfig);
          await fetchJoinGraph(savedConfig);
          setIsConnected(true);
          onConnect();
        } catch (err) {
          console.error("Reconnection failed:", err);
          localStorage.removeItem("pgConnection");
          localStorage.setItem("connectedOrNot", "false");
          setIsConnected(false);
          onDisconnect();
        }
      })();
    }
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8000/profile/me', {
          credentials: "include", // important for session cookies
        });
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  const handleConnect = async () => {
    try {
      await fetchTables();
      localStorage.setItem("pgConnection", JSON.stringify(config));
      localStorage.setItem("connectedOrNot", "true");
      setIsConnected(true);
      onConnect();
    } catch {
      // error is handled in fetchTables
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("pgConnection");
    localStorage.setItem("connectedOrNot", "false");
    setConfig({ host: "localhost", port: "5432", user: "", password: "", database: "" });
    setTables([]);
    setSelectedTables([]);
    setData([]);
    setFields([]);
    setQuery({ combinator: "and", rules: [] });
    setXAxis("");
    setYAxis("");
    setGroupBy("");
    setJoinGraph({});
    setIsConnected(false);
    onDisconnect();
  };

  const fetchTables = async (conf = config) => {
    try {
      const res = await axios.post("http://localhost:8000/pg/tables", conf, { withCredentials: true });
      setTables(res.data);
      await fetchJoinGraph(conf);
    } catch (err) {
      
      alert("Error fetching tables. Check your PostgreSQL credentials.");
      throw err;
    }
  };

  const fetchJoinGraph = async (conf = config) => {
    try {
      const res = await axios.post("http://localhost:8000/pg/join-graph", conf);
      setJoinGraph(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const inferType = val => {
    if (val === null || val === undefined) return "string";
    if (typeof val === "boolean") return "boolean";
    if (typeof val === "number") return "number";
    if (!isNaN(parseFloat(val)) && isFinite(val)) return "number";
    if (typeof val === "string" && !isNaN(Date.parse(val))) return "date";
    return "string";
  };

  const convertToSQLWhere = node => {
    if (!node) return "";
    const combinator = node.combinator === "or" ? "OR" : "AND";
    const getType = field => fields.find(f => f.name === field)?.type || "string";
    const cast = (field, value) => {
      const type = getType(field);
      switch (type) {
        case "number": return Number(value);
        case "boolean": return value === "true" || value === true;
        case "date": return new Date(value).toISOString();
        default: return value;
      }
    };
    const sqlEscape = val => {
      if (typeof val === "number") return val;
      if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
      return `'${String(val).replace(/'/g, "''")}'`;
    };
    const conditions = node.rules.map(rule => {
      if (rule.rules) return `(${convertToSQLWhere(rule)})`;
      const { field, operator, value } = rule;
      const typedValue = cast(field, value);
      switch (operator) {
        case "=": return `${field} = ${sqlEscape(typedValue)}`;
        case "!=": return `${field} != ${sqlEscape(typedValue)}`;
        case "<": return `${field} < ${sqlEscape(typedValue)}`;
        case "<=": return `${field} <= ${sqlEscape(typedValue)}`;
        case ">": return `${field} > ${sqlEscape(typedValue)}`;
        case ">=": return `${field} >= ${sqlEscape(typedValue)}`;
        case "contains": return `${field} ILIKE ${sqlEscape(`%${typedValue}%`)}`;
        case "beginsWith": return `${field} ILIKE ${sqlEscape(`${typedValue}%`)}`;
        case "endsWith": return `${field} ILIKE ${sqlEscape(`%${typedValue}`)}`;
        default: return "1=1";
      }
    });
    return conditions.join(` ${combinator} `);
  };

  const fetchFilteredData = async () => {
    const whereClause = convertToSQLWhere(query);
    try {
      const res = await axios.post("http://localhost:8000/pg/query", {
        ...config,
        table: selectedTables,
        where: whereClause,
        query
      });
      setData(res.data);
    } catch (err) {
      alert("Failed to run SQL query.");
      console.error(err);
    }
  };

  const fetchPostgresMultiData = async () => {
    const whereClause = convertToSQLWhere(query);
    try {
      const res = await axios.post("http://localhost:8000/pg/multi-data", {
        ...config,
        tables: selectedTables,
        query: whereClause
      });

      const sample = res.data[0] || {};
      const inferredFields = Object.entries(sample).map(([key, value]) => ({
        name: key,
        label: key,
        type: inferType(value)
      }));
      setFields(inferredFields);
      setData(res.data);
    } catch (err) {
      alert("Failed to load joined data.");
      console.error(err);
    }
  };

  return (
    <div className="pg-viewer-container">
      <h2>PostgreSQL Viewer</h2>

      <ConnectionForm
        config={config}
        setConfig={setConfig}
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {tables.length > 0 && (
        <TableSelector
          tables={tables}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
          joinGraph={joinGraph}
          fetchPostgresMultiData={fetchPostgresMultiData}
        />
      )}

      {fields.length > 0 && (
        <>
          <QueryBuilderSection
            fields={fields}
            query={query}
            setQuery={setQuery}
            fetchFilteredData={fetchFilteredData}
          />
          <ChartOptions
            fields={fields}
            xAxis={xAxis}
            yAxis={yAxis}
            groupBy={groupBy}
            sizeField={sizeField}
            setXAxis={setXAxis}
            setYAxis={setYAxis}
            setGroupBy={setGroupBy}
            setSizeField={setSizeField}
          />
          <ChartTypeSelector
            selectedCharts={selectedCharts}
            setSelectedCharts={setSelectedCharts}
          />
        </>
      )}
{isConnected && (
      <ChartRenderer
        data={data}
        fields={fields}
        xAxis={xAxis}
        yAxis={yAxis}
        groupBy={groupBy}
        sizeField={sizeField}
        selectedCharts={selectedCharts}
         user={user}
      />
      )}
             {isConnected && data.length > 0 && (
  <PaginatedTable documents={data} />
)}
    </div>
 
  );

  
}

export default App;




