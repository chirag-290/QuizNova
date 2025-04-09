import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

   useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
         
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
      
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:5000/api/auth/me');
        
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        setToken(null);
      }
      
      setLoading(false);
    };

    loadUser();
  }, [token]);
 
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        toast.success('Registration successful!');
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      toast.error(err.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

 
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      toast.error(err.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  
  const logout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Logged out successfully');
    }
  };

  
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, userData);
      
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile updated successfully!');
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Profile update failed');
      toast.error(err.response?.data?.error || 'Profile update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;