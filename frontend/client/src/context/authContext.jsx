import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const getStoredUser = () => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

const getStoredToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "null" && token !== "undefined" ? token : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);