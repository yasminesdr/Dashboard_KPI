import { useState, useEffect } from "react";
import axios from "axios";
import ConnectionForm from "./components/ConnectionForm";
import TableSelector from "./components/TableSelector";
import QuerySection from "./components/QuerySection";
import ChartOptions from "./components/ChartOptions";
import ChartTypeSelector from "./components/ChartTypeSelector";
import ChartRenderer from "./components/ChartRenderer";
import "./mysqlStyle.css";
import PaginatedTable from "./components/PaginatedTable";

const App = ({ onConnect, onDisconnect }) => {
  const [config, setConfig] = useState({ host: "localhost", port: "3306", user: "", password: "", database: "" });
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [query, setQuery] = useState({ combinator: "and", rules: [] });
  const [joinGraph, setJoinGraph] = useState({});
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [sizeField, setSizeField] = useState("");
  const [selectedCharts, setSelectedCharts] = useState(new Set(["line"]));
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);

  // Handle reconnect on page reload
  useEffect(() => {
    const saved = localStorage.getItem("mysqlConnection");
    const connectedFlag = localStorage.getItem("connectedOrNot");
    if (saved && connectedFlag === "true") {
      const stored = JSON.parse(saved);
      (async () => {
        try {
          const res = await axios.post("http://localhost:8000/mysql/reconnect", stored, { withCredentials: true });
          setTables(res.data);
          setConfig(stored);
          setJoinGraph(stored);
          setIsConnected(true);
          onConnect();
        } catch (err) {
          console.error("Reconnection failed:", err);
          localStorage.removeItem("mysqlConnection");
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
      await fetchTables(config);
      localStorage.setItem("mysqlConnection", JSON.stringify(config));
      localStorage.setItem("connectedOrNot", "true");
      setIsConnected(true);
      onConnect();
    } catch (err) {
      
      alert("Connection failed");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("mysqlConnection");
    localStorage.setItem("connectedOrNot", "false");
    setConfig({ host: "localhost", port: "3306", user: "", password: "", database: "" });
    setTables([]);
    setSelectedTables([]);
    setJoinGraph({});
    setData([]);
    setFields([]);
    setQuery({ combinator: "and", rules: [] });
    setXAxis("");
    setYAxis("");
    setGroupBy("");
    setIsConnected(false);
    onDisconnect();
  };

  const fetchTables = async (conf = config) => {
    const res = await axios.post("http://localhost:8000/mysql/tables", conf, { withCredentials: true });
    setTables(res.data);

    const joinRes = await axios.post("http://localhost:8000/mysql/join-graph", conf);
    setJoinGraph(joinRes.data);
  };

  const escapeValue = val => typeof val === "string" ? `'${val.replace(/'/g, "''")}'` : val;

  const buildSQL = (node) => {
    if (!node) return "";
    if (node.rules) {
      const conditions = node.rules.map(buildSQL).filter(Boolean);
      return conditions.length ? `(${conditions.join(` ${node.combinator?.toUpperCase() || "AND"} `)})` : "";
    }
    const { field, operator, value } = node;
    if (!field || value === undefined || value === "") return "";
    const sqlOperators = {
      "=": "=",
      "!=": "!=",
      "<": "<",
      "<=": "<=",
      ">": ">",
      ">=": ">=",
      contains: "LIKE",
      beginsWith: "LIKE",
      endsWith: "LIKE"
    };
    let val = value;
    if (["contains", "beginsWith", "endsWith"].includes(operator)) {
      val = operator === "contains" ? `%${value}%` : operator === "beginsWith" ? `${value}%` : `%${value}`;
    }
    return `\`${field}\` ${sqlOperators[operator] || "="} ${escapeValue(val)}`;
  };

  const fetchData = async () => {
    try {
      const whereClause = buildSQL(query);
      const res = await axios.post("http://localhost:8000/mysql/data", {
        ...config,
        tables: selectedTables,
        query: whereClause
      });
      setData(res.data);
      if (res.data.length > 0) {
        const inferredFields = Object.entries(res.data[0]).map(([key, val]) => ({
          name: key,
          label: key,
          type: typeof val === "number" ? "number" : typeof val === "boolean" ? "boolean" : "string"
        }));
        setFields(inferredFields);
      }
    } catch (err) {
      alert("Error fetching data");
    }
  };

  return (
    <div className="mysql-viewer">
      <h2>MySQL Multi-Table Viewer</h2>
      <ConnectionForm
        config={config}
        setConfig={setConfig}
        isConnected={isConnected}
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
      />

      {tables.length > 0 && (
        <TableSelector
          tables={tables}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
          joinGraph={joinGraph}
          fetchData={fetchData}
        />
      )}

      {fields.length > 0 && (
        <>
          <QuerySection
            fields={fields}
            query={query}
            setQuery={setQuery}
            fetchData={fetchData}
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

      {data.length > 0 && xAxis && yAxis && (
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
};

export default App;
