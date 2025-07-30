import { useEffect, useState } from "react";

const useAutoConnect = (autoConnect, savedDB, connectFunction) => {
  const [status, setStatus] = useState("idle"); // "idle", "connecting", "connected", "error"

  useEffect(() => {
    const tryConnect = async () => {
      if (!autoConnect || !savedDB || typeof connectFunction !== "function") return;

      setStatus("connecting");

      try {
        await connectFunction(savedDB);
        setStatus("connected");
      } catch (err) {
        console.error("Auto-connect failed:", err);
        setStatus("error");
      }
    };

    tryConnect();
  }, [autoConnect, savedDB, connectFunction]);

  return status; // optionally return setStatus too if needed
};

export default useAutoConnect;
