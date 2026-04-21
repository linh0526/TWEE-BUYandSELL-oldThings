import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  condition: string;
  images: string[];
  status: string;
  created_at: string;
  seller: {
    full_name: string;
    trust_score: number;
  } | null;
}

export default function AdminApproveScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles (full_name, trust_score)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải danh sách tin đăng'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedProduct(null); // Close modal if open
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã ${newStatus === 'approved' ? 'duyệt' : 'từ chối'} tin đăng này.`
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message
      });
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => setSelectedProduct(item)}
      className="bg-white m-4 rounded-[32px] overflow-hidden border border-black/5 shadow-sm"
    >
      {/* Product Image */}
      <View className="relative h-56">
        <Image 
          source={
            (Array.isArray(item.images) && item.images.length > 0) 
              ? { uri: item.images[0] }
              : undefined
          } 
          style={{ width: '100%', height: '100%', backgroundColor: '#F8F9FA' }}
          contentFit="cover"
          transition={200}
          priority="high"
        />
        {(!(Array.isArray(item.images) && item.images.length > 0)) && (
          <View className="absolute inset-0 items-center justify-center bg-gray-50">
            <Feather name="image" size={32} color="#DDD" />
          </View>
        )}
        <View className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
          <Text className="text-white text-[10px] font-bold uppercase tracking-widest">{item.condition}</Text>
        </View>
      </View>

      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-secondary/10 items-center justify-center mr-3">
             <Text className="text-secondary font-black text-xs">
               {item.seller?.full_name?.substring(0, 2).toUpperCase() || 'TW'}
             </Text>
          </View>
          <View>
            <Text className="text-sm font-black text-primary uppercase">{item.seller?.full_name || 'Người dùng'}</Text>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Trust Score: {item.seller?.trust_score}</Text>
          </View>
        </View>

        <Text className="text-lg font-black text-primary mb-1 uppercase tracking-tight">{item.title}</Text>
        <Text className="text-secondary font-black text-base mb-3">{item.price.toLocaleString()} VNĐ</Text>
        <Text className="text-gray-500 text-xs mb-4 leading-5" numberOfLines={2}>{item.description}</Text>
        
        <View className="flex-row items-center">
          <Feather name="maximize-2" size={12} color="#FF7524" />
          <Text className="ml-2 text-[10px] font-bold text-secondary uppercase tracking-widest">Bấm để xem chi tiết</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-black/5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="ml-2 text-xl font-black text-primary tracking-tighter">DUYỆT TIN ĐĂNG</Text>
        </View>
        <TouchableOpacity onPress={fetchPendingProducts} className="p-2">
          <Feather name="refresh-cw" size={20} color="#FF7524" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7524" />
          <Text className="mt-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</Text>
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Feather name="check-square" size={32} color="#CCC" />
          </View>
          <Text className="text-lg font-black text-primary text-center uppercase tracking-widest">Sạch sẽ!</Text>
          <Text className="text-gray-500 text-center mt-2 text-sm leading-6">Hiện tại không có tin đăng nào đang đợi duyệt.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white h-[90%] rounded-t-[40px] overflow-hidden">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mt-4 mb-2" />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Slider (Simplified) */}
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                className="h-80"
              >
                {selectedProduct?.images.map((img, i) => (
                  <Image 
                    key={i}
                    source={img}
                    style={{ width: width, height: 320 }}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>

              <View className="p-8">
                {/* Seller */}
                <View className="flex-row items-center justify-between mb-8 p-4 bg-gray-50 rounded-3xl">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-secondary/10 items-center justify-center mr-4">
                      <Text className="text-secondary font-black text-sm">
                        {selectedProduct?.seller?.full_name?.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm font-black text-primary uppercase">{selectedProduct?.seller?.full_name}</Text>
                      <Text className="text-[10px] text-gray-400 font-bold uppercase">Người bán uy tín</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tin cậy</Text>
                    <Text className="text-lg font-black text-secondary">{selectedProduct?.seller?.trust_score}</Text>
                  </View>
                </View>

                <Text className="text-2xl font-black text-primary uppercase tracking-tight mb-2">
                  {selectedProduct?.title}
                </Text>
                
                <View className="flex-row items-center mb-6">
                  <View className="bg-primary/10 px-3 py-1.5 rounded-xl mr-3">
                    <Text className="text-primary font-black text-sm">{selectedProduct?.price.toLocaleString()} VNĐ</Text>
                  </View>
                  <View className="bg-gray-100 px-3 py-1.5 rounded-xl">
                    <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{selectedProduct?.condition}</Text>
                  </View>
                </View>

                <Text className="text-sm font-black text-primary uppercase tracking-widest mb-3">Mô tả chi tiết</Text>
                <Text className="text-gray-500 text-sm leading-6 mb-10">
                  {selectedProduct?.description}
                </Text>
              </View>
            </ScrollView>

            {/* Sticky Actions */}
            <View className="p-8 bg-white border-t border-black/5 flex-row pb-12">
              <TouchableOpacity 
                onPress={() => setSelectedProduct(null)}
                className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center mr-4"
              >
                <Feather name="x" size={24} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => selectedProduct && handleAction(selectedProduct.id, 'rejected')}
                className="flex-1 bg-red-50 py-4 rounded-2xl items-center justify-center mr-3"
              >
                <Text className="text-red-500 font-black text-[11px] uppercase tracking-widest">Từ chối</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => selectedProduct && handleAction(selectedProduct.id, 'approved')}
                className="flex-[2] bg-primary py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
              >
                {actionLoading === selectedProduct?.id ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-black text-[11px] uppercase tracking-widest">Duyệt ngay</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
