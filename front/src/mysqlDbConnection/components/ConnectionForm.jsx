import React from "react";

const ConnectionForm = ({ config, setConfig, isConnected, handleConnect, handleDisconnect }) => (
  <div className="pg-config-form">
      <label>Host</label>
      <input placeholder="Host" value={config.host} onChange={e => setConfig({ ...config, host: e.target.value })} />
      <label>Port</label>
      <input placeholder="Port" value={config.port} onChange={e => setConfig({ ...config, port: e.target.value })} />
      <label>Username</label>
      <input placeholder="Username" value={config.user} onChange={e => setConfig({ ...config, user: e.target.value })} />
      <label>Password</label>
      <input placeholder="Password" type="password" value={config.password} onChange={e => setConfig({ ...config, password: e.target.value })} />
      <label>Database</label>
      <input placeholder="Database" value={config.database} onChange={e => setConfig({ ...config, database: e.target.value })} />

    {!isConnected ? (
     <button style={{ width: '83%' }} onClick={handleConnect}>Connect</button>

    ) : (
      
        <button  onClick={handleDisconnect}>Disconnect</button>
    )}
    </div>
  );


export default ConnectionForm;
