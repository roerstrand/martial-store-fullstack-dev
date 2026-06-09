import { createContext, useContext, useState, useEffect } from "react";
import { logout as logoutService, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [initializing, setInitializing] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    getCurrentUser()
      .then((userData) => setUser(userData))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = (userData, newToken) => {
    setUser(userData);
    setToken(newToken);
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={[user, token, login, logout, initializing]}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth custom hook för att slippa impoertera AuthContext och useContext i varje komponent
export const useAuth = () => useContext(AuthContext);
