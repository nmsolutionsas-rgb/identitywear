import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Could not load wishlist items.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, toast]);

  // Effect to fetch wishlist when user changes
  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  }, [wishlistItems]);

  const addItem = useCallback(async (productId, productName, productImage, productPrice) => {
    if (!isAuthenticated || !user) return false;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newItem = { 
        id: tempId, 
        user_id: user.id, 
        product_id: productId, 
        product_name: productName, 
        product_image: productImage, 
        product_price: productPrice 
    };
    
    setWishlistItems(prev => [...prev, newItem]);

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{
          user_id: user.id,
          product_id: productId,
          product_name: productName,
          product_image: productImage,
          product_price: productPrice
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace temp item with real one
      setWishlistItems(prev => prev.map(item => item.id === tempId ? data : item));
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Revert optimistic update
      setWishlistItems(prev => prev.filter(item => item.id !== tempId));
      toast({
        title: "Error",
        description: "Could not add item to wishlist.",
        variant: "destructive"
      });
      return false;
    }
  }, [isAuthenticated, user, toast]);

  const removeItem = useCallback(async (productId) => {
    if (!isAuthenticated || !user) return false;

    // Optimistic update
    setWishlistItems(prev => {
        const itemToRemove = prev.find(item => item.product_id === productId);
        if (!itemToRemove) return prev;
        return prev.filter(item => item.product_id !== productId);
    });

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Re-fetch to ensure sync if error occurs, simpler than reverting complex state
      getWishlist();
      toast({
        title: "Error",
        description: "Could not remove item from wishlist.",
        variant: "destructive"
      });
      return false;
    }
  }, [isAuthenticated, user, toast, getWishlist]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isLoading,
      addItem,
      removeItem,
      isInWishlist,
      wishlistCount: wishlistItems.length,
      refreshWishlist: getWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};