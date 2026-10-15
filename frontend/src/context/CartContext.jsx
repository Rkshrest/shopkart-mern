import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/cart");
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
      }
    } catch (err) {
      console.error("Cart Context fetch error:", err);
      // If 401, clear cart gracefully
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setError("Failed to load shopping cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId) => {
    try {
      setError(null);
      const res = await api.post(`/cart/${productId}`);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true, message: res.data.message || "Added to cart" };
      }
      return { success: false, message: res.data?.message || "Could not add to cart" };
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg = err.response?.data?.message || "Failed to add product to cart.";
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setError(null);
      const res = await api.patch(`/cart/${productId}`, { quantity });
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Failed to update quantity" };
    } catch (err) {
      console.error("Update quantity error:", err);
      const msg = err.response?.data?.message || "Could not update quantity.";
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);
      const res = await api.delete(`/cart/${productId}`);
      if (res.data?.success) {
        setCartItems(res.data.cart || []);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Failed to remove item" };
    } catch (err) {
      console.error("Remove from cart error:", err);
      const msg = err.response?.data?.message || "Could not remove item from cart.";
      return { success: false, message: msg };
    }
  };

  const clearCartState = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalCount,
        subtotal,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
