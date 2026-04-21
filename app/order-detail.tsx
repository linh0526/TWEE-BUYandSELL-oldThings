import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id (*),
          buyer:buyer_id (full_name, email),
          seller:seller_id (full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      console.error('Lỗi lấy chi tiết đơn:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator size="large" color="#FF7524" /></View>;
  if (!order) return <View className="flex-1 items-center justify-center bg-white"><Text>Không tìm thấy đơn hàng</Text></View>;

  const formatPrice = (price: any) => {
    return (parseFloat(price) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-black uppercase tracking-tighter">Chi tiết đơn hàng</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View className="bg-secondary p-8 items-center">
           <MaterialCommunityIcons name="package-variant-closed" size={48} color="#3C1300" />
           <Text className="text-[#3C1300] font-black text-xl mt-4 uppercase tracking-widest">{order.status === 'pending' ? 'Chờ xác nhận' : order.status}</Text>
           <Text className="text-[#3C1300]/60 font-bold text-xs mt-1">Mã đơn: {order.id}</Text>
        </View>

        {/* Product Section */}
        <View className="bg-white mt-3 p-6">
           <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">Sản phẩm</Text>
           <View className="flex-row">
              <Image source={{ uri: order.products?.images?.[0] }} className="w-20 h-20 rounded-2xl" />
              <View className="flex-1 ml-4 justify-center">
                 <Text className="text-primary font-black text-base">{order.products?.title}</Text>
                 <Text className="text-gray-400 font-bold text-xs mt-1">Số lượng: {order.quantity}</Text>
                 <Text className="text-secondary font-black text-lg mt-1">{formatPrice(order.products?.price)}</Text>
              </View>
           </View>
        </View>

        {/* Price Summary */}
        <View className="bg-white mt-3 p-6 space-y-3">
           <View className="flex-row justify-between">
              <Text className="text-gray-500 font-bold">Tiền hàng</Text>
              <Text className="text-primary font-bold">{formatPrice(order.products?.price * order.quantity)}</Text>
           </View>
           <View className="flex-row justify-between">
              <Text className="text-gray-500 font-bold">Phí vận chuyển</Text>
              <Text className="text-primary font-bold">{formatPrice(order.total_price - (order.products?.price * order.quantity))}</Text>
           </View>
           <View className="flex-row justify-between pt-3 border-t border-gray-50">
              <Text className="text-primary font-black text-lg">Tổng thanh toán</Text>
              <Text className="text-secondary font-black text-xl">{formatPrice(order.total_price)}</Text>
           </View>
        </View>

        {/* Date Section */}
        <View className="bg-white mt-3 p-6 mb-20">
           <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-400 font-black text-[10px] uppercase">Thời gian đặt hàng</Text>
              <Text className="text-primary font-bold text-xs">{new Date(order.created_at).toLocaleString('vi-VN')}</Text>
           </View>
           <View className="flex-row items-center justify-between">
              <Text className="text-gray-400 font-black text-[10px] uppercase">Phương thức</Text>
              <Text className="text-primary font-bold text-xs">Thanh toán khi nhận hàng (COD)</Text>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
