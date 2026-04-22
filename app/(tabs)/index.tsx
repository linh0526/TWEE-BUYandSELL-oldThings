import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter, useFocusEffect } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';
import HomeBanner from '@/components/HomeBanner';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_VIEWED_KEY = '@recently_viewed';

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { getRootCategories, categories, fetchCategories } = useCategoryStore();
  const [products, setProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const rootCategories = useMemo(() => getRootCategories(), [categories, getRootCategories]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      // Fetch categories if not loaded
      await fetchCategories();

      let query = supabase
        .from('products')
        .select('*, profiles(display_name, full_name, trust_score)')
        .eq('status', 'approved')
        .gt('quantity', 0);

      if (selectedLocation) {
        query = query.eq('location', selectedLocation);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);

      // Fetch user favorites
      if (user?.id) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id);

        if (favs) {
          setUserFavorites(favs.map(f => f.product_id));
        }
      } else {
        setUserFavorites([]);
      }

    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_VIEWED_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recently viewed', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
      loadRecentlyViewed();
    }, [selectedLocation, user?.id])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
    loadRecentlyViewed();
  }, [selectedLocation, user?.id]);

  const formatPrice = (price: any) => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g,"")) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(numPrice || 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#FF7524"]} />}
      >
        <TopNavbar 
          placeholder="Tìm kiếm sản phẩm..." 
          isHome={true} 
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />

        <HomeBanner />

        {/* Section: Sản phẩm vừa xem */}
        {recentlyViewed.length > 0 && (
          <View className="mt-10">
            <View className="px-6 flex-row justify-between items-end mb-4">
              <View>
                <Text className="text-lg font-black text-primary tracking-tighter uppercase leading-none">VỪA XEM</Text>
                <View className="h-1 w-8 bg-secondary mt-1 rounded-full" />
              </View>
              <TouchableOpacity onPress={async () => {
                await AsyncStorage.removeItem(RECENT_VIEWED_KEY);
                setRecentlyViewed([]);
              }}>
                <Text className="text-gray-300 font-bold text-[10px] uppercase">Xóa</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {recentlyViewed.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="mr-4 w-28"
                  onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                >
                  <View className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                    <Image source={{ uri: item.image || (item.images && item.images[0]) }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <Text className="text-[10px] font-black text-primary mt-2 uppercase tracking-tighter" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-secondary font-black text-[9px]">{formatPrice(item.price)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section: Danh mục */}
        <View className="mt-10">
          <View className="px-6 mb-4">
             <Text className="text-lg font-black text-primary tracking-tighter uppercase">DANH MỤC</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {rootCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center mr-6"
                onPress={() => router.push({ pathname: '/search', params: { categoryId: cat.id } })}
              >
                <View className="w-16 h-16 rounded-full overflow-hidden mb-2 shadow-sm border border-gray-100">
                   {cat.image_url ? (
                     <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                   ) : (
                     <View className="flex-1 items-center justify-center bg-gray-50">
                       <Feather name="grid" size={20} color="#FF7524" />
                     </View>
                   )}
                </View>
                <Text className="font-black text-[9px] uppercase text-gray-500 text-center w-16" numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section: Danh sách sản phẩm gợi ý */}
        <View className="flex-row items-end justify-between px-6 mb-6 mt-10">
          <View>
            <Text className="text-2xl font-black text-primary tracking-tighter uppercase leading-none">DÀNH CHO BẠN</Text>
            <View className="h-1 w-12 bg-secondary mt-1 rounded-full" />
          </View>
          <TouchableOpacity onPress={() => fetchData(true)}>
            <Text className="text-secondary font-bold text-xs uppercase tracking-widest">Làm mới</Text>
          </TouchableOpacity>
        </View>

        {isLoading && !isRefreshing ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#FF7524" />
          </View>
        ) : (
          <View className="px-4 flex-row flex-wrap">
            {products.length > 0 ? (
              products.map((item) => (
                <View key={item.id} style={{ width: '33.33%', padding: 4 }}>
                  <ProductCard
                    title={item.title}
                    price={formatPrice(item.price)}
                    image={item.image_url || (item.images && item.images[0])}
                    location={item.location}
                    isFavorited={userFavorites.includes(item.id)}
                    onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                  />
                </View>
              ))
            ) : (
              <View className="w-full py-20 items-center">
                <Feather name="package" size={48} color="#EEE" />
                <Text className="text-gray-400 font-bold mt-4 uppercase text-[10px]">Chưa có sản phẩm nào</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
