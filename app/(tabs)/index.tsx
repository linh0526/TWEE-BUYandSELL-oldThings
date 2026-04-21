import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

const HomeScreen = () => {
  const router = useRouter();
  const { getRootCategories, categories } = useCategoryStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rootCategories = useMemo(() => getRootCategories(), [categories, getRootCategories]);

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Lỗi lấy sản phẩm:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts(false);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#FF7524"]} />}
      >
        <TopNavbar placeholder="Tìm kiếm sản phẩm..." isHome={true} />

        <View className="mt-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {rootCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center mr-6"
                onPress={() => router.push({ pathname: '/search', params: { categoryId: cat.id } })}
              >
                <View className="w-16 h-16 rounded-full overflow-hidden mb-2 shadow-sm border border-gray-100">
                   {cat.image_url ? <Image source={{ uri: cat.image_url }} className="w-full h-full" /> : <View className="flex-1 items-center justify-center bg-gray-100"><Feather name="grid" size={20} color="#999" /></View>}
                </View>
                <Text className="font-black text-[9px] uppercase text-gray-500">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-row items-end justify-between px-6 mb-8 mt-6">
          <Text className="text-2xl font-black text-primary tracking-tighter uppercase">DÀNH CHO BẠN</Text>
          <TouchableOpacity onPress={() => fetchProducts(true)}><Text className="text-secondary font-bold text-xs uppercase">Làm mới</Text></TouchableOpacity>
        </View>

        {isLoading && !isRefreshing ? <ActivityIndicator size="large" color="#FF7524" className="mt-10" /> : (
          <View className="px-4 flex-row flex-wrap justify-between">
            {products.map((item) => (
              <View key={item.id} style={{ width: '31.5%', marginBottom: 16 }}>
                <ProductCard
                  title={item.title}
                  price={formatPrice(item.price)}
                  image={item.image_url || item.images?.[0]}
                  location={item.location}
                  onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
export default HomeScreen;