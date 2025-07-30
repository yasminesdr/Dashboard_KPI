import React, { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

import "./loginPage.css";
import BoomiLogo from "../assets/boomi-logo.svg";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/forgot', { email });
      setMessage('Check your email to reset your password.');
    } catch (err) {
      setMessage('Email not found or error occurred.');
    }
  };

  return (


 <div className="login-container">
      {/* Left section */}
      <div className="login-left">
        <h2>Reset password</h2>

          <form onSubmit={handleSubmit}>
      <input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required />
      
      <button type="submit">Send Reset Link</button>
      <p>{message}</p>
    </form>

        <div className="extra-links">
          <Link to="/login" >Login. </Link>
        
            Don’t have an account? <Link to="/register" >Sign up for free.</Link>
          
        </div>
      </div>

      {/* Right section */}
      <div className="login-right">
        <div className="promo">
          <h2>Manage KPIs Across All Your Databases</h2>
          <p>
                      Connect to multiple data sources like MongoDB, MySQL, and PostgreSQL. Visualize metrics, track performance, and make data-driven decisions from a unified dashboard.

          </p>
          <button className="learn-btn">Learn More ›</button>
        </div>
      </div>
    </div>




  
  );
};

export default ForgotPasswordPage;
