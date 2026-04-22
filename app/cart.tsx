import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '@/utils/image';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, setCartItems, removeFromCart, updateQuantity } = useCart();
  const [editingShops, setEditingShops] = useState<string[]>([]);

  const toggleEditShop = (shopName: string) => {
    setEditingShops(prev =>
      prev.includes(shopName)
        ? prev.filter(name => name !== shopName)
        : [...prev, shopName]
    );
  };

  const toggleCheck = (cartId: string | number) => {
    setCartItems((prev: any) =>
      prev.map((item: any) =>
        item.cart_id === cartId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateQty = (id: string | number, delta: number) => {
    updateQuantity(id, delta);
  };

  const toggleSelectAll = () => {
    const isAllSelected = cartItems.every((item: any) => item.checked);
    setCartItems((prev: any) =>
      prev.map((item: any) => ({ ...item, checked: !isAllSelected }))
    );
  };

  const parsePrice = (price: any) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseInt(price.toString().replace(/\D/g, '')) || 0;
  };

  // NẾU GIỎ HÀNG TRỐNG
  if (!cartItems || cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Feather name="shopping-cart" size={64} color="#f0f0f0" />
        <Text style={{ marginTop: 20, color: '#999', fontSize: 16, fontWeight: 'bold' }}>Giỏ hàng của bạn đang trống</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')} // Dùng replace để quay về trang chủ sạch sẽ
          style={{ marginTop: 24, backgroundColor: '#FF7524', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 16, shadowColor: '#FF7524', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' }}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalPrice = cartItems
    .filter((item: any) => item.checked)
    .reduce((sum: number, item: any) => {
      const price = parsePrice(item.price);
      return sum + (price * (item.qty || 1));
    }, 0);

  const selectedCount = cartItems.filter((item: any) => item.checked).length;
  const shops = [...new Set(cartItems.map((item: any) => item.shop))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontStyle: 'italic', fontWeight: 'bold', marginLeft: 12, color: '#000' }}>
            Giỏ hàng ({cartItems.length})
          </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {shops.map((shopName: any, shopIndex: number) => {
          const isEditing = editingShops.includes(shopName);
          return (
            <View key={`shop-${shopName}-${shopIndex}`} style={{ backgroundColor: 'white', marginTop: 10, paddingBottom: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => router.push('/(tabs)')}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
                >
                  <Feather name="home" size={16} color="black" />
                  <Text style={{ fontWeight: 'bold', marginLeft: 8 }}>{shopName}</Text>
                  <Feather name="chevron-right" size={14} color="#ccc" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleEditShop(shopName)}>
                  <Text style={{ color: '#666', fontSize: 14 }}>{isEditing ? 'Xong' : 'Sửa'}</Text>
                </TouchableOpacity>
              </View>

              {cartItems.filter((item: any) => item.shop === shopName).map((item: any, index: number, array: any[]) => (
                <View key={item.cart_id} style={{ flexDirection: 'row', padding: 12, alignItems: 'center', backgroundColor: 'white', borderBottomWidth: index === array.length - 1 ? 0 : 1, borderBottomColor: '#f0f0f0', height: 110 }}>
                  <TouchableOpacity onPress={() => toggleCheck(item.cart_id)}>
                    <Feather name={item.checked ? "check-square" : "square"} size={22} color={item.checked ? "#FF7524" : "#ccc"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      router.push({
                        pathname: '/product',
                        params: { id: item.id, title: item.name, price: item.price, image: item.image, location: item.location || 'TP. Hồ Chí Minh' }
                      });
                    }}
                  >
                    <View className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden items-center justify-center">
                      <Image 
                        source={{ uri: getImageUrl(item.image_url || item.image || item.images || item.product?.images) }} 
                        style={{ width: '100%', height: '100%' }} 
                        contentFit="cover"
                        transition={200}
                      />
                      {!getImageUrl(item.image_url || item.image || item.images || item.product?.images) && (
                        <View className="absolute inset-0 items-center justify-center bg-gray-50">
                          <Feather name="image" size={24} color="#DDD" />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12, height: 80, justifyContent: 'space-between' }}>
                      <Text numberOfLines={2} style={{ fontSize: 14 }}>{item.name}</Text>
                      <Text style={{ color: '#FF424E', fontWeight: 'bold', fontSize: 16 }}>
                        {parsePrice(item.price).toLocaleString()}đ
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {isEditing ? (
                    <View style={{ flexDirection: 'row', position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: 'white', alignItems: 'center', paddingRight: 12 }}>
                      <TouchableOpacity
                        style={{ backgroundColor: '#FFF5EE', width: 80, height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}
                        onPress={() => {
                          Alert.alert(
                            "Xác nhận xóa",
                            `Bạn có chắc chắn muốn xóa món này khỏi giỏ hàng không?`,
                            [
                              { text: "Hủy bỏ", style: "cancel" },
                              { text: "Xác nhận", onPress: () => removeFromCart && removeFromCart(item.cart_id), style: "destructive" }
                            ]
                          );
                        }}
                      >
                        <Feather name="trash-2" size={20} color="#FF7524" style={{ marginBottom: 4 }} />
                        <Text style={{ color: '#FF7524', fontSize: 12, fontWeight: 'bold' }}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#eee', borderRadius: 4, marginLeft: 10 }}>
                        <TouchableOpacity
                          onPress={() => updateQty(item.cart_id, -1)}
                          style={{ paddingHorizontal: 8, paddingVertical: 5, borderRightWidth: 1, borderRightColor: '#eee', opacity: item.qty <= 1 ? 0.3 : 1 }}
                          disabled={item.qty <= 1}
                        >
                          <Text style={{ fontSize: 16 }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ paddingHorizontal: 10, paddingTop: 6 }}>{item.qty}</Text>
                        <TouchableOpacity
                          onPress={() => updateQty(item.cart_id, 1)}
                          style={{ paddingHorizontal: 8, paddingVertical: 5, borderLeftWidth: 1, borderLeftColor: '#eee' }}
                        >
                          <Text style={{ fontSize: 16 }}>+</Text>
                        </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={toggleSelectAll} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name={cartItems.every((item: any) => item.checked) ? "check-square" : "square"} size={20} color="#FF7524" />
          <Text style={{ marginLeft: 5, fontWeight: '500' }}>Tất cả</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
            <Text style={{ fontSize: 12, color: 'gray' }}>Tổng cộng</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF7524' }}>
              {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
            </Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: '#FF7524', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, opacity: selectedCount > 0 ? 1 : 0.5 }}
            disabled={selectedCount === 0}
            onPress={() => router.push('/checkout')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Mua hàng ({selectedCount})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
