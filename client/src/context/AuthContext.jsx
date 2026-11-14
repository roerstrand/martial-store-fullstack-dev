import { createContext, useContext, useState, useEffect } from "react";
import { logout as logoutService, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((userData) => {
        if (!cancelled) setUser(userData);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch {
      setUser(null);
      return;
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={[user, !!user, login, logout, initializing]}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth custom hook för att slippa impoertera AuthContext och useContext i varje komponent
export const useAuth = () => useContext(AuthContext);
