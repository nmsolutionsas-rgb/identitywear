import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext();

const CART_STORAGE_KEY = 'identitywear-cart';
const TAX_RATE = 0.25; // 25% tax rate

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { toast } = useToast();

  // Initialize cart with empty array for SSR safety
  const [cartItems, setCartItems] = useState([]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
        console.log('[Cart] Loaded from localStorage:', JSON.parse(storedCart).length);
      }
    } catch (error) {
      console.error('[Cart] Error loading from localStorage:', error);
    }
  }, []);

  // Use a ref to keep track of cart items for use in callbacks without adding dependencies
  const cartItemsRef = useRef(cartItems);
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      console.log('[Cart] Saved to localStorage. Items:', cartItems.length);
    } catch (error) {
      console.error('[Cart] Error saving to localStorage:', error);
    }
  }, [cartItems]);

  // Optimized addToCart: Uses ref to check inventory
  const addToCart = useCallback((product, variant, quantity, availableQuantity) => {
    return new Promise((resolve, reject) => {
      console.log('[Cart] Adding item:', { product: product.title, variant: variant.title, quantity });
      const currentItems = cartItemsRef.current;

      if (variant.manage_inventory) {
        const existingItem = currentItems.find(item => item.variant.id === variant.id);
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;

        if ((currentCartQuantity + quantity) > availableQuantity) {
          console.warn('[Cart] Stock limit reached for variant:', variant.id);
          const error = new Error(`Not enough stock. Only ${availableQuantity} available.`);
          reject(error);
          return;
        }
      }

      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.variant.id === variant.id);

        if (existingItem) {
          return prevItems.map(item =>
            item.variant.id === variant.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prevItems, { product, variant, quantity }];
      });

      resolve();
    });
  }, []);

  const removeFromCart = useCallback((variantId) => {
    console.log('[Cart] Removing item:', variantId);
    setCartItems(prevItems => prevItems.filter(item => item.variant.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    if (quantity < 1) return;

    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.variant.id === variantId) {
          // Check stock limit if inventory is managed
          if (item.variant.manage_inventory && quantity > item.variant.inventory_quantity) {
            console.warn('[Cart] Cannot update quantity. Limit reached.');
            toast({
              title: "Limit Reached",
              description: `Only ${item.variant.inventory_quantity} items available in stock.`,
              variant: "destructive"
            });
            return { ...item, quantity: item.variant.inventory_quantity };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, [toast]);

  const clearCart = useCallback(() => {
    console.log('[Cart] Clearing cart');
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear cart storage", e);
    }
  }, []);

  // Calculate totals including Tax
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant.sale_price_in_cents || item.variant.price_in_cents || 0;
      return sum + (price * item.quantity);
    }, 0);

    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    console.log('[Cart] Recalculated totals:', { subtotal, tax, total });

    return {
      subtotal,
      tax,
      total
    };
  }, [cartItems]);

  const getCartTotal = useCallback(() => {
    return (cartTotals.total / 100).toFixed(2);
  }, [cartTotals]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    cartTotals,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, cartTotals]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};