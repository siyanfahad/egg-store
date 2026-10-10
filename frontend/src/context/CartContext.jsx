import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../services/cartApi';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const addItem = useCallback(
    async (variant, product, quantity = 1) => {
      const data = await cartApi.addItem(variant.id, quantity);
      setCart(data);
      setLastAdded({ productName: product.name, packSize: variant.packSize, quantity });
      setDrawerOpen(true);
      return data;
    },
    []
  );

  const updateItem = useCallback(async (itemId, quantity) => {
    const data = await cartApi.updateItem(itemId, quantity);
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const data = await cartApi.removeItem(itemId);
    setCart(data);
    return data;
  }, []);

  const applyDiscount = useCallback(async (code) => {
    const data = await cartApi.applyDiscount(code);
    setCart(data);
    return data;
  }, []);

  const removeDiscount = useCallback(async () => {
    const data = await cartApi.removeDiscount();
    setCart(data);
    return data;
  }, []);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        drawerOpen,
        setDrawerOpen,
        lastAdded,
        refresh,
        addItem,
        updateItem,
        removeItem,
        applyDiscount,
        removeDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
