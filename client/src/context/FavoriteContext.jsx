import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getMyFavorites,
  addProductToFavorites,
  removeProductFromFavorites,
} from "../services/favoriteService";

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const [user, token] = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));
  const [toast, setToast] = useState(null);

  const showToast = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      localStorage.removeItem("favorites");
      getMyFavorites()
        .then((data) => setFavorites(data.products ?? []))
        .catch(() => {/* keep current favorites on error */})
        .finally(() => setLoading(false));
    } else if (!token) {
      setLoading(false);
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(stored);
    }
    // token exists but user not yet loaded → stay loading
  }, [user, token]);

  async function clearFavorites() {
    if (user) {
      const ids = favorites.map((f) => f._id);
      setFavorites([]);
      for (const id of ids) {
        try { await removeProductFromFavorites(id); } catch {}
      }
    } else {
      localStorage.removeItem("favorites");
      setFavorites([]);
    }
  }

  async function toggleFavorites(product) {
    if (!user) {
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      const exists = stored.some((fav) => fav._id === product._id);
      const updated = exists
        ? stored.filter((fav) => fav._id !== product._id)
        : [...stored, product];

      localStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites(updated);
      if (!exists) showToast();
      return;
    }

    const exists = favorites.some((fav) => fav._id === product._id);

    if (exists) {
      setFavorites(favorites.filter((fav) => fav._id !== product._id));
      try { await removeProductFromFavorites(product._id); } catch {}
    } else {
      setFavorites([...favorites, product]);
      showToast();
      try { await addProductToFavorites(product._id); } catch {}
    }
  }

  return (
    <FavoriteContext.Provider value={[toggleFavorites, favorites, toast, clearFavorites, loading]}>
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoriteContext);
