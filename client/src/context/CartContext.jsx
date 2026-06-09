import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addCartItem,
  removeCartItem,
  increaseQuantity,
  decreaseQuantity,
  resetCart,
  createCart,
} from "../services/cartService";

const CartContext = createContext(null);

const normalize = (items) =>
  (items || []).map((item) => ({
    ...item,
    product: item.product ?? item.product_id ?? null,
  }));

export function CartProvider({ children }) {
  const [, token] = useAuth();
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [toast, setToast] = useState(null); // { title }

  const showToast = useCallback((title) => {
    setToast({ title });
    setTimeout(() => setToast(null), 5000);
  }, []);

  useEffect(() => {
    if (token) {
      getCart()
        .then((data) => {
          setCart(normalize(data.products));
          setCartId(data._id);
        })
        .catch(async () => {
          try {
            const newCart = await createCart();
            setCart([]);
            setCartId(newCart._id);
          } catch {}
        });
    } else {
      const local = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(local);
    }
  }, [token]);

  const addToCart = async (product, size) => {
    if (token) {
      if (!cartId) return;
      try {
        const data = await addCartItem(cartId, product._id, size);
        setCart(normalize(data.products));
      } catch {
        return;
      }
    } else {
      setCart((prev) => {
        const existing = prev.find(
          (i) => i.product._id === product._id && i.size === size
        );
        let updated;
        if (existing) {
          updated = prev.map((i) =>
            i.product._id === product._id && i.size === size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          updated = [...prev, { product, size, quantity: 1 }];
        }
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
    showToast(product.title);
  };

  const removeFromCart = async (productId) => {
    if (token) {
      const data = await removeCartItem(cartId, productId);
      setCart(normalize(data.products));
    } else {
      setCart((prev) => {
        const updated = prev.filter((i) => i.product._id !== productId);
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const increaseItem = async (productId) => {
    if (token) {
      const data = await increaseQuantity(cartId, productId);
      setCart(normalize(data.products));
    } else {
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.product._id === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const decreaseItem = async (productId) => {
    if (token) {
      const data = await decreaseQuantity(cartId, productId);
      setCart(normalize(data.products));
    } else {
      setCart((prev) => {
        const updated = prev
          .map((i) => i.product._id === productId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter((i) => i.quantity > 0);
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateSize = async (product, oldSize, newSize) => {
    if (token) {
      if (!cartId) return;
      try {
        await removeCartItem(cartId, product._id);
        const data = await addCartItem(cartId, product._id, newSize);
        setCart(normalize(data.products));
      } catch {
        return;
      }
    } else {
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.product._id === product._id && i.size === oldSize
            ? { ...i, size: newSize }
            : i
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (token && cartId) {
      await resetCart(cartId);
    }
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={[cart, addToCart, removeFromCart, clearCart, cartId, increaseItem, decreaseItem, toast, updateSize]}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
