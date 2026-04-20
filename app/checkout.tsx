import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, clearBoughtItems } = useCart();

  // LẤY DỮ LIỆU THẬT: Lọc các món được tích chọn từ Giỏ hàng
  const selectedItems = cartItems.filter((item: any) => item.checked);

  // GIẢ LẬP: Phí vận chuyển (Sau này có DB/API sẽ tính dựa trên địa chỉ)
  const shippingFee = 15000;

  const parsePrice = (price: any) => {
    if (typeof price === 'number') return price;
    return parseInt(price?.toString().replace(/\D/g, '')) || 0;
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + (parsePrice(item.price) * (item.qty || 1)), 0);
  const total = subtotal + shippingFee;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Khối 1: ĐỊA CHỈ (GIẢ LẬP - Note: Sau này fetch từ bảng User_Addresses) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color="#FF7524" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <Text style={styles.addressName}>Nguyễn Văn A</Text>
          <Text style={styles.phone}>(+84) 123 456 789</Text>
          <Text style={styles.addressText}>Quận 12, TP. Hồ Chí Minh</Text>
        </View>

        {/* Khối 2: CHI TIẾT SẢN PHẨM (DỮ LIỆU THẬT) */}
        <View style={styles.section}>
           <Text style={styles.shopName}>🛍️ Tiệm đồ cũ TWEE</Text>
           {selectedItems.map((item) => (
             <View key={item.id} style={styles.productItem}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{parsePrice(item.price).toLocaleString()}đ</Text>
                  <Text style={styles.productQty}>Số lượng: {item.qty}</Text>
                </View>
             </View>
           ))}
        </View>

        {/* Khối 3: PHƯƠNG THỨC THANH TOÁN (GIẢ LẬP) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={18} color="#FF7524" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.paymentOption}>
            <Text>Thanh toán khi nhận hàng (COD)</Text>
            <Feather name="check-circle" size={20} color="#FF7524" />
          </View>
        </View>

        {/* Khối 4: CHI TIẾT THANH TOÁN */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng tiền hàng</Text>
            <Text>{subtotal.toLocaleString()}đ</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển</Text>
            <Text>{shippingFee.toLocaleString()}đ</Text>
          </View>
          <View style={styles.priceRowTotal}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Khối 5: BOTTOM BAR (FOOTER) */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPrice}>{total.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => {
            Alert.alert(
              "Thành công",
              "Cảm ơn bạn đã đặt hàng tại TWEE!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    if (clearBoughtItems) {
                      clearBoughtItems();
                    }
                    router.replace('/');
                  }
                }
              ]
            );
          }}
        >
          <Text style={styles.orderButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  section: { backgroundColor: 'white', padding: 16, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { marginLeft: 8, fontWeight: '600', fontSize: 15 },
  addressName: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  addressText: { color: '#666', fontSize: 13, lineHeight: 18 },
  shopName: { fontWeight: 'bold', marginBottom: 12, fontSize: 14 },
  productItem: { flexDirection: 'row', marginBottom: 15 },
  productImage: { width: 70, height: 70, borderRadius: 8 },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 14, marginBottom: 4 },
  productPrice: { color: '#FF7524', fontWeight: 'bold' },
  productQty: { color: '#999', fontSize: 12, marginTop: 4 },
  paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { color: '#666' },
  priceRowTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  totalLabel: { fontWeight: 'bold', fontSize: 16 },
  totalValue: { fontSize: 18, color: '#FF7524', fontWeight: 'bold' },
  footer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  footerInfo: { flex: 1, alignItems: 'flex-end', marginRight: 15 },
  footerLabel: { fontSize: 12, color: 'gray' },
  footerPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7524' },
  orderButton: { backgroundColor: '#FF7524', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 4 },
  orderButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});