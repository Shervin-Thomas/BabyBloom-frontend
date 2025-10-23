import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { shopService, CartItem, ShoppingCart, Product } from '../src/services/shopService';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShopContextType {
  // Cart State
  cart: ShoppingCart | null;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;

  // Cart Actions
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Wishlist State
  wishlistCount: number;
  
  // Wishlist Actions
  addToWishlist: (productId: string, variantId?: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;

  // User Actions
  onUserLogin: (userId: string) => Promise<void>;
  onUserLogout: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
}

export function ShopProvider({ children }: ShopProviderProps) {
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Calculate cart metrics
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  // Initialize session
  useEffect(() => {
    initializeSession();
    checkUser();
  }, []);

  const initializeSession = async () => {
    try {
      let storedSessionId = await AsyncStorage.getItem('shop_session_id');
      if (!storedSessionId) {
        storedSessionId = generateSessionId();
        await AsyncStorage.setItem('shop_session_id', storedSessionId);
      }
      setSessionId(storedSessionId);
    } catch (error) {
      console.error('Error initializing session:', error);
      // Fallback to in-memory session ID
      setSessionId(generateSessionId());
    }
  };

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  // Load cart when userId or sessionId changes
  useEffect(() => {
    if (userId || sessionId) {
      refreshCart();
    }
  }, [userId, sessionId]);

  const refreshCart = async () => {
    if (!userId && !sessionId) return;
    
    try {
      setIsLoading(true);
      const cartData = await shopService.getCartWithItems(userId || undefined, sessionId || undefined);
      setCart(cartData);
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWishlist = async () => {
    if (!userId) return;
    
    try {
      const wishlist = await shopService.getWishlist(userId);
      setWishlistCount(wishlist.items?.length || 0);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    try {
      await shopService.addToCart(
        productId, 
        quantity, 
        userId || undefined, 
        sessionId || undefined, 
        variantId
      );
      await refreshCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      await shopService.updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await shopService.removeFromCart(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await shopService.clearCart(userId || undefined, sessionId || undefined);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const addToWishlist = async (productId: string, variantId?: string) => {
    if (!userId) {
      throw new Error('Please log in to add items to wishlist');
    }

    try {
      await shopService.addToWishlist(productId, userId, variantId);
      await refreshWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      await shopService.removeFromWishlist(itemId);
      await refreshWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const onUserLogin = async (newUserId: string) => {
    const oldSessionId = sessionId;
    setUserId(newUserId);
    
    // If user had items in guest cart, we should merge them
    if (oldSessionId && cartItems.length > 0) {
      try {
        // Get or create user cart
        const userCart = await shopService.getOrCreateCart(newUserId);
        
        // Add guest cart items to user cart
        for (const item of cartItems) {
          await shopService.addToCart(
            item.product_id,
            item.quantity,
            newUserId,
            undefined,
            item.variant_id
          );
        }
        
        // Clear guest cart
        await shopService.clearCart(undefined, oldSessionId);
      } catch (error) {
        console.error('Error merging carts:', error);
      }
    }
    
    await refreshCart();
    await refreshWishlist();
  };

  const onUserLogout = async () => {
    setUserId(null);
    setWishlistCount(0);
    // Keep cart items for guest session
    await refreshCart();
  };

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await onUserLogin(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          await onUserLogout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: ShopContextType = {
    // State
    cart,
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    wishlistCount,

    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist,
    onUserLogin,
    onUserLogout,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}