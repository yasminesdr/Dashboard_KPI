import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PublicRoute = ({ children }) => {
  const { loggedIn, loading } = useAuth();

  if (loading) return null;

  return loggedIn ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
