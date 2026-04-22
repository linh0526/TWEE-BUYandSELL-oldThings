import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/utils/image';
import { sendNotification } from '@/utils/notification';

export default function MyOrdersScreen() {
  const router = useRouter();
  const { type, status: filterStatus } = useLocalSearchParams<{ type: 'buying' | 'selling', status?: string }>();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); // Thêm state để lưu tin đăng
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products'>(type === 'selling' ? 'products' : 'orders');
  const [activeProductFilter, setActiveProductFilter] = useState<'selling' | 'out_of_stock'>('selling');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (activeSubTab === 'orders') {
        let query = supabase
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
          `);

        if (type === 'buying') {
          query = query.eq('buyer_id', user.id);
        } else {
          query = query.eq('seller_id', user.id);
        }

        if (filterStatus) {
          query = query.eq('status', filterStatus);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } else {
        // Fetch tin đăng (products)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error('Lỗi lấy dữ liệu:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, user, filterStatus, activeSubTab]);

  const handleCancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    
    const performCancel = async () => {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);

        if (error) throw error;

        // Hoàn lại kho nếu đơn đang ở trạng thái pending hoặc paid
        if (order && (order.status === 'pending' || order.status === 'paid')) {
          const { data: productData } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', order.product_id)
            .single();

          if (productData) {
            const restoredQty = (productData.quantity || 0) + (order.quantity || 1);
            await supabase
              .from('products')
              .update({ 
                quantity: restoredQty,
                status: 'approved' // Đảm bảo hiện lại nếu trước đó bị set thành sold
              })
              .eq('id', order.product_id);
          }
        }
        
        // Thông báo hủy
        if (order) {
          const notifyTarget = user?.id === order.buyer_id ? order.seller_id : order.buyer_id;
          const actorRole = user?.id === order.buyer_id ? 'Người mua' : 'Người bán';
          
          // Thông báo hủy
          try {
            await sendNotification({
              userId: notifyTarget,
              title: 'Đơn hàng đã bị hủy',
              content: `${actorRole} đã hủy đơn hàng #${order.id.slice(0, 8)} cho sản phẩm "${order.products?.title}".`,
              type: 'order'
            });
          } catch (nError) {
            console.error('Lỗi khi gửi thông báo hủy:', nError);
          }
        }

        setOrders(prev => prev.map(item => item.id === orderId ? { ...item, status: 'cancelled' } : item));
        Toast.show({
          type: 'success',
          text1: 'Thông báo',
          text2: 'Đã hủy đơn hàng thành công!'
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể hủy đơn: ' + error.message
        });
      }
    };

    Alert.alert("Xác nhận", "Bạn có chắc muốn hủy đơn hàng này không?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy đơn", style: "destructive", onPress: performCancel }
    ]);
  };

  const handleDeleteProduct = async (productId: string) => {
    const performDelete = async () => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;
        setProducts(prev => prev.filter(p => p.id !== productId));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã xóa tin đăng'
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể xóa: ' + error.message
        });
      }
    };

    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa tin đăng này vĩnh viễn?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: performDelete }
    ]);
  };

  const formatPrice = (price: any) => {
    const num = parseFloat(price) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'paid': return 'Đã xác nhận';
      case 'shipped': return 'Đang giao hàng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'approved': return 'Đã duyệt';
      case 'moderating': return 'Chờ duyệt';
      case 'rejected': return 'Bị từ chối';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-50';
      case 'paid': return 'text-blue-500 bg-blue-50';
      case 'shipped': return 'text-purple-500 bg-purple-50';
      case 'completed': return 'text-green-500 bg-green-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      case 'approved': return 'text-green-500 bg-green-50';
      case 'moderating': return 'text-orange-500 bg-orange-50';
      case 'rejected': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      const order = orders.find(o => o.id === orderId);

      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;

      // Trừ kho khi xác nhận (pending -> paid)
      if (newStatus === 'paid' && order) {
        const { data: prod } = await supabase.from('products').select('quantity').eq('id', order.product_id).single();
        if (prod) {
          const newStock = Math.max(0, (prod.quantity || 0) - (order.quantity || 0));
          await supabase.from('products').update({ quantity: newStock }).eq('id', order.product_id);
        }
        // Thông báo xác nhận đơn hàng
        try {
          await sendNotification({
            userId: order.buyer_id,
            title: 'Đơn hàng được xác nhận',
            content: `Đơn hàng #${order.id.slice(0, 8)} cho sản phẩm "${order.products?.title}" đã được người bán xác nhận.`,
            type: 'order'
          });
        } catch (nError) {
          console.error('Lỗi khi gửi thông báo xác nhận:', nError);
        }
      }

      await fetchData();
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã cập nhật trạng thái'
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
            <Feather name="arrow-left" size={20} color="black" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black uppercase tracking-tighter text-primary">
              {type === 'buying' ? 'Đơn hàng đã mua' : 'Quản lý bán hàng'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={fetchData} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Feather name="refresh-cw" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Sub Tabs for Selling */}
      {type === 'selling' && (
        <View className="bg-gray-50/50">
          <View className="flex-row px-6 py-3">
            <TouchableOpacity 
              onPress={() => setActiveSubTab('products')}
              className={`flex-1 py-3 rounded-2xl items-center ${activeSubTab === 'products' ? 'bg-primary' : 'bg-transparent'}`}
            >
              <Text className={`font-black text-[10px] uppercase ${activeSubTab === 'products' ? 'text-white' : 'text-gray-400'}`}>Tin đăng bán</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveSubTab('orders')}
              className={`flex-1 py-3 rounded-2xl items-center ${activeSubTab === 'orders' ? 'bg-secondary' : 'bg-transparent'}`}
            >
              <Text className={`font-black text-[10px] uppercase ${activeSubTab === 'orders' ? 'text-[#3C1300]' : 'text-gray-400'}`}>Đơn khách đặt</Text>
            </TouchableOpacity>
          </View>

          {/* Product Filter Tabs */}
          {activeSubTab === 'products' && (
            <View className="flex-row px-6 pb-4 pt-1 items-center justify-center">
              <TouchableOpacity 
                onPress={() => setActiveProductFilter('selling')}
                className={`px-6 py-2 rounded-full mr-3 ${activeProductFilter === 'selling' ? 'bg-white shadow-sm border border-orange-100' : 'bg-gray-100'}`}
              >
                <Text className={`text-[10px] font-black uppercase ${activeProductFilter === 'selling' ? 'text-primary' : 'text-gray-400'}`}>Đang bán</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveProductFilter('out_of_stock')}
                className={`px-6 py-2 rounded-full ${activeProductFilter === 'out_of_stock' ? 'bg-white shadow-sm border border-red-100' : 'bg-gray-100'}`}
              >
                <Text className={`text-[10px] font-black uppercase ${activeProductFilter === 'out_of_stock' ? 'text-red-500' : 'text-gray-400'}`}>Hết hàng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7524" />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-gray-50/30" showsVerticalScrollIndicator={false}>
          {activeSubTab === 'orders' ? (
            orders.map((order) => {
              const partnerName = type === 'buying' 
                ? (order.seller?.display_name || order.seller?.full_name || 'Người bán Twee')
                : (order.buyer?.display_name || order.buyer?.full_name || 'Người mua Twee');

              return (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })}
                  className="bg-white m-4 mb-0 p-6 rounded-[32px] border border-gray-100 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-50">
                    <View className="flex-row items-center">
                      <Feather name="user" size={10} color="#FF7524" />
                      <Text className="ml-1 text-[10px] font-black text-primary uppercase">{partnerName}</Text>
                    </View>
                      <View className={`${getStatusColor(order.status)} px-4 py-1.5 rounded-full`}>
                        <Text className="text-[12px] font-black uppercase tracking-tighter">
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                  </View>

                  <View className="flex-row">
                    <View className="w-20 h-20 rounded-2xl bg-gray-100 items-center justify-center overflow-hidden">
                      <Image 
                          source={{ uri: getImageUrl(order.products?.images) }} 
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                          transition={200}
                        />
                    </View>
                    <View className="flex-1 ml-4 justify-between">
                      <Text className="text-primary font-black text-sm" numberOfLines={2}>{order.products?.title || 'Sản phẩm không còn tồn tại'}</Text>
                      <View className="flex-row justify-between items-end">
                        <Text className="text-gray-400 text-[10px] font-bold">x{order.quantity}</Text>
                        <Text className="text-secondary font-black text-lg">{formatPrice(order.total_price)}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-end">
                    {type === 'buying' && order.status === 'pending' && (
                      <TouchableOpacity onPress={() => handleCancelOrder(order.id)} className="bg-red-50 px-6 py-2.5 rounded-full mr-2">
                          <Text className="text-red-500 font-black text-[9px] uppercase">Hủy đơn</Text>
                      </TouchableOpacity>
                    )}
                    {type === 'selling' && order.status === 'pending' && (
                      <TouchableOpacity onPress={() => updateOrderStatus(order.id, 'paid')} className="bg-primary px-6 py-2.5 rounded-full">
                          <Text className="text-white font-black text-[9px] uppercase">Xác nhận đơn</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => router.push({ pathname: '/order-detail', params: { id: order.id } })} className="bg-gray-50 px-6 py-2.5 rounded-full ml-2">
                        <Text className="text-gray-400 font-black text-[9px] uppercase">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            })
          ) : (
            products
              .filter(item => {
                if (activeProductFilter === 'selling') return (item.quantity || 0) > 0;
                return (item.quantity || 0) <= 0;
              })
              .map((item) => (
                <View key={item.id} className="bg-white m-4 mb-0 p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className={`px-4 py-1.5 rounded-full ${getStatusColor(item.status)}`}>
                      <Text className="text-[9px] font-black uppercase italic">{getStatusText(item.status)}</Text>
                    </View>
                    <Text className="text-[9px] font-black text-gray-300 uppercase">{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  
                  <View className="flex-row">
                    <View className="w-24 h-24 rounded-2xl bg-gray-100 items-center justify-center overflow-hidden">
                      {getImageUrl(item.images) ? (
                        <Image 
                          source={{ uri: getImageUrl(item.images) }} 
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <Feather name="image" size={24} color="#DDD" />
                      )}
                    </View>
                    <View className="flex-1 ml-4 justify-between py-1">
                      <View>
                        <Text className="text-primary font-black text-sm" numberOfLines={2}>{item.title}</Text>
                        <View className="flex-row items-center mt-1">
                          <View className={`px-2 py-0.5 rounded-md mr-2 ${item.quantity <= 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
                            <Text className={`text-[8px] font-black uppercase ${item.quantity <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              Kho: {item.quantity || 0}
                            </Text>
                          </View>
                          <Text className="text-[8px] font-black text-secondary uppercase italic">tình trạng: {item.condition || 'Tốt'}</Text>
                        </View>
                      </View>
                      <Text className="text-secondary font-black text-lg">{formatPrice(item.price)}</Text>
                    </View>
                  </View>

                  <View className="mt-4 pt-4 border-t border-gray-50 flex-row justify-end">
                     <TouchableOpacity 
                       onPress={() => router.push({ pathname: '/(tabs)/post', params: { editId: item.id } } as any)}
                       className="bg-gray-50 px-6 py-2.5 rounded-full mr-2"
                     >
                        <Text className="text-gray-400 font-black text-[9px] uppercase">Sửa tin</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                       onPress={() => handleDeleteProduct(item.id)}
                       className="bg-red-50 px-6 py-2.5 rounded-full"
                     >
                        <Text className="text-red-500 font-black text-[9px] uppercase">Xóa tin</Text>
                     </TouchableOpacity>
                  </View>
                </View>
              ))
          )}

          {(activeSubTab === 'orders' 
            ? orders.length 
            : products.filter(item => {
                if (activeProductFilter === 'selling') return (item.quantity || 0) > 0;
                return (item.quantity || 0) <= 0;
              }).length
          ) === 0 && (
            <View className="items-center py-40">
              <MaterialCommunityIcons name="package-variant" size={80} color="#EEE" />
              <Text className="text-gray-300 font-black mt-4 uppercase text-[10px] tracking-widest">Không có dữ liệu hiển thị</Text>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
