import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/reset/${token}`, form);
      setMessage('Password reset successful.');
    } catch (err) {
      setMessage('Error resetting password or invalid token.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="password" type="password" onChange={handleChange} placeholder="New Password" required />
      <input name="confirm" type="password" onChange={handleChange} placeholder="Confirm Password" required />
      <button type="submit">Reset Password</button>
      <p>{message}</p>
    </form>
  );
};

export default ResetPasswordPage;
