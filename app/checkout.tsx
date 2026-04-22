import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { sendNotification } from '@/utils/notification';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, clearBoughtItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const selectedItems = cartItems.filter((item: any) => item.checked);
  const shippingFee = selectedItems.reduce((sum: number, item: any) => {
    return item.shipping_fee_type === 'buyer_pays' ? sum + 15000 : sum;
  }, 0);

  const parsePrice = (price: any) => {
    if (typeof price === 'number') return price;
    return parseInt(price?.toString().replace(/\D/g, '')) || 0;
  };

  const subtotal = selectedItems.reduce((sum: number, item: any) => sum + (parsePrice(item.price) * (item.qty || 1)), 0);
  const total = subtotal + shippingFee;

  // Thêm state lưu thông tin người nhận
  const [profile, setProfile] = useState({
    name: 'Đang tải...',
    phone: '',
    address: ''
  });

  // Hàm lấy profile từ database
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile({
          name: data.full_name || 'Chưa cập nhật tên',
          phone: data.phone || 'Chưa cập nhật SĐT',
          address: data.address || 'Chưa cập nhật địa chỉ'
        });
      }
    };
    fetchProfile();
  }, [user]);

  // Hàm chọn phương thức thanh toán
  const paymentOptions = [
    {
      id: 'cod',
      title: 'Thanh toán khi nhận hàng',
      subTitle: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: 'truck' as const,
      status: 'active'
    },
    {
      id: 'banking',
      title: 'Chuyển khoản Ngân hàng',
      subTitle: 'Thanh toán qua mã QR (Đang bảo trì)',
      icon: 'home' as const,
      status: 'maintenance'
    }
  ];

  // Hàm xử lý chọn phương thức thanh toán
  const handleSelectPayment = (method: any) => {
    if (method.status === 'maintenance') {
      Alert.alert(
        "Thông báo hệ thống",
        "Phương thức Chuyển khoản hiện đang được nâng cấp. Bạn vui lòng sử dụng COD để hoàn tất đơn hàng nhé!",
        [{ text: "Đã hiểu", style: "default" }]
      );
      return;
    }
    setPaymentMethod(method.id);
  };

  // Hàm xử lý đặt hàng
  const handlePlaceOrder = async () => {
    // Kiểm tra đăng nhập
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Bạn cần đăng nhập để đặt hàng'
      });
      return;
    }

    // Kiểm tra thông tin tài khoản
    const isProfileIncomplete =
      !profile.phone ||
      !profile.address ||
      profile.name === 'Chưa cập nhật tên' ||
      profile.phone === 'Chưa cập nhật SĐT' ||
      profile.address === 'Chưa cập nhật địa chỉ';

    if (isProfileIncomplete) {
      // Hiển thị thông báo khi thiếu thông tin để đặt hàng
      Alert.alert(
        "Thông tin chưa đầy đủ",
        "Chúng mình cần Tên, SĐT và Địa chỉ của bạn để có thể giao hàng. Bạn hãy bổ sung ở mục Tài khoản nhé!",
        [
          {
            text: "Để sau",
            style: "cancel"
          },
          {
            text: "Cập nhật ngay",
            onPress: () => router.push('/(tabs)/profile'), // Đẩy khách sang trang cá nhân
            style: "default"
          }
        ]
      );
      return; // Ngăn không cho đặt hàng
    }

    // Kiểm tra giỏ hàng
    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Giỏ hàng của bạn đang trống'
      });
      return;
    }

    setLoading(true);
    try {
      // Duyệt qua từng sản phẩm để tạo đơn hàng
      for (const item of selectedItems) {
        const requestQty = item.qty || 1;
        
        // 1. Lấy thông tin sản phẩm và kiểm tra số lượng hiện tại trên db
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('seller_id, title, quantity')
          .eq('id', item.id)
          .single();

        if (productError) throw productError;

        // Kiểm tra tồn kho
        if (productData.quantity < requestQty) {
          Toast.show({
            type: 'error',
            text1: 'Hết hàng',
            text2: `Sản phẩm "${productData.title || item.name}" hiện tại chỉ còn ${productData.quantity} sản phẩm.`
          });
          setLoading(false);
          return; // Hủy quá trình đặt hàng
        }

        // 2. Tạo bản ghi đơn hàng
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_id: productData.seller_id,
            product_id: item.id,
            quantity: requestQty,
            customer_name: profile.name,
            phone_number: profile.phone,
            address: profile.address,
            shipping_fee: item.shipping_fee_type === 'buyer_pays' ? 15000 : 0,
            total_price: (parsePrice(item.price) * requestQty) + (item.shipping_fee_type === 'buyer_pays' ? 15000 : 0),
            status: 'pending',
            payment_method: paymentMethod,
            is_paid: false
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 3. Trừ số lượng trên database để tránh bị đặt lặp
        const newQuantity = Math.max(0, productData.quantity - requestQty);
        const updateData = newQuantity <= 0 
          ? { quantity: newQuantity, status: 'sold' } // Chuyển trạng thái sold để không hiển thị nơi khác
          : { quantity: newQuantity };

        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', item.id);

        if (updateError) throw updateError;

        // 4. Thông báo cho người bán (Không để lỗi thông báo làm hỏng quá trình đặt hàng)
        try {
          await sendNotification({
            userId: productData.seller_id,
            title: 'Đơn hàng mới',
            content: `Bạn có đơn hàng mới #${orderData.id.slice(0, 8)} cho sản phẩm "${productData.title}".`,
            type: 'order'
          });
        } catch (nError) {
          console.error('Lỗi khi gửi thông báo đặt hàng:', nError);
        }
      }

      // Thông báo thành công
      const msg = "Chúc mừng! Đơn hàng của bạn đã được hệ thống ghi nhận.";
      if (Platform.OS === 'web') {
        window.alert(msg);
        clearBoughtItems && clearBoughtItems();
        router.replace('/(tabs)/profile');
      } else {
        Toast.show({
          type: 'success',
          text1: 'Thành công 🎉',
          text2: 'Đơn hàng của bạn đã được hệ thống ghi nhận.',
        });
        clearBoughtItems && clearBoughtItems();
        router.replace('/my-orders?type=buying');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi đặt hàng',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color="#FF7524" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <Text style={[styles.addressName, (profile.name?.includes('Chưa') || !profile.name) && {color: '#999'}]}>
            {profile.name}
          </Text>
          <Text style={[styles.phone, (profile.phone?.includes('Chưa') || !profile.phone) && {color: '#999'}]}>
            {profile.phone}
          </Text>
          <Text style={[styles.addressText, (profile.address?.includes('Chưa') || !profile.address) && {color: '#999'}]}>
            {profile.address}
          </Text>

          {/* Nhắc nhở người dùng nếu thiếu thông tin */}
          {(profile.phone?.includes('Chưa') || profile.address?.includes('Chưa') || !profile.phone || !profile.address) && (
            <View style={{marginTop: 10, padding: 8, backgroundColor: '#FFF5F5', borderRadius: 4, flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="alert-circle" size={14} color="#E53E3E" />
              <Text style={{ color: '#E53E3E', fontSize: 12, marginLeft: 6, fontWeight: '500' }}>
                Vui lòng bổ sung thông tin để đặt hàng
              </Text>
            </View>
          )}
        </View>

        {/* Group by shop */}
        {Object.keys(selectedItems.reduce((acc: any, item: any) => {
          const shop = item.shop || 'Cửa hàng Twee';
          if (!acc[shop]) acc[shop] = [];
          acc[shop].push(item);
          return acc;
        }, {})).map((shopName: string, shopIndex: number) => (
          <View key={shopIndex} style={styles.section}>
            <Text style={styles.shopName}>🛍️ {shopName}</Text>
            {selectedItems.filter((item: any) => (item.shop || 'Cửa hàng Twee') === shopName).map((item: any) => (
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
        ))}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={18} color="#FF7524" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          {paymentOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelectPayment(item)}
              style={[
                styles.paymentOptionItem,
                paymentMethod === item.id && styles.paymentOptionActive,
                item.status === 'maintenance' && { opacity: 0.6 }
              ]}
            >
              <View style={[
                styles.paymentIconBox,
                paymentMethod === item.id ? { backgroundColor: '#FF7524' } : { backgroundColor: '#E5E7EB' }
              ]}>
                <Feather name={item.icon as any} size={18} color="white" />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[
                  styles.paymentTitle,
                  paymentMethod === item.id ? { color: '#FF7524' } : { color: '#374151' }
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.paymentSubTitle}>{item.subTitle}</Text>
              </View>

              <Feather
                name={paymentMethod === item.id ? "check-circle" : "circle"}
                size={20}
                color={paymentMethod === item.id ? "#FF7524" : "#D1D5DB"}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng tiền hàng</Text>
            <Text>{subtotal.toLocaleString()}đ</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={shippingFee === 0 ? { color: '#22C55E', fontWeight: 'bold' } : {}}>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
              </Text>

              {/* Dòng chú thích nhỏ để giải thích logic cho người dùng */}
              {shippingFee > 0 && (
                <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                  ({selectedItems.filter((i: any) => i.shipping_fee_type === 'buyer_pays').length} kiện hàng có phí)
                </Text>
              )}
            </View>
          </View>
          <View style={styles.priceRowTotal}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPrice}>{total.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.orderButtonText}>Đặt hàng</Text>}
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
  phone: { color: '#444', marginBottom: 2 },
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
  orderButton: { backgroundColor: '#FF7524', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 4, minWidth: 120, alignItems: 'center' },
  orderButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  paymentOptionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#F9FAFB', },
  paymentOptionActive: { borderColor: '#FF7524', backgroundColor: '#FFF5F0', },
  paymentIconBox: { padding: 8, borderRadius: 10, },
  paymentTitle: { fontWeight: 'bold', fontSize: 13, },
  paymentSubTitle: { fontSize: 10, color: '#9CA3AF', marginTop: 2, },
});
