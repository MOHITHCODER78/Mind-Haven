import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAuth, setPendingAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('mindhaven_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem('mindhaven_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const storeSession = (responseData) => {
    localStorage.setItem('mindhaven_token', responseData.token);
    setUser(responseData.user);
    setPendingAuth(null);
    return responseData.user;
  };

  const requestOtp = async (payload) => {
    const response = await api.post('/auth/send-otp', payload);
    setPendingAuth({
      mode: 'student',
      email: payload.email,
      name: payload.name,
      role: 'student',
      devOtp: response.data.devOtp || '',
    });
    return response.data;
  };

  const loginAdminWithPassword = async (payload) => {
    const response = await api.post('/auth/admin/login', payload);
    return storeSession(response.data);
  };

  const loginSupportWithPassword = async (payload) => {
    const response = await api.post('/auth/support/login', payload);
    return storeSession(response.data);
  };

  const verifyOtp = async (payload) => {
    const response = await api.post('/auth/verify-otp', payload);
    return storeSession(response.data);
  };

  const clearPendingAuth = () => {
    setPendingAuth(null);
  };

  const logout = () => {
    localStorage.removeItem('mindhaven_token');
    setUser(null);
    setPendingAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingAuth,
        requestOtp,
        loginAdminWithPassword,
        loginSupportWithPassword,
        verifyOtp,
        clearPendingAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
