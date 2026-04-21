import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function MyOrdersScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'buying' | 'selling' }>();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const query = supabase
        .from('orders')
        .select(`
          *,
          products:product_id (
            title,
            images,
            price
          ),
          seller:seller_id (
            display_name,
            full_name
          ),
          buyer:buyer_id (
            display_name,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (type === 'buying') {
        query.eq('buyer_id', user.id);
      } else {
        query.eq('seller_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Lỗi lấy đơn hàng:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [type, user]);

  const handleCancelOrder = async (orderId: string) => {
    const performCancel = async () => {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;

        setOrders(prev => prev.filter(item => item.id !== orderId));

        const msg = "Đã hủy đơn hàng thành công!";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Thông báo", msg);
      } catch (error: any) {
        Alert.alert("Lỗi", "Không thể hủy đơn: " + error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này? Dữ liệu sẽ bị xóa vĩnh viễn.")) {
        await performCancel();
      }
    } else {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc muốn hủy đơn hàng này không?",
        [
          { text: "Không", style: "cancel" },
          { text: "Hủy đơn", style: "destructive", onPress: performCancel }
        ]
      );
    }
  };

  const formatPrice = (price: any) => {
    const num = parseFloat(price) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'paid': return 'Đã thanh toán';
      case 'shipped': return 'Đang giao hàng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-black uppercase tracking-tighter text-primary">
          Đơn {type === 'buying' ? 'mua' : 'bán'} của tôi
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7524" />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-gray-50/50" showsVerticalScrollIndicator={false}>
          {orders.map((order) => {
            const partnerName = type === 'buying' 
              ? (order.seller?.display_name || order.seller?.full_name || 'Người bán Twee')
              : (order.buyer?.display_name || order.buyer?.full_name || 'Người mua Twee');

            return (
              <View
                key={order.id}
                className="bg-white m-4 mb-0 p-5 rounded-[32px] border border-gray-100 shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-4 border-b border-gray-50 pb-3">
                   <View className="flex-row items-center">
                      <Feather name="user" size={10} color="#FF7524" />
                      <Text className="ml-1 text-[10px] font-black text-primary uppercase">{partnerName}</Text>
                   </View>
                   <View className="bg-orange-50 px-3 py-1 rounded-full">
                      <Text className="text-[9px] font-black uppercase text-orange-500">
                         {getStatusText(order.status)}
                      </Text>
                   </View>
                </View>

                <View className="flex-row">
                  <Image
                    source={{ uri: order.products?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' }}
                    className="w-20 h-20 rounded-2xl"
                  />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-primary font-black text-sm mb-1" numberOfLines={2}>{order.products?.title || 'Sản phẩm'}</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-400 text-xs font-bold">x{order.quantity}</Text>
                      <Text className="text-secondary font-black text-base">{formatPrice(order.total_price)}</Text>
                    </View>
                  </View>
                </View>

              <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-end">
                 <TouchableOpacity
                   onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })}
                   className="border border-gray-100 px-6 py-2.5 rounded-full mr-3"
                 >
                    <Text className="text-gray-400 font-black text-[9px] uppercase">Chi tiết</Text>
                 </TouchableOpacity>

                 {order.status === 'pending' && (
                   <TouchableOpacity
                     onPress={() => handleCancelOrder(order.id)}
                     className="bg-secondary px-6 py-2.5 rounded-full"
                   >
                      <Text className="text-[#3C1300] font-black text-[9px] uppercase">Hủy đơn</Text>
                   </TouchableOpacity>
                 )}
              </View>
            </View>
            );
          })}

          {orders.length === 0 && (
            <View className="items-center py-24">
              <MaterialCommunityIcons name="cart-off" size={80} color="#DDD" />
              <Text className="text-gray-400 font-black mt-4 uppercase text-[10px] tracking-widest">Không tìm thấy đơn hàng</Text>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
