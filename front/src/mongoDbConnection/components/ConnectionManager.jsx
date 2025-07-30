// components/ConnectionManager.jsx
import React from "react";

const ConnectionManager = ({ isConnected, uri, dbName, setUri, setDbName, handleConnect, handleDisconnect }) => (
 <>
  {!isConnected ? (
    <>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="MongoDB URI"
          value={uri}
          onChange={e => setUri(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Database Name"
          value={dbName}
          onChange={e => setDbName(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleConnect}>
        Connect
      </button>
    </>
  ) : (
    <>
      <p className="mb-2">✅ Connected to <strong>{dbName}</strong></p>
      <button onClick={handleDisconnect} className="btn btn-danger disconnect-btn">Disconnect</button>
    </>
  )}
</>
);

export default ConnectionManager;
