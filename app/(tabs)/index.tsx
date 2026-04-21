import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Lấy danh mục gốc
  const rootCategories = useMemo(() => getRootCategories(), [categories, getRootCategories]);

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      let query = supabase
        .from('products')
        .select('*, profiles(display_name, full_name, trust_score)')
        .eq('status', 'approved');
      
      if (selectedLocation) {
        query = query.eq('location', selectedLocation);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
    fetchProducts(true);
  }, [selectedLocation]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts(false);
    }, [selectedLocation])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts(false);
  }, [selectedLocation]);

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
        <TopNavbar 
          placeholder="Tìm kiếm sản phẩm..." 
          isHome={true} 
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />

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
          products.length === 0 ? (
            <View className="px-6 py-20 items-center justify-center">
              <View className="bg-gray-50 p-8 rounded-[40px] mb-6">
                <Feather name="shopping-bag" size={48} color="#CCC" />
              </View>
              <Text className="text-lg font-black text-primary text-center mb-2 uppercase tracking-widest">
                Ôi, Trống Trơn!
              </Text>
              <Text className="text-gray-400 text-center mb-8 px-10 leading-5 font-medium">
                Không có sản phẩm khu vực này, bạn hãy đăng bán nhéeee.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/post')}
                className="bg-secondary px-8 py-4 rounded-2xl shadow-lg shadow-secondary/20"
              >
                <Text className="text-white font-black uppercase text-xs">Đăng bán ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-4 flex-row flex-wrap justify-between">
              {products.map((item) => (
                <View key={item.id} style={{ width: '31.5%', marginBottom: 16 }}>
                  <ProductCard
                    title={item.title}
                    price={formatPrice(item.price)}
                    image={item.image_url || item.images?.[0]}
                    location={item.location}
                    shipping_fee_type={item.shipping_fee_type}
                    is_trusted={(item.profiles?.trust_score || 0) > 65}
                    onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                  />
                </View>
              ))}
              {/* View trống để căn lề cho dòng cuối khi dùng justify-between */}
              {products.length % 3 === 2 && (
                <View style={{ width: '31.5%', height: 0 }} />
              )}
              {products.length % 3 === 1 && (
                <>
                  <View style={{ width: '31.5%', height: 0 }} />
                  <View style={{ width: '31.5%', height: 0 }} />
                </>
              )}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
export default HomeScreen;