import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '@/utils/image';

export default function OrderDetailScreen() {
  const { user } = useAuth();
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
          buyer:buyer_id (full_name, email, display_name, phone),
          seller:seller_id (full_name, email, display_name)
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

  const updateOrderStatus = async (newStatus: string) => {
    const oldStatus = order.status;
    try {
      // Optimistic Update
      setOrder((prev: any) => ({ ...prev, status: newStatus }));

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Logic trừ kho khi xác nhận đơn (Chỉ thực hiện khi từ pending -> paid)
      if (newStatus === 'paid' && oldStatus === 'pending') {
        const { data: productData } = await supabase
          .from('products')
          .select('stock')
          .eq('id', order.product_id)
          .single();

        if (productData) {
          const freshStock = Math.max(0, (productData.stock || 0) - (order.quantity || 0));
          await supabase
            .from('products')
            .update({ stock: freshStock })
            .eq('id', order.product_id);
        }
      }

      // Logic cộng điểm tin cậy nếu hoàn thành
      if (newStatus === 'completed') {
        const myId = user?.id;
        const partnerId = myId === order.buyer_id ? order.seller_id : order.buyer_id;
        
        // Update trust score cho tôi
        const { data: myProf } = await supabase.from('profiles').select('trust_score').eq('id', myId).single();
        if (myProf && (myProf.trust_score || 0) < 100) {
          await supabase.from('profiles').update({ trust_score: (myProf.trust_score || 0) + 1 }).eq('id', myId);
        }

        // Update trust score cho đối phương
        const { data: pProf } = await supabase.from('profiles').select('trust_score').eq('id', partnerId).single();
        if (pProf && (pProf.trust_score || 0) < 100) {
          await supabase.from('profiles').update({ trust_score: (pProf.trust_score || 0) + 1 }).eq('id', partnerId);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã chuyển sang: ${getStatusText(newStatus)}`
      });
      fetchOrderDetail();
    } catch (error: any) {
      // Rollback nếu lỗi
      setOrder((prev: any) => ({ ...prev, status: oldStatus }));
      Toast.show({
        type: 'error',
        text1: 'Lỗi cập nhật',
        text2: error.message
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'paid': return 'Đã xác nhận & Chờ giao';
      case 'shipped': return 'Đang giao hàng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'paid': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const currentUserRole = user?.id === order.buyer_id ? 'buyer' : 'seller';

  return (
    <SafeAreaView className="flex-1 bg-white">
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
        <View className={`${getStatusColor(order.status)} p-10 items-center`}>
           <MaterialCommunityIcons 
             name={order.status === 'completed' ? "check-decagram" : "package-variant-closed"} 
             size={60} 
             color="white" 
           />
           <Text className="text-white font-black text-2xl mt-4 uppercase tracking-widest text-center">
             {getStatusText(order.status)}
           </Text>
           <Text className="text-white/70 font-bold text-[10px] mt-1 uppercase tracking-tighter">Mã đơn: {order.id}</Text>
           
           {order.status === 'completed' && (
             <View className="mt-4 bg-white/20 px-4 py-2 rounded-full border border-white/30">
               <Text className="text-white text-[10px] font-black uppercase italic">+1 ĐIỂM TIN CẬY</Text>
             </View>
           )}
        </View>

        {/* Shipping Section */}
        <View className="p-6 border-b border-gray-50 bg-white">
           <View className="flex-row items-center mb-4">
              <View className="bg-primary/10 p-2 rounded-lg mr-3">
                 <Feather name="map-pin" size={16} color="#FF7524" />
              </View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Thông tin nhận hàng</Text>
           </View>
           
           <View className="ml-11">
              <Text className="text-black font-black text-base mb-1">
                {order.buyer?.display_name || order.buyer?.full_name || 'Người dùng Twee'}
              </Text>
              <Text className="text-gray-500 font-bold text-sm leading-5 mb-2">
                {order.shipping_address || 'Chưa cung cấp địa chỉ'}
              </Text>
              
              {/* Giả định số điện thoại có thể nằm trong profile của buyer */}
              <View className="flex-row items-center">
                 <Feather name="phone" size={12} color="#9ca3af" />
                 <Text className="text-gray-400 font-bold text-xs ml-2">
                   {order.buyer?.phone || 'Chưa có số điện thoại'}
                 </Text>
              </View>
              {/* Nút hành động cho địa chỉ/SĐT */}
              <View className="flex-row mt-4">
                 <TouchableOpacity 
                   className="bg-gray-100 px-4 py-2 rounded-xl flex-row items-center mr-3"
                   onPress={() => {
                     Clipboard.setString(order.shipping_address);
                     Toast.show({ type: 'success', text1: 'Đã sao chép địa chỉ' });
                   }}
                 >
                    <Feather name="copy" size={12} color="#4b5563" />
                    <Text className="text-gray-600 font-bold text-[10px] ml-2 uppercase">Sao chép ĐC</Text>
                 </TouchableOpacity>
                 
                 {order.buyer?.phone && (
                   <TouchableOpacity 
                     className="bg-green-50 px-4 py-2 rounded-xl flex-row items-center"
                     onPress={() => Linking.openURL(`tel:${order.buyer.phone}`)}
                   >
                      <Feather name="phone-call" size={12} color="#10b981" />
                      <Text className="text-green-600 font-bold text-[10px] ml-2 uppercase">Gọi ngay</Text>
                   </TouchableOpacity>
                 )}
              </View>
           </View>
        </View>

        {/* Product Section */}
        <View className="p-6 border-b border-gray-50">
           <Text className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Sản phẩm</Text>
           <View className="flex-row">
              <View className="w-24 h-24 rounded-3xl bg-gray-50 overflow-hidden items-center justify-center">
                  <Image 
                    source={{ uri: getImageUrl(order.products?.images) }} 
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                  />
              </View>
              <View className="flex-1 ml-5 justify-center">
                 <Text className="text-primary font-black text-base leading-5 mb-1">{order.products?.title || 'Sản phẩm'}</Text>
                 <Text className="text-gray-400 font-bold text-xs">Số lượng: {order.quantity}</Text>
                 <Text className="text-secondary font-black text-xl mt-2">{formatPrice(order.products?.price)}</Text>
              </View>
           </View>
        </View>

        {/* Info Grid */}
        <View className="p-6">
           <View className="mb-8">
              <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Thanh toán</Text>
              <View className="bg-gray-50 p-6 rounded-[32px] space-y-3">
                 <View className="flex-row justify-between">
                    <Text className="text-gray-400 font-bold text-xs uppercase">Giá trị hàng</Text>
                    <Text className="text-primary font-black text-xs">{formatPrice(order.products?.price * order.quantity)}</Text>
                 </View>
                 <View className="flex-row justify-between">
                    <Text className="text-gray-400 font-bold text-xs uppercase">Vận chuyển</Text>
                    <Text className="text-primary font-black text-xs">{formatPrice(order.total_price - (order.products?.price * order.quantity))}</Text>
                 </View>
                 <View className="pt-4 mt-1 border-t border-gray-200 flex-row justify-between items-center">
                    <Text className="text-primary font-black text-xs uppercase">Tổng đơn</Text>
                    <Text className="text-secondary font-black text-xl">{formatPrice(order.total_price)}</Text>
                 </View>
              </View>
           </View>

           <View className="mb-8">
              <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Giao dịch</Text>
              <View className="bg-gray-50 p-6 rounded-[32px] space-y-4">
                 <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400 font-bold text-[10px] uppercase">Thời gian</Text>
                    <Text className="text-primary font-black text-[10px] uppercase">{new Date(order.created_at).toLocaleString('vi-VN')}</Text>
                 </View>
                 <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
                    <Text className="text-gray-400 font-bold text-[10px] uppercase">Hình thức</Text>
                    <Text className="text-primary font-black text-[10px] uppercase">COD (Khi nhận hàng)</Text>
                 </View>
              </View>
           </View>

           <View className="mb-10">
              <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Đối tác</Text>
              <View className="flex-row justify-between">
                 <View className="bg-orange-50 p-4 rounded-2xl flex-1 mr-2 items-center">
                    <Text className="text-orange-300 font-black text-[8px] uppercase mb-1 tracking-widest">Bán</Text>
                    <Text className="text-primary font-black text-[10px] uppercase text-center" numberOfLines={1}>
                      {order.seller?.display_name || order.seller?.full_name || 'N/A'}
                    </Text>
                 </View>
                 <View className="bg-blue-50 p-4 rounded-2xl flex-1 ml-2 items-center">
                    <Text className="text-blue-300 font-black text-[8px] uppercase mb-1 tracking-widest">Mua</Text>
                    <Text className="text-primary font-black text-[10px] uppercase text-center" numberOfLines={1}>
                      {order.buyer?.display_name || order.buyer?.full_name || 'N/A'}
                    </Text>
                 </View>
              </View>
           </View>
        </View>

        {/* Action Buttons Section */}
        <View className="p-6 bg-white border-t border-gray-50 mb-10">
           {currentUserRole === 'buyer' ? (
              <>
                {order.status === 'pending' && (
                  <TouchableOpacity onPress={() => updateOrderStatus('cancelled')} className="bg-red-50 py-5 rounded-3xl items-center border border-red-100">
                    <Text className="text-red-500 font-black uppercase text-xs tracking-widest">Hủy đơn hàng</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'shipped' && (
                  <TouchableOpacity onPress={() => updateOrderStatus('completed')} className="bg-green-500 py-5 rounded-3xl items-center shadow-lg shadow-green-200">
                    <Text className="text-white font-black uppercase text-xs tracking-widest">Đã nhận được hàng</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'completed' && (
                  <TouchableOpacity 
                    onPress={() => router.push({ pathname: '/shop/[id]', params: { id: order.seller_id } } as any)}
                    className="bg-primary py-5 rounded-3xl items-center shadow-lg shadow-orange-200"
                  >
                    <Text className="text-white font-black uppercase text-xs tracking-widest">Đánh giá sản phẩm</Text>
                  </TouchableOpacity>
                )}
              </>
           ) : (
              <>
                {order.status === 'pending' && (
                  <View className="flex-row">
                    <TouchableOpacity onPress={() => updateOrderStatus('cancelled')} className="flex-1 bg-red-50 py-5 rounded-3xl items-center mr-2 border border-red-100">
                      <Text className="text-red-500 font-black uppercase text-[10px]">Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateOrderStatus('paid')} className="flex-2 bg-primary py-5 rounded-3xl items-center ml-2 flex-[2] shadow-lg shadow-orange-200">
                      <Text className="text-white font-black uppercase text-[10px]">Xác nhận & Chuẩn bị</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {order.status === 'paid' && (
                  <TouchableOpacity onPress={() => updateOrderStatus('shipped')} className="bg-blue-500 py-5 rounded-3xl items-center shadow-lg shadow-blue-200">
                    <Text className="text-white font-black uppercase text-xs tracking-widest">Giao đơn vị vận chuyển</Text>
                  </TouchableOpacity>
                )}
              </>
           )}
           
           {(order.status === 'cancelled' || (currentUserRole === 'seller' && order.status === 'completed')) && (
             <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 py-5 rounded-3xl items-center">
               <Text className="text-gray-400 font-black uppercase text-xs tracking-widest">Quay lại</Text>
             </TouchableOpacity>
           )}
        </View>

        {/* Participant Section */}
        <View className="bg-white mt-3 p-6 mb-20">
           <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">Thông tin giao dịch</Text>
           <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-500 font-bold text-xs uppercase">Người bán</Text>
              <Text className="text-primary font-black text-xs uppercase">{order.seller?.display_name || order.seller?.full_name || 'N/A'}</Text>
           </View>
           <View className="flex-row items-center justify-between">
              <Text className="text-gray-500 font-bold text-xs uppercase">Người mua</Text>
              <Text className="text-primary font-black text-xs uppercase">{order.buyer?.display_name || order.buyer?.full_name || 'N/A'}</Text>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
