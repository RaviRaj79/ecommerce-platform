import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
const CART_STORAGE_KEY = "cart_items_v1";
const getItemId = (item) => item?._id ?? item?.id;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage write errors (e.g., private mode)
    }
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product) return;
    const productId = getItemId(product);
    if (!productId) return;
    setCartItems((prev) => {
      const exist = prev.find((x) => getItemId(x) === productId);

      if (exist) {
        return prev.map((x) =>
          getItemId(x) === productId ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    if (!id) return;
    setCartItems((prev) => prev.filter((x) => getItemId(x) !== id));
  };

  const decrementFromCart = (id) => {
    if (!id) return;
    setCartItems((prev) => {
      const item = prev.find((x) => getItemId(x) === id);
      if (!item) return prev;
      if (item.qty <= 1) return prev.filter((x) => getItemId(x) !== id);
      return prev.map((x) =>
        getItemId(x) === id ? { ...x, qty: x.qty - 1 } : x
      );
    });
  };

  const updateQty = (id, qty) => {
    if (!id) return;
    const nextQty = Math.max(1, Math.min(99, Number(qty) || 1));
    setCartItems((prev) =>
      prev.map((x) => (getItemId(x) === id ? { ...x, qty: nextQty } : x))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decrementFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
