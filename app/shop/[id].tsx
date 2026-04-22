import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const { width } = Dimensions.get('window');

// HeaderComponent được tách ra để tránh lỗi Navigation context
const HeaderComponent = ({ seller, products, activeTab, setActiveTab, selectedRating, setSelectedRating, id, reviews, ratingCounts }: any) => {
  const router = useRouter();
  const shopName = seller?.display_name || seller?.full_name || 'Shop Twee';
  const joinedDate = seller?.created_at ? new Date(seller.created_at).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : 'Tháng 01, 2024';
  const displayChar = (shopName?.[0] || 'T').toUpperCase();

  return (
    <View>
      {/* ... previous content ... */}
      <View className="h-44 relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800' }} 
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <View className="absolute inset-0 bg-black/20" />
        
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-12 left-6 w-10 h-10 bg-black/20 rounded-full items-center justify-center border border-white/30"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          className="absolute top-12 right-6 w-10 h-10 bg-black/20 rounded-full items-center justify-center border border-white/30"
        >
          <Feather name="share-2" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View className="px-6 -mt-16">
        <View className="bg-white rounded-[40px] p-6 shadow-2xl shadow-black/10 border border-gray-100">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center border-l-4 border-secondary pl-4">
                <View className="relative">
                  <View 
                    style={{ width: 80, height: 80, borderRadius: 30, backgroundColor: '#fff', elevation: 5 }} 
                    className="shadow-lg shadow-black/20"
                  >
                    {seller?.avatar_url ? (
                      <Image 
                        key={seller.avatar_url}
                        source={{ uri: seller.avatar_url }} 
                        style={{ width: '100%', height: '100%', borderRadius: 30, borderWidth: 4, borderColor: '#fff' }}
                        contentFit="cover"
                        cachePolicy="disk"
                      />
                    ) : (
                      <View 
                        style={{ width: '100%', height: '100%', borderRadius: 30, borderWidth: 4, borderColor: '#fff' }} 
                        className="bg-secondary items-center justify-center"
                      >
                        <Text className="text-white text-3xl font-black">{displayChar}</Text>
                      </View>
                    )}
                  </View>
                  <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
                </View>
              <View className="ml-4">
                <View className="flex-row items-center">
                  <Text className="text-xl font-black text-primary uppercase mr-2">{shopName}</Text>
                  <Feather name="check-circle" size={14} color="#FF7524" />
                </View>
                <View className="flex-row items-center mt-1">
                  <View className="bg-orange-50 px-3 py-1 rounded-full flex-row items-center">
                    <Text className="text-[9px] font-black text-secondary uppercase">Đang hoạt động</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity className="bg-primary/5 p-3 rounded-2xl">
                <Feather name="bell" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Key Stats Row */}
          <View className="flex-row justify-between mt-8 px-2 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
            <View className="items-center">
              <Text className="text-lg font-black text-primary">{products.length}</Text>
              <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Sản phẩm</Text>
            </View>
            <View className="w-[1px] h-8 bg-gray-200" />
            <View className="items-center">
              <Text className="text-lg font-black text-primary">{reviews.length}</Text>
              <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Đánh giá</Text>
            </View>
            <View className="w-[1px] h-8 bg-gray-200" />
            <View className="items-center">
              <Text className="text-lg font-black text-primary">{seller?.trust_score ?? 30}</Text>
              <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Tin cậy</Text>
            </View>
          </View>

          {/* Quick Info Grid */}
          <View className="mt-6 flex-row flex-wrap" style={{ gap: 8 }}>
            {[
              { icon: 'calendar', label: 'Tham gia', value: joinedDate },
              { icon: 'message-square', label: 'Phản hồi', value: '99%' },
              { icon: 'shield', label: 'Xác minh', value: 'Đã xác thực', highlight: true },
              { 
                icon: 'star', 
                label: 'Đánh giá', 
                value: reviews.length > 0 
                  ? `${(reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)}/5.0` 
                  : 'Chưa có' 
              },
            ].map((item, idx) => (
              <View key={idx} className={`flex-1 min-w-[45%] p-4 rounded-3xl border ${item.highlight ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-50'}`}>
                <View className="flex-row items-center mb-1">
                  <Feather name={item.icon as any} size={12} color={item.highlight ? '#FF7524' : '#0F172A'} />
                  <Text className="ml-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.label}</Text>
                </View>
                <Text className={`text-[11px] font-black uppercase ${item.highlight ? 'text-secondary' : 'text-primary'}`}>{item.value}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity className="mt-6 w-full bg-primary py-4 rounded-[24px] items-center">
            <Text className="text-xs font-black text-white uppercase tracking-widest">Theo dõi shop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="mt-8 px-6">
        <View className="flex-row bg-gray-50 p-1.5 rounded-[28px] border border-gray-100 shadow-inner">
          {(['products', 'reviews', 'about'] as const).map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-4 items-center rounded-[22px] ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-[0.1em] ${activeTab === tab ? 'text-primary' : 'text-gray-400'}`}>
                {tab === 'products' ? 'Sản phẩm' : tab === 'reviews' ? `Đánh giá (${reviews.length})` : 'Về shop'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="px-6 py-6 flex-row items-center justify-between">
         <Text className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">
            {activeTab === 'products' ? 'Danh sách sản phẩm' : activeTab === 'reviews' ? 'Nhận xét từ cộng đồng' : 'Câu chuyện của chúng tôi'}
         </Text>
         {activeTab === 'products' && (
           <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { sellerId: id } } as any)}>
              <Feather name="sliders" size={14} color="#FF7524" />
           </TouchableOpacity>
         )}
      </View>

      {activeTab === 'reviews' && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="px-6 mb-4"
          contentContainerStyle={{ paddingRight: 40, gap: 10 }}
        >
          <TouchableOpacity 
            onPress={() => setSelectedRating(null)}
            className={`px-6 py-3 rounded-2xl border ${selectedRating === null ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20' : 'bg-white border-gray-100'}`}
          >
            <Text className={`text-[11px] font-black uppercase ${selectedRating === null ? 'text-white' : 'text-gray-400'}`}>Tất cả ({reviews.length})</Text>
          </TouchableOpacity>
          {[5, 4, 3, 2, 1].map((star) => (
            <TouchableOpacity 
              key={star}
              onPress={() => setSelectedRating(star)}
              className={`px-6 py-3 rounded-2xl border flex-row items-center ${selectedRating === star ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20' : 'bg-white border-gray-100'}`}
            >
              <Text className={`text-[11px] font-black uppercase mr-2 ${selectedRating === star ? 'text-white' : 'text-gray-400'}`}>{star} ({ratingCounts[star]})</Text>
              <Feather name="star" size={12} color={selectedRating === star ? 'white' : '#FF7524'} strokeWidth={3} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default function ShopScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [seller, setSeller] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'products' | 'reviews' | 'about'>('products');
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);

  // Thêm useMemo để lọc đánh giá tại chỗ, không cần gọi API lại
  const filteredReviews = React.useMemo(() => {
    if (selectedRating === null) return reviews;
    return reviews.filter(r => r.rating === selectedRating);
  }, [reviews, selectedRating]);

  React.useEffect(() => {
    if (id) {
      fetchInitialData();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      console.log('--- FETCHING SHOP DATA ---');
      console.log('Shop ID from params:', id);
      
      const [profileRes, productsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('products').select('*').eq('seller_id', id).eq('status', 'approved').gt('quantity', 0).order('created_at', { ascending: false }),
        supabase.from('reviews').select(`
          *,
          user:user_id (
            display_name,
            full_name,
            avatar_url
          )
        `).eq('shop_id', id).order('created_at', { ascending: false })
      ]);

      if (profileRes.error) {
        console.error('Profile Fetch Error:', profileRes.error);
        throw profileRes.error;
      }
      setSeller(profileRes.data);

      if (productsRes.error) {
        console.error('Products Fetch Error:', productsRes.error);
        throw productsRes.error;
      }
      setProducts(productsRes.data || []);

      if (reviewsRes.error) {
        console.error('Reviews Fetch Error:', reviewsRes.error);
        throw reviewsRes.error;
      }
      
      console.log('Reviews received from DB:', reviewsRes.data?.length || 0);
      console.log('Sample review shop_id:', reviewsRes.data?.[0]?.shop_id);
      setReviews(reviewsRes.data || []);

    } catch (error: any) {
      console.error('Shop fetch overall error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Tính toán số lượng đánh giá cho mỗi mức sao
  const ratingCounts = React.useMemo(() => {
    const counts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    return counts;
  }, [reviews]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#FF7524" size="large" />
      </View>
    );
  }

  const shopName = seller?.display_name || seller?.full_name || 'Shop Twee';

  return (
    <View className="flex-1 bg-white">
      <FlatList
        key={`${activeTab}-${selectedRating}`} // Thêm selectedRating vào key để ổn định hơn khi lọc
        data={activeTab === 'products' ? products : activeTab === 'reviews' ? filteredReviews : [seller]}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        numColumns={activeTab === 'products' ? 2 : 1}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={activeTab === 'products' ? { paddingHorizontal: 20, gap: 15 } : undefined}
        ListHeaderComponent={
          <HeaderComponent 
            seller={seller}
            products={products}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            id={id}
            reviews={reviews}
            ratingCounts={ratingCounts}
          />
        }
        renderItem={({ item }) => {
          if (activeTab === 'products') {
            return (
              <View style={{ width: (width - 55) / 2 }}>
                <ProductCard
                  title={item.title}
                  price={formatPrice(item.price)}
                  image={item.images?.[0] || item.image_url}
                  location={item.location}
                  shipping_fee_type={item.shipping_fee_type}
                  is_trusted={(seller?.trust_score || 0) > 65}
                  onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                />
              </View>
            );
          }
          if (activeTab === 'reviews') {
            return (
              <View className="px-6 mb-6">
                <View className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm shadow-black/5">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center">
                      <Image 
                        source={{ uri: item.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
                        className="w-10 h-10 rounded-full mr-3 border border-gray-100"
                      />
                      <View>
                        <Text className="text-zs font-black text-primary uppercase">{item.user?.display_name || item.user?.full_name || 'Người dùng Twee'}</Text>
                        <Text className="text-[9px] font-bold text-gray-400 mt-0.5">
                          {new Date(item.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row bg-orange-50 px-2 py-1 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <Feather key={i} name="star" size={8} color={i < item.rating ? '#FF7524' : '#E5E7EB'} style={{ marginLeft: 1 }} />
                      ))}
                    </View>
                  </View>
                  <Text className="text-[13px] font-medium text-primary/80 leading-6">
                    {item.comment || 'Người mua không để lại nhận xét.'}
                  </Text>
                  {item.images && item.images.length > 0 && (
                     <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                        {item.images.map((img: string, idx: number) => (
                           <Image key={idx} source={{ uri: img }} className="w-20 h-20 rounded-xl mr-2" />
                        ))}
                     </ScrollView>
                  )}
                </View>
              </View>
            );
          }
          if (activeTab === 'about') {
            return (
              <View className="px-6">
                <View className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <View className="flex-row items-center mb-6">
                    <View className="w-10 h-10 bg-secondary/10 rounded-2xl items-center justify-center mr-4">
                      <Feather name="info" size={20} color="#FF7524" />
                    </View>
                    <Text className="text-sm font-black text-primary uppercase tracking-tight">Giới thiệu về {shopName}</Text>
                  </View>
                  
                  <Text className="text-[14px] font-medium text-primary/70 leading-7 mb-8">
                    {seller?.shop_description || 'Chưa có thông tin giới thiệu. Shop này đang bận chuẩn bị những sản phẩm tốt nhất cho bạn!'}
                  </Text>

                  <View className="space-y-4">
                    <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
                      <Feather name="map-pin" size={16} color="#FF7524" />
                      <View className="ml-4">
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Địa điểm</Text>
                        <Text className="text-[12px] font-black text-primary uppercase mt-0.5">{seller?.location || 'Chưa cập nhật'}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl mt-3">
                      <Feather name="phone" size={16} color="#FF7524" />
                      <View className="ml-4">
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Liên hệ</Text>
                        <Text className="text-[12px] font-black text-primary uppercase mt-0.5">{seller?.phone_number || 'Chưa công khai'}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center p-4 bg-gray-50 rounded-2xl mt-3">
                      <Feather name="award" size={16} color="#FF7524" />
                      <View className="ml-4">
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Xác minh</Text>
                        <Text className="text-[12px] font-black text-primary uppercase mt-0.5">
                          {seller?.phone_verified ? 'Đã xác thực danh tính' : 'Chưa xác thực'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20 px-10">
             {activeTab === 'products' ? (
               <>
                 <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
                    <Feather name="package" size={32} color="#CBD5E1" />
                 </View>
                 <Text className="text-xs font-black text-gray-300 uppercase tracking-widest text-center">
                   Chưa có sản phẩm nào
                 </Text>
               </>
             ) : activeTab === 'reviews' ? (
               <>
                 <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
                    <Feather name="message-square" size={32} color="#CBD5E1" />
                 </View>
                 <Text className="text-xs font-black text-gray-300 uppercase tracking-widest text-center">
                   Chưa có đánh giá nào
                 </Text>
               </>
             ) : null}
          </View>
        )}
      />
    </View>
  );
}

