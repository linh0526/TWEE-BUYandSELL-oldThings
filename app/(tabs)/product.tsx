import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Platform, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PRODUCT_CONDITIONS } from '@/constants/product';
import { useCart } from '@/context/CartContext';
import Toast from 'react-native-toast-message';
import { getImageUrl } from '@/utils/image';

const { width, height } = Dimensions.get('window');



export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string; price?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = React.useState<any>(null);
  const [seller, setSeller] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showConditionModal, setShowConditionModal] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin sản phẩm
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (prodError) throw prodError;
      setProduct(prodData);

      // 2. Lấy thông tin người bán
      if (prodData?.seller_id) {
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('display_name, full_name, avatar_url')
          .eq('id', prodData.seller_id)
          .single();
        
        if (!sellerError) setSeller(sellerData);
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProduct = user?.id === product?.seller_id;

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const cartItem = {
      id: product?.id || params.id,
      name: product?.title || params.title,
      price: product?.price || params.price,
      image_url: product?.image_url,
      images: product?.images,
      shop: seller?.display_name || seller?.full_name || 'Người bán Twee',
      stock: product?.quantity || 1,
      seller_id: product?.seller_id
    };
    addToCart(cartItem);
    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Đã thêm sản phẩm vào giỏ hàng.'
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const cartItem = {
      id: product?.id || params.id,
      name: product?.title || params.title,
      price: product?.price || params.price,
      image_url: product?.image_url,
      images: product?.images,
      shop: seller?.display_name || seller?.full_name || 'Người bán Twee',
      stock: product?.quantity || 1,
      seller_id: product?.seller_id
    };
    addToCart(cartItem);
    router.push('/cart');
  };

  const item = product || params; // Fallback to params if fetch fails or still loading

  const formatPrice = (price: any) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#FF7524" size="large" />
      </View>
    );
  }

  const sellerName = seller?.display_name || seller?.full_name || 'Người bán Twee';
  const sellerInitial = (sellerName?.[0] || 'T').toUpperCase();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <View className="flex-row items-center justify-between px-6 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 items-center justify-center"
          >
            <View className="w-10 h-10 bg-black/20 rounded-full items-center justify-center">
              <Feather name="arrow-left" size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <View className="bg-black/20 px-4 py-2 rounded-full border border-white/10">
            <Text className="text-[8px] font-black uppercase tracking-[0.3em] text-white">TWEE PREMIUM</Text>
          </View>

          <TouchableOpacity className="w-12 h-12 items-center justify-center">
            <View className="w-10 h-10 bg-black/20 rounded-full items-center justify-center">
              <Feather name="share-2" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 160 }}
        bounces={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item.image_url || item.image || item.images) }}
            style={{ width: '100%', height: 480 }}
            contentFit="cover"
            transition={800}
          />
          <View className="absolute bottom-12 right-6 bg-black/40 px-3 py-1 rounded-full">
              <Text className="text-[10px] text-white font-black">1/1</Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View className="flex-row items-center justify-between mb-2">
             <View className="flex-row items-center">
                <View className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 mr-2">
                  <Text className="text-[7px] font-black text-gray-500 uppercase">OFFICIAL LISTING</Text>
                </View>
                {item.shipping_fee_type === 'seller_pays' && (
                  <View className="bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                    <Text className="text-[7px] font-black text-green-600 uppercase">Freeship</Text>
                  </View>
                )}
             </View>
             <View className="flex-row items-center">
                <Feather name="map-pin" size={10} color="#FF7524" />
                <Text className="ml-1.5 text-[8px] font-black text-primary/40 uppercase tracking-widest">{item.location || 'Hồ Chí Minh'}</Text>
             </View>
          </View>

          <Text className="text-lg font-black text-primary uppercase leading-7 tracking-tighter mb-4">
              {item.title}
          </Text>

          <View className="flex-row justify-between items-center bg-gray-50 p-6 rounded-[32px] border border-black/5">
            <View>
              <View className="flex-row items-baseline mb-1">
                <Text className="text-3xl font-black text-secondary tracking-tighter">{formatPrice(item.price)}</Text>
                <Text className="ml-1 text-[10px] font-black text-secondary/50 uppercase tracking-widest">VNĐ</Text>
              </View>
              <Text className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em]">Giá niêm yết</Text>
            </View>
            <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-black/5">
                <Feather name="heart" size={22} color="#FF7524" />
            </TouchableOpacity>
          </View>

          <View className="mt-8 flex-row items-center border-y border-black/5 py-6">
             <View className="flex-1 items-center border-r border-black/5">
                <View className="flex-row items-center mb-2">
                  <Text className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">Tình trạng</Text>
                  <TouchableOpacity onPress={() => setShowConditionModal(true)} className="ml-1.5 p-1">
                    <Feather name="info" size={10} color="#FF7524" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm font-black text-primary uppercase">{item.condition || 'Rất tốt'}</Text>
             </View>
             <View className="flex-1 items-center">
                <Text className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] mb-2">Số lượng</Text>
                <Text className="text-sm font-black text-primary uppercase">{item.quantity || 1} cái</Text>
             </View>
          </View>

          <View className="mt-10">
             <Text className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] mb-4">Mô tả chi tiết</Text>
             <Text className="text-primary/60 font-bold text-[14px] leading-6 tracking-tight">
                {item.description || 'Người bán chưa cung cấp mô tả chi tiết cho sản phẩm này.'}
             </Text>
          </View>

          <View className="h-[1px] bg-black/5 my-10" />

          <Text className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] mb-6">Thông tin người bán</Text>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item.seller_id } } as any)}
            className="flex-row items-center justify-between bg-gray-50 p-5 rounded-[32px] border border-black/5"
          >
            <View className="flex-row items-center">
                {seller?.avatar_url ? (
                  <Image source={{ uri: seller.avatar_url }} className="w-14 h-14 rounded-[22px]" />
                ) : (
                  <View className="w-14 h-14 rounded-[22px] bg-secondary items-center justify-center shadow-lg shadow-secondary/20">
                      <Text className="text-white font-black text-lg">{sellerInitial}</Text>
                  </View>
                )}
                <View className="ml-4">
                    <View className="flex-row items-center">
                        <Text className="text-sm font-black text-primary uppercase mr-2">{sellerName}</Text>
                        <Feather name="check-circle" size={14} color="#22C55E" />
                        {(seller?.trust_score || 0) > 65 && (
                          <View className="ml-2 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                             <Text className="text-[7px] font-black text-blue-600 uppercase">Uy tín</Text>
                          </View>
                        )}
                    </View>
                    <Text className="text-[9px] text-primary/40 font-bold uppercase mt-1 tracking-widest">4.9⭐ • Phản hồi nhanh</Text>
                </View>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        {isOwnProduct ? (
          <TouchableOpacity 
            style={[styles.buyBtn, { marginLeft: 0 }]} 
            onPress={() => router.push({ pathname: '/(tabs)/post', params: { editId: item.id } })}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={20} color="#3C1300" />
            <Text className="ml-2 font-black text-[#3C1300] uppercase tracking-[0.05em] text-[15px]">Chỉnh sửa tin của bạn</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.cartBtn} 
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Feather name="shopping-cart" size={20} color="#FF7524" />
              <Text className="ml-2 font-black text-primary uppercase text-[14px]">Thêm vào giỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.buyBtn} 
              onPress={handleBuyNow}
              activeOpacity={0.8}
            >
              <Text className="font-black text-[#3C1300] uppercase tracking-[0.05em] text-[15px]">Mua ngay</Text>
              <View className="ml-2 bg-black/10 p-1 rounded-full">
                 <Feather name="arrow-right" size={12} color="#3C1300" />
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Login Required Modal */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 32, padding: 32, width: '100%', maxWidth: 400, alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, backgroundColor: '#FFF5EE', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
               <Feather name="log-in" size={32} color="#FF7524" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 }}>Bạn chưa đăng nhập</Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>Vui lòng đăng nhập để có thể trải nghiệm mua sắm và quản lý đơn hàng tốt nhất trên Twee.</Text>
            
            <TouchableOpacity 
              onPress={() => {
                setShowLoginModal(false);
                router.push('/(auth)/login');
              }}
              style={{ backgroundColor: '#FF7524', width: '100%', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Đăng nhập ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowLoginModal(false)}
              style={{ width: '100%', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#999', fontWeight: '700', fontSize: 14 }}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Condition Details Modal */}
      <Modal
        visible={showConditionModal}
        transparent
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 48 }}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-lg font-black uppercase tracking-widest">Tiêu chuẩn tình trạng</Text>
              <TouchableOpacity onPress={() => setShowConditionModal(false)} className="p-2 bg-gray-50 rounded-full">
                <Feather name="x" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              {PRODUCT_CONDITIONS.map((cond, idx) => (
                <View key={idx} className="mb-6 flex-row">
                  <View className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 mr-4" />
                  <View className="flex-1">
                    <Text className="text-sm font-black text-primary mb-1 uppercase tracking-tight">{cond.label}</Text>
                    <Text className="text-xs font-bold text-gray-500 leading-5">{cond.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => setShowConditionModal(false)}
              className="mt-8 bg-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
            >
              <Text className="text-white text-base font-black uppercase tracking-widest">Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  imageContainer: {
    backgroundColor: '#000',
    width: '100%',
    height: 480,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 40,
    minHeight: height - 300,
  },
  footerContainer: {
    position: 'absolute', bottom: 40, left: 24, right: 24,
    flexDirection: 'row', alignItems: 'center',
  },
  cartBtn: {
    flex: 0.8, height: 64, backgroundColor: '#fff', borderRadius: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF7524',
  },
  buyBtn: {
    flex: 1, height: 64, backgroundColor: '#FF7524', marginLeft: 12, borderRadius: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  }
});