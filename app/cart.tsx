import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { PRODUCT_LIST } from '../constants/data_cate';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, setCartItems, removeFromCart } = useCart();
  const [editingShops, setEditingShops] = useState<string[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  const handleFindSimilar = (currentItem: any) => {
      if (!PRODUCT_LIST) {
        setSimilarProducts([]);
        setShowSimilar(true);
        return;
      }

      const results = PRODUCT_LIST.filter((p: any) =>
        p.category === currentItem.category && p.id !== currentItem.id
      );

      setSimilarProducts(results);
      setShowSimilar(true);
    };

  const toggleEditShop = (shopName: string) => {
    setEditingShops(prev =>
      prev.includes(shopName)
        ? prev.filter(name => name !== shopName)
        : [...prev, shopName]
    );
  };

  const toggleCheck = (id: string | number) => {
    setCartItems((prev: any) =>
      prev.map((item: any) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateQty = (id: string | number, delta: number) => {
    setCartItems((prev: any) =>
      prev.map((item: any) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          // 1. Không cho giảm xuống dưới 1
          if (newQty < 1) return { ...item, qty: 1 };

          // 2. Kiểm tra nếu vượt quá tồn kho (mặc định 5 nếu không có stock)
          const maxStock = item.stock || 5;
          if (newQty > maxStock) {
            Alert.alert("Thông báo", `Món này chỉ còn ${maxStock} sản phẩm thôi nhe!`);
            return { ...item, qty: maxStock };
          }

          return { ...item, qty: newQty };
        }
        return item;
      })
    );
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

  if (!cartItems || cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Feather name="shopping-cart" size={64} color="#ccc" />
        <Text style={{ marginTop: 20, color: '#999', fontSize: 16 }}>Giỏ hàng của bạn đang trống</Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={{ marginTop: 20, backgroundColor: '#FF7524', padding: 15, borderRadius: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Tiếp tục mua sắm</Text>
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
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: '#000' }}>
            Giỏ hàng ({cartItems.length})
          </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {shops.map((shopName: any) => {
          const isEditing = editingShops.includes(shopName);
          return (
            <View key={shopName} style={{ backgroundColor: 'white', marginTop: 10, paddingBottom: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => router.push('/')}
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
                <View key={item.id} style={{ flexDirection: 'row', padding: 12, alignItems: 'center', backgroundColor: 'white', borderBottomWidth: index === array.length - 1 ? 0 : 1, borderBottomColor: '#f0f0f0', height: 110 }}>
                  <TouchableOpacity onPress={() => toggleCheck(item.id)}>
                    <Feather name={item.checked ? "check-square" : "square"} size={22} color={item.checked ? "#FF7524" : "#ccc"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      router.push({
                        pathname: '/product',
                        params: { id: item.id, title: item.name, price: item.price, image: item.image, location: item.location || 'Hồ Chí Minh' }
                      });
                    }}
                  >
                    <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 8, marginLeft: 10 }} />
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
                        style={{ backgroundColor: '#FFF5EE', width: 85, height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginRight: 10 }}
                        onPress={() => handleFindSimilar(item)}
                      >
                        <Feather name="layers" size={18} color="#FF7524" style={{ marginBottom: 2 }} />
                        <Text style={{ color: '#FF7524', textAlign: 'center', fontSize: 10, fontWeight: 'bold', lineHeight: 12 }}>
                          Sản phẩm{"\n"}tương tự
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ backgroundColor: '#FFF5EE', width: 65, height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}
                        onPress={() => {
                          // Hiện thông báo xác nhận
                          Alert.alert(
                            "Xác nhận xóa", // Tiêu đề
                            `Bạn có chắc chắn muốn xóa "${item.name}" khỏi giỏ hàng không?`,
                            [
                              {
                                text: "Hủy bỏ",
                                onPress: () => console.log("Đã hủy xóa"),
                                style: "cancel"
                              },
                              {
                                text: "Xác nhận",
                                onPress: () => {
                                  if(removeFromCart) {
                                    removeFromCart(item.id);
                                  } else {
                                    alert("Lỗi: Không tìm thấy hàm xóa!");
                                  }
                                },
                                style: "destructive"
                              }
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
                      {/* Nút Giảm - Mờ khi số lượng = 1 */}
                        <TouchableOpacity
                          onPress={() => updateQty(item.id, -1)}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            borderRightWidth: 1,
                            borderRightColor: '#eee',
                            opacity: item.qty <= 1 ? 0.3 : 1 // Mờ đi
                          }}
                          disabled={item.qty <= 1} // Khóa bấm
                        >
                          <Text style={{ fontSize: 16 }}>-</Text>
                        </TouchableOpacity>

                        <Text style={{ paddingHorizontal: 10, paddingTop: 6 }}>{item.qty}</Text>

                        {/* Nút Tăng - Mờ khi chạm mốc tồn kho */}
                        <TouchableOpacity
                          onPress={() => updateQty(item.id, 1)}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 5,
                            borderLeftWidth: 1,
                            borderLeftColor: '#eee',
                            opacity: item.qty >= (item.stock || 5) ? 0.3 : 1 // Mờ đi
                          }}
                          disabled={item.qty >= (item.stock || 5)} // Khóa bấm
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

      {/* --- MODAL HIỂN THỊ SẢN PHẨM TƯƠNG TỰ --- */}
      <Modal visible={showSimilar} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '70%', padding: 20 }}>
            <View style={{ width: 40, height: 5, backgroundColor: '#eee', borderRadius: 10, alignSelf: 'center', marginBottom: 15 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Sản phẩm tương tự</Text>
              <TouchableOpacity onPress={() => setShowSimilar(false)} style={{ padding: 5 }}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {similarProducts.length > 0 ? (
              <FlatList
                data={similarProducts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 12, alignItems: 'center' }}
                    onPress={() => {
                      setShowSimilar(false);
                      router.push({
                        pathname: '/product',
                        params: {
                          id: item.id,
                          title: item.name,
                          price: item.price,
                          image: item.image,
                          location: item.location
                        }
                      });
                    }}
                  >
                    <Image source={{ uri: item.image }} style={{ width: 70, height: 70, borderRadius: 10 }} />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontWeight: 'bold', fontSize: 14 }}>{item.name}</Text>
                      <Text style={{ color: '#FF7524', fontWeight: 'bold', marginTop: 5, fontSize: 15 }}>{item.price}đ</Text>
                      <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>📍 {item.location}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 }}>
                <Feather name="search" size={60} color="#ddd" />
                <Text style={{ marginTop: 20, fontSize: 16, color: '#999', fontWeight: '500' }}>
                  Rất tiếc, không tìm thấy món tương tự!
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
          {/* Tìm nút Mua hàng ở cuối file app/cart.tsx */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FF7524',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 25,
              opacity: selectedCount > 0 ? 1 : 0.5 // Mờ đi nếu chưa chọn món nào
            }}
            disabled={selectedCount === 0} // Khóa nút nếu chưa chọn món
            onPress={() => {
              // Lệnh chuyển trang quan trọng nhất ở đây:
              router.push('/checkout');
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Mua hàng ({selectedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}