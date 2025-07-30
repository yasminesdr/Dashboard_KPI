import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8000/verify-email/${token}`)
      .then(() => setMessage('Email verified! You can now log in.'))
      .catch(() => setMessage('Invalid or expired token.'));
  }, [token]);

  return <p>{message}</p>;
};

export default VerifyEmail;
