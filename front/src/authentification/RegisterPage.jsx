import React, { useState , useEffect} from 'react';
import { Link ,useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./loginPage.css";
import BoomiLogo from "../assets/boomi-logo.svg";
const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', username: '', password: '', adminCode: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


   useEffect(() => {
    const checkAuth = async () => {
      try {
       
        const res = await axios.get('http://localhost:8000/check-auth', {
          withCredentials: true,
        });
        if (res.data.loggedIn) {
          navigate('/forgot'); 
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/register',form, {
  withCredentials: true
});
      setMessage('Check your email for verification.');
    } catch (err) {
      setMessage( 'Registration failed.');
    }
  };

  return (








 <div className="login-container">
      {/* Left section */}
      <div className="login-left">
        <h2>Manage KPIs Across All Your Databases</h2>

             <form onSubmit={handleSubmit}>
      <input name="email" type="email"onChange={handleChange} placeholder="Email" required />
      <input name="username" type="username" onChange={handleChange} placeholder="Username" required />
      <input name="password"  type="password" onChange={handleChange} placeholder="Password" required />
      <input name="adminCode" type="username" onChange={handleChange} placeholder="Admin Code (optional)" />
      <button type="submit">Register</button>
      <p>{message}</p>
    </form>

        <div className="extra-links">
          <Link to="/login" >Login  </Link>
        
          <Link to="/forgot" >Forgot your password</Link>
          
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

export default RegisterPage;