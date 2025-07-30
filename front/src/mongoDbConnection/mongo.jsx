import React, { useState, useEffect } from "react";
import axios from "axios";
import "react-querybuilder/dist/query-builder.css";

import ConnectionManager from "./components/ConnectionManager";
import CollectionSelector from "./components/CollectionSelector";
import QueryBuilderSection from "./components/QueryBuilderSection";
import ChartOptions from "./components/ChartOptions";
import ChartTypeSelector from "./components/ChartTypeSelector";
import CountModeConfig from "./components/CountModeConfig";
import ChartDisplay from "./components/ChartDisplay";
import PaginatedTable from "./components/PaginatedTable";

import "./mongoStyle.css";

const App = ({ onConnect, onDisconnect }) => {
  const [uri, setUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [fields, setFields] = useState([]);
  const [query, setQuery] = useState({ combinator: "and", rules: [] });
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState(new Set(["line"]));
  const [sizeField, setSizeField] = useState("");
  const [countMode, setCountMode] = useState(false);
    const [user, setUser] = useState(null);

  const [countConfigs, setCountConfigs] = useState([
    {
      label: "",
      targetField: "",
      combinator: "and",
      conditions: [{ field: "", operator: "=", value: "" }]
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("mongoConnection");
    if (saved) {
      const stored = JSON.parse(saved);
      setUri(stored.uri);
      setDbName(stored.dbName);

      (async () => {
        try {
          const res = await axios.post("http://localhost:8000/mongo/reconnect", stored, { withCredentials: true });
          setCollections(res.data);
          setIsConnected(true);
          localStorage.setItem("connectedOrNot", "true");
          onConnect && onConnect();
        } catch (err) {
          console.error("Reconnection failed:", err);
          localStorage.removeItem("mongoConnection");
          setIsConnected(false);
          localStorage.setItem("connectedOrNot", "false");
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
    if (!uri || !dbName) return;
    try {
      await fetchCollections(uri, dbName);
      localStorage.setItem("mongoConnection", JSON.stringify({ uri, dbName }));
      localStorage.setItem("connectedOrNot", "true");
      setIsConnected(true);
      onConnect && onConnect();
    } catch {
      alert("Connection failed");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("mongoConnection");
    localStorage.setItem("connectedOrNot", "false");
    setUri("");
    setDbName("");
    setCollections([]);
    setSelectedCollections("");
    setDocuments([]);
    setFields([]);
    setQuery({ combinator: "and", rules: [] });
    setXAxis("");
    setYAxis("");
    setGroupBy("");
    setIsConnected(false);
    onDisconnect && onDisconnect();
  };

  const fetchCollections = async (currentUri = uri, currentDb = dbName) => {
    const res = await axios.post("http://localhost:8000/mongo/collections", { uri: currentUri, dbName: currentDb, type: "MongoDB" }, { withCredentials: true });
    setCollections(res.data);
  };

  const inferMongoType = (values = []) => {
  const defined = values.filter(v => v !== null && v !== undefined);
  if (defined.length === 0) return { type: "string", enum: [] };

  const typesCount = { number: 0, boolean: 0, date: 0, objectId: 0, string: 0 };

  const isDateString = str => typeof str === "string" && !isNaN(Date.parse(str));
  const isObjectIdString = str => typeof str === "string" && /^[a-f\d]{24}$/i.test(str);

  for (const v of defined) {
    if (typeof v === "boolean") typesCount.boolean++;
    else if (typeof v === "number") typesCount.number++;
    else if (typeof v === "string") {
      if (isDateString(v)) typesCount.date++;
      else if (isObjectIdString(v)) typesCount.objectId++;
      else typesCount.string++;
    } else if (typeof v === "object") {
      if (v?.$oid) typesCount.objectId++;
      else if (v?.$date) typesCount.date++;
      else if (v?.$numberInt || v?.$numberLong || v?.$numberDouble || v?.$numberDecimal) typesCount.number++;
    }
  }

  const sortedTypes = Object.entries(typesCount).sort((a, b) => b[1] - a[1]);
  const type = sortedTypes[0][0] || "string";

  // Collect enum values if string/boolean and low cardinality
  const isEnumCandidate = ["string", "boolean"].includes(type) && new Set(defined).size <= 20;
  const enumValues = isEnumCandidate
    ? Array.from(new Set(defined.filter(v => typeof v === type)))
    : [];

  return { type, enum: enumValues };
};



  const fetchDocuments = async () => {
  try {
    const response = await fetch("http://localhost:8000/mongo/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uri, dbName, collectionNames: selectedCollections }),
    });

    if (!response.ok) throw new Error("Response not OK");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let fullText = "";
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        fullText += decoder.decode(value, { stream: !done });
      }
    }

    const parsed = JSON.parse(fullText);
    setDocuments(parsed);

    // Step 1: Collect sample values for each field
    const fieldSamples = {};
    parsed.slice(0, 20).forEach(doc => {
      for (const [key, value] of Object.entries(doc)) {
        if (!fieldSamples[key]) fieldSamples[key] = [];
        fieldSamples[key].push(value);
      }
    });

    // Step 2: Infer type + possible enum values
    const inferred = Object.entries(fieldSamples).map(([name, values]) => {
      const { type, enum: enumValues } = inferMongoType(values);
      return {
        name,
        label: name,
        value: name,
        type,
        key: name,
        enum: enumValues,
      };
    });

    setFields(inferred);
  } catch (err) {
    alert("Failed to load documents");
    console.error("Fetch error:", err);
  }
};




  const convertToMongoFilter = node => {
    if (!node) return {};
    const combinator = node.combinator === "or" ? "$or" : "$and";
    const getFieldType = field => fields.find(f => f.name === field)?.type || "string";
    const cast = (field, value) => {
      const type = getFieldType(field);
      if (type === "number") return Number(value);
      if (type === "boolean") return value === "true" || value === true;
      if (type === "date") return new Date(value);
      return value;
    };
    const rules = node.rules.map(rule => {
      if (rule.rules) return convertToMongoFilter(rule);
      const { field, operator, value } = rule;
      const typedValue = cast(field, value);
      switch (operator) {
        case "=": return { [field]: typedValue };
        case "!=": return { [field]: { $ne: typedValue } };
        case "<": return { [field]: { $lt: typedValue } };
        case "<=": return { [field]: { $lte: typedValue } };
        case ">": return { [field]: { $gt: typedValue } };
        case ">=": return { [field]: { $gte: typedValue } };
        case "contains": return { [field]: { $regex: typedValue, $options: "i" } };
        case "beginsWith": return { [field]: { $regex: "^" + typedValue, $options: "i" } };
        case "endsWith": return { [field]: { $regex: typedValue + "$", $options: "i" } };
        default: return {};
      }
    });
    return { [combinator]: rules };
  };

  const fetchFilteredDocuments = async () => {
    const filter = convertToMongoFilter(query);
    try {
      const res = await axios.post("http://localhost:8000/mongo/query", { uri, dbName,  collectionNames: selectedCollections, filter });
      setDocuments(res.data);
    } catch (err) {
      alert("Failed to run query");
      console.error(err);
    }
  };

  const cast = v => v === "true" ? true : v === "false" ? false : isNaN(Number(v)) ? v : Number(v);

  const matchCondition = (doc, { field, operator, value }) => {
    const val = doc[field];
    const casted = cast(value);
    switch (operator) {
      case "=": return val === casted;
      case "!=": return val !== casted;
      case "contains": return typeof val === "string" && val.includes(casted);
      case "beginsWith": return typeof val === "string" && val.startsWith(casted);
      case "endsWith": return typeof val === "string" && val.endsWith(casted);
      default: return false;
    }
  };

  const applyMultiCounts = (docs, configs) => configs.map(cfg => {
    const filtered = docs.filter(doc => {
      const checks = cfg.conditions.map(cond => matchCondition(doc, cond));
      return cfg.combinator === "or" ? checks.some(Boolean) : checks.every(Boolean);
    });
    return { label: cfg.label || cfg.targetField, value: filtered.filter(doc => doc[cfg.targetField] !== undefined).length };
  });
 const getOperators = field => {
  const makeOps = ops => ops.map(op => ({ name: op, label: op }));

  const type = typeof field === "object" && field?.type
    ? field.type
    : fields.find(f => f.name === field)?.type || "string";

  switch (type) {
    case "number":
    case "date":
      return makeOps(["=", "!=", "<", "<=", ">", ">="]);
    case "boolean":
    case "objectId":
      return makeOps(["=", "!="]);
    default:
      return makeOps(["=", "!=", "contains", "beginsWith", "endsWith"]);
  }
};



  const CustomValueSelector = ({ options, value, handleOnChange }) => (
    <select value={value} onChange={e => handleOnChange(e.target.value)}>
      {options.map((opt, i) => (
        <option key={`${opt.name || opt.value || opt.label}-${i}`} value={opt.name || opt.value}>
          {opt.label || opt.name || opt.value}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mongo-viewer">
      <h2>MongoDB Viewer</h2>

      <ConnectionManager
        isConnected={isConnected}
        uri={uri}
        dbName={dbName}
        setUri={setUri}
        setDbName={setDbName}
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
      />

      {collections.length > 0 && (
        <CollectionSelector
          collections={collections}
  selectedCollections={selectedCollections}
  setSelectedCollections={setSelectedCollections}
  fetchDocuments={fetchDocuments}
        />
      )}

      {fields.length > 0 && (
       <QueryBuilderSection
  fields={fields}
  query={query}
  setQuery={setQuery}
  getOperators={field => getOperators(field, fields)}
  CustomValueSelector={CustomValueSelector}
  fetchFilteredDocuments={fetchFilteredDocuments}
/>

      )}

      {fields.length > 0 && (
        <ChartOptions
          fields={fields}
          xAxis={xAxis}
          setXAxis={setXAxis}
          yAxis={yAxis}
          setYAxis={setYAxis}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          sizeField={sizeField}
          setSizeField={setSizeField}
        />
      )}
{isConnected && (
  <>      
  <ChartTypeSelector selectedCharts={selectedCharts} setSelectedCharts={setSelectedCharts} />

      <CountModeConfig
        countMode={countMode}
        setCountMode={setCountMode}
        countConfigs={countConfigs}
        setCountConfigs={setCountConfigs}
        fields={fields}
      />

      <ChartDisplay
        documents={documents}
        fields={fields}
        xAxis={xAxis}
        yAxis={yAxis}
        groupBy={groupBy}
        sizeField={sizeField}
        selectedCharts={selectedCharts}
        countMode={countMode}
        countConfigs={countConfigs}
        applyMultiCounts={applyMultiCounts}
        user={user}
      />
      </>
      
)}
{documents.length > 0 && (
  <PaginatedTable documents={documents} />
)}

    </div>
  );
};

export default App;
