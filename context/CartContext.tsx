import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // 1. Hàm lấy dữ liệu từ Supabase (Móc nối bảng cart và products)
  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products (
            *,
            shipping_fee_type,
            profiles:seller_id (
              display_name,
              full_name
            )
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          cart_id: item.id,
          id: item.products.id,
          name: item.products.title,
          price: item.products.price,
          image: item.products.images ? item.products.images[0] : null,
          qty: item.quantity,
          stock: item.products.quantity,
          checked: true,
          shipping_fee_type: item.products.shipping_fee_type,
          shop: item.products.profiles?.display_name || item.products.profiles?.full_name || 'Người bán Twee',
        }));
        setCartItems(formatted);
      }
    } catch (err) {
      console.log("Lỗi load giỏ hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tự động load khi user thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    fetchCart();
  }, [user]);

  // 2. Hàm cập nhật số lượng (Lưu thẳng lên Database)
  const updateQuantity = async (id: string | number, delta: number) => {
    const item = cartItems.find(i => i.id === id || i.cart_id === id);
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

    const { error } = await supabase
      .from('cart')
      .update({ quantity: newQty })
      .eq('id', item.cart_id);

    if (!error) {
      // Cập nhật state tại chỗ để UI nhảy số nhanh
      setCartItems(prev => prev.map(it => it.cart_id === item.cart_id ? { ...it, qty: newQty } : it));
    }
  };

  // 3. Thêm vào giỏ hàng
  const addToCart = async (product: any) => {
    if (!user) return Alert.alert('Lỗi', 'Vui lòng đăng nhập!');

    const { error } = await supabase
      .from('cart')
      .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);

    if (error) {
      // Nếu món đã có thì tăng số lượng lên 1
      updateQuantity(product.id, 1);
    } else {
      Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng' });
      fetchCart();
    }
  };

  // 4. Xóa món khỏi giỏ hàng
  const removeFromCart = async (cartId: string | number) => {
    const { error } = await supabase.from('cart').delete().eq('id', cartId);
    if (!error) {
      setCartItems(prev => prev.filter(item => item.cart_id !== cartId));
      Toast.show({ type: 'success', text1: 'Đã xóa khỏi giỏ' });
    }
  };

  // 5. Dọn dẹp giỏ hàng (Xóa các món đã tích chọn)
  const clearBoughtItems = async () => {
    const checkedCartIds = cartItems.filter(item => item.checked).map(i => i.cart_id);
    if (checkedCartIds.length > 0) {
      const { error } = await supabase.from('cart').delete().in('id', checkedCartIds);
      if (!error) fetchCart();
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearBoughtItems,
      loading,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);