import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
const API_URL = 'http://192.168.8.121:3000/api';

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectRole = (role) => {
    setUserRole(role);
  };

  // ======================
  // SIGN UP (PHONE NUMBER)
  // ======================
  const signup = async (phoneNumber, password, role, userData) => {
    setLoading(true);
    setError(null);

    try {
      const body = {
        phoneNumber,
        password,
        role,
      };

      if (role === 'buyer') {
        body.buyerData = userData; // { name, municipality, wardNumber }
      }

      if (role === 'seller') {
        body.sellerData = userData; // { name, shopName, wardNumber }
      }

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setToken(data.token);
      setUser(data.user);
      setUserRole(role);
      setIsAuthenticated(true);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // LOGIN (PHONE NUMBER)
  // ======================
  const login = async (phoneNumber, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      setUserRole(data.user.role);
      setIsAuthenticated(true);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = () => {
    setUser(null);
    setUserRole(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        selectRole,
        isAuthenticated,
        user,
        token,
        signup,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
