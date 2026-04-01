import React, { createContext, useState, useContext } from 'react';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  shop: string;
  qty: number;
  checked: boolean;
}

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      const exist = prevItems.find((item) => item.id === product.id);

      if (exist) {
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

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems,
      addToCart,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);