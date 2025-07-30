import React, { useState, useEffect } from "react";
import MongoConnection from "../mongoDbConnection/mongo";
import MysqlConnection from '../mysqlDbConnection/mysqlConnection';
import PostgresqlConnection from '../postgresqlConnection/postgresqlConnection';
import UserDatabases from "../UserDatabases";
import "./dashBoard.css";

const DashBoard = () => {
  const [selectedDB, setSelectedDB] = useState(""); // "mongo", "mysql", "postgresql"
  const [selectedSavedDB, setSelectedSavedDB] = useState(null); // full saved DB object
  const [autoConnect, setAutoConnect] = useState(false);
  const [connectedOrNot, setConnectedOrNot] = useState(false); // Proper state handling

  // Load saved DB type and config from localStorage on mount
  useEffect(() => {
    const storedDB = localStorage.getItem("selectedDB");
    const storedSavedDB = localStorage.getItem("selectedSavedDB");
    const storedConnected = localStorage.getItem("connectedOrNot");

    if (storedDB) setSelectedDB(storedDB);

    if (storedSavedDB) {
      try {
        const parsedDB = JSON.parse(storedSavedDB);
        setSelectedSavedDB(parsedDB);
        if (storedDB) setAutoConnect(true);
      } catch (err) {
        console.error("Invalid saved DB JSON:", err);
      }
    }

    // Convert string to boolean
    setConnectedOrNot(storedConnected === "true");
  }, []);

  // Called when a saved DB is clicked
  const handleSavedDBSelect = (db) => {
    setSelectedSavedDB(db);
    localStorage.setItem("selectedSavedDB", JSON.stringify(db));

    let dbType = "";
    switch (db.Type.toLowerCase()) {
      case "mongo":
      case "mongodb":
        dbType = "mongo";
        break;
      case "mysql":
        dbType = "mysql";
        break;
      case "postgresql":
      case "postgre":
        dbType = "postgresql";
        break;
      default:
        dbType = "";
    }

    setSelectedDB(dbType);
    localStorage.setItem("selectedDB", dbType);
    setAutoConnect(true);
  };

  // Called when user manually clicks a DB button
  const handleManualDBSelection = (type) => {
    setSelectedDB(type);
    setSelectedSavedDB(null);
    localStorage.setItem("selectedDB", type);
    localStorage.removeItem("selectedSavedDB");
    setAutoConnect(false);
  };
const handleConnected = () => {
  setConnectedOrNot(true);
  localStorage.setItem("connectedOrNot", "true");
};
const handleDisconnected = () => {
  setConnectedOrNot(false);
  localStorage.setItem("connectedOrNot", "false");
};
  // Render the correct connection component
  const renderConnectionComponent = () => {
  const props = {
    savedDB: selectedSavedDB,
  autoConnect,
  onConnect: handleConnected,
  onDisconnect: handleDisconnected, // Pass the callback here
  };

  switch (selectedDB) {
    case "mongo":
      return <MongoConnection {...props} />;
    case "mysql":
      return <MysqlConnection {...props} />;
    case "postgresql":
      return <PostgresqlConnection {...props} />;
    default:
      return null;
  }
};


  return (
    <div className="dash-container">
      <div className="dash-left">
        <div className="db-card">
          <h2>Connect to a Database</h2>
          <p className="db-description">
            To begin visualizing your data, please choose a database type and establish a connection.
          </p>

          {!connectedOrNot && (
            <>
              <div className="db-selector">
                <button onClick={() => handleManualDBSelection("mongo")}>MongoDB</button>
                <button onClick={() => handleManualDBSelection("mysql")}>MySQL</button>
                <button onClick={() => handleManualDBSelection("postgresql")}>PostgreSQL</button>
              </div>

              {selectedDB && (
                <p className="selected-db">
                  Selected Database: <strong>{selectedDB.toUpperCase()}</strong>
                </p>
              )}
            </>
          )}

          <div className="db-component">{renderConnectionComponent()}</div>

          {!connectedOrNot && (
            <UserDatabases onSelectDatabase={handleSavedDBSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
