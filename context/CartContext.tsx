import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const CART_STORAGE_KEY = '@twee_cart_items';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  shop: string;
  qty: number;
  checked: boolean;
  stock: number;
}

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateQuantity = (id: string | number, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty < 1) return;

    const maxStock = item.stock ?? 5;
    if (delta > 0 && newQty > maxStock) {
      Toast.show({
        type: 'info',
        text1: 'Thông báo',
        text2: `Món này chỉ còn ${maxStock} sản phẩm!`,
      });
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((it) => it.id === id ? { ...it, qty: newQty } : it)
    );
  };

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
          console.error('Error saving cart:', error);
        }
      };
      saveCart();
    }
  }, [cartItems, isInitialized]);
  const addToCart = (product: any) => {
    const exist = cartItems.find((item) => item.id === product.id);
    const availableStock = product.stock ?? product.quantity ?? 5;

    if (exist && exist.qty >= availableStock) {
      Toast.show({
        type: 'info',
        text1: 'Thông báo',
        text2: `Món này chỉ còn ${availableStock} sản phẩm!`,
      });
      return;
    }

    setCartItems((prevItems) => {
      if (exist) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1, checked: true, stock: availableStock } : item
        );
      }
      return [...prevItems, { ...product, qty: 1, checked: true, stock: availableStock }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

const clearBoughtItems = () => {
    setCartItems((prev) => prev.filter((item) => !item.checked));
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearBoughtItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);