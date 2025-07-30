import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
  const navigate = useNavigate();
 useEffect(() => {
const performLogout = async () => {
      try {
        await axios.delete('http://localhost:8000/logout', { withCredentials: true });
                navigate('/login');

        console.log('Logged out successfully');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        navigate('/login');
      }
    };
    performLogout();
  });

}

export default Logout;