import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';
import "./loginPage.css";

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);

  const { checkAuth } = useAuth(); 

  useEffect(() => {
    const checkIfAlreadyLoggedIn = async () => {
      try {
        const res = await axios.get('http://localhost:8000/check-auth', {
          withCredentials: true,
        });
        if (res.data.loggedIn) {
          navigate('/dashboard'); 
        }
      } catch (err) {
        console.error('Auth check failed on mount:', err);
      }
    };

    checkIfAlreadyLoggedIn();
  }, [navigate]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/login', form, {
        withCredentials: true,
      });

      await checkAuth(); // ✅ updates context.loggedIn state
      setMessage('Logged in successfully!');
      navigate('/welcome'); // ✅ Redirect to dashboard
    } catch (err) {
      setMessage('Login failed. Check credentials.');
    }
  };

  return (
    <div className="login-container">
      {/* Left section */}
      <div className="login-left">
        <h2>Sign in to your KPI Dashboard</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Username <span className="required">(required)</span>
          </label>
          <input name="username" type="username" onChange={handleChange} placeholder="Username" required />

          <label>
            Password <span className="required">(required)</span>
          </label>
          <div className="password-wrapper">
            <input
              name="password"  onChange={handleChange}
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁 Show
            </button>
          </div>
          <p>{message}</p>
          <button type="submit" className="sign-in-btn">Sign In</button>
        </form>

        <div className="extra-links">
          <Link to="/forgot" >Reset your password. </Link>
        
            Don’t have an account? <Link to="/register" >Sign up for free.</Link>
          
        </div>
      </div>

      {/* Right section */}
      <div className="login-right">
      <div className="promo">
  <h2>Manage KPIs Across All Your Databases</h2>
  <p>
    Connect to multiple data sources like <strong>MongoDB</strong>, <strong>MySQL</strong>, and <strong>PostgreSQL</strong>. Visualize metrics, track performance, and make data-driven decisions from a unified dashboard.
  </p>
  <button className="learn-btn">Learn More</button>
</div>
      </div>
    </div>
  );
};

export default LoginPage;
