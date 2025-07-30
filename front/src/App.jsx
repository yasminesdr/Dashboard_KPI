import React from "react";
import LoginPage from "./authentification/LoginPage";
import RegisterPage from "./authentification/RegisterPage";
import ProtectedRoute from "./authentification/ProtectedRoute";
import ForgotPasswordPage from "./authentification/ForgotPasswordPage";
import Logout from "./authentification/Logout";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from "./navBar/navBar";
import { useAuth } from "./authentification/AuthContext";
import Welcome from "./welcomePage/welcome";
import DashBoard from "./dashBoard/dashBoard";
import EditProfile from "./authentification/EditUser";



// New component for "/" route redirect logic
const RootRedirect = () => {
  const { loggedIn, loading } = useAuth();

  if (loading) return null; // or a spinner

  return loggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Root path redirects depending on auth */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/welcome" element={<Welcome />} />
        {/* Logout route */}
        <Route path="/logout" element={<Logout />} />

        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
          <Route
    path="/edit-profile"
    element={
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    }
  />
      </Routes>
    </Router>
  );
}
