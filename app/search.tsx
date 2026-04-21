import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

const { height } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*, profiles(display_name, full_name)').eq('status', 'active');
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
      if (priceRange.min) query = query.gte('price', parseInt(priceRange.min));
      if (priceRange.max) query = query.lte('price', parseInt(priceRange.max));

      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data } = await query;
      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [searchQuery, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} /></TouchableOpacity>
        <TextInput className="flex-1 ml-4 font-bold" placeholder="Tìm kiếm..." value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity onPress={() => setIsFilterVisible(true)}><Feather name="sliders" size={20} color="#FF7524" /></TouchableOpacity>
      </View>
      <ScrollView className="flex-1 p-4">
        {loading ? <ActivityIndicator color="#FF7524" className="mt-10" /> : (
          <View className="flex-row flex-wrap">
            {products.map(item => (
              <View key={item.id} style={{ width: '33.33%', padding: 4 }}>
                <ProductCard
                  title={item.title}
                  price={formatPrice(item.price)}
                  image={item.image_url || item.images?.[0]}
                  hideTitle
                  hideLocation
                  onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal visible={isFilterVisible} animationType="slide">
        <SafeAreaView className="flex-1 p-6">
          <Text className="text-xl font-black mb-6">BỘ LỌC GIÁ</Text>
          <TextInput placeholder="Giá tối thiểu" keyboardType="numeric" className="bg-gray-100 p-4 rounded-xl mb-4" value={priceRange.min} onChangeText={t => setPriceRange({...priceRange, min: t})} />
          <TextInput placeholder="Giá tối đa" keyboardType="numeric" className="bg-gray-100 p-4 rounded-xl mb-8" value={priceRange.max} onChangeText={t => setPriceRange({...priceRange, max: t})} />
          <TouchableOpacity className="bg-secondary p-5 rounded-2xl items-center" onPress={() => { fetchProducts(); setIsFilterVisible(false); }}>
            <Text className="text-white font-bold">ÁP DỤNG</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}