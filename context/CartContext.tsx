import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

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
  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      const exist = prevItems.find((item) => item.id === product.id);
      const availableStock = product.stock || 5; // Mặc định là 5 nếu dữ liệu chưa có stock

      if (exist) {
        if (exist.qty >= availableStock) {
          Alert.alert("Thông báo", `Món này chỉ còn ${availableStock} sản phẩm!`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...product, qty: 1, checked: true }];
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
      clearBoughtItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);