import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { VIETNAM_PROVINCES } from '@/constants/locations';
import { PRODUCT_CONDITIONS } from '@/constants/product';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';


const { height } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const { q, categoryId: initialCatId, sellerId } = useLocalSearchParams<{ q?: string, categoryId?: string, sellerId?: string }>();
  
  // State cơ bản
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [sellerName, setSellerName] = useState<string | null>(null);
  
  // State Bộ lọc nâng cao
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [filterCondition, setFilterCondition] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // UI States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Category Logic
  const { getCategoryById, getRootIds, getChildrenIds } = useCategoryStore();
  const [categoryPath, setCategoryPath] = useState<{id: string, name: string}[]>([
    { id: 'all', name: 'Tất cả' }
  ]);

  // Đồng bộ category từ params ban đầu
  useEffect(() => {
    if (initialCatId && initialCatId !== 'all') {
      const item = getCategoryById(initialCatId);
      if (item) {
        const pathIds = item.path ? item.path.split('/') : [initialCatId];
        const newPath = [
          { id: 'all', name: 'Tất cả' },
          ...pathIds.map((id: string) => {
            const cat = getCategoryById(id);
            return { id, name: cat?.name || 'Danh mục' };
          })
        ];
        setCategoryPath(newPath);
      }
    }
  }, [initialCatId, getCategoryById]);

  // Load history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading history', e);
    }
  };

  const saveToHistory = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    try {
      const newHistory = [trimmed, ...history.filter(h => h !== trimmed)].slice(0, 10);
      setHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving history', e);
    }
  };

  const removeFromHistory = async (text: string) => {
    try {
      const newHistory = history.filter(h => h !== text);
      setHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error removing history', e);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.error('Error clearing history', e);
    }
  };

  // Lấy thông tin shop nếu có sellerId
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!sellerId) {
        setSellerName(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, full_name')
          .eq('id', sellerId)
          .single();
        
        if (data) {
          setSellerName(data.display_name || data.full_name || 'Cửa hàng');
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin shop:', error);
      }
    };

    fetchSellerInfo();
  }, [sellerId]);

  const currentLevelId = categoryPath[categoryPath.length - 1].id;

  // Lấy các tùy chọn danh mục con hiển thị dưới dạng Chips
  const categoryOptions = useMemo(() => {
    const targetIds = currentLevelId === 'all' ? getRootIds() : getChildrenIds(currentLevelId);
    return targetIds.map(id => {
      const item = getCategoryById(id);
      return {
        id,
        name: item?.name || 'Unknown',
        hasChildren: getChildrenIds(id).length > 0
      };
    });
  }, [currentLevelId, getCategoryById, getChildrenIds, getRootIds]);

  // Đệ quy lấy tất cả ID con
  const getAllChildrenIds = useCallback((id: string): string[] => {
    const children = getChildrenIds(id);
    let all = [...children];
    children.forEach(childId => {
      all = [...all, ...getAllChildrenIds(childId)];
    });
    return all;
  }, [getChildrenIds]);

  // Hàm lấy dữ liệu từ Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*, profiles(display_name, trust_score)')
        .eq('status', 'approved');

      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

      if (currentLevelId !== 'all') {
        const allDescendants = [currentLevelId, ...getAllChildrenIds(currentLevelId)];
        query = query.in('category_id', allDescendants);
      }

      if (filterCondition) query = query.eq('condition', filterCondition);
      if (location) query = query.eq('location', location);
      if (priceRange.min) query = query.gte('price', parseInt(priceRange.min));
      if (priceRange.max) query = query.lte('price', parseInt(priceRange.max));

      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentLevelId, filterCondition, location, priceRange, sortBy, getAllChildrenIds]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (opt: { id: string, name: string, hasChildren: boolean }) => {
    setCategoryPath([...categoryPath, { id: opt.id, name: opt.name }]);
  };

  const handleBreadcrumbPress = (index: number) => {
    setCategoryPath(categoryPath.slice(0, index + 1));
  };

  const resetFilters = () => {
    setFilterCondition(null);
    setLocation(null);
    setPriceRange({ min: '', max: '' });
    setCategoryPath([{ id: 'all', name: 'Tất cả' }]);
    setSortBy('newest');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Search Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <View className={`flex-1 flex-row items-center bg-gray-50 px-4 py-2 rounded-2xl border ${isFocused ? 'border-secondary' : 'border-gray-100'}`}>
          <Feather name="search" size={16} color={isFocused ? "#FF7524" : "#999"} />
          <TextInput 
            className="flex-1 ml-3 font-bold text-sm text-primary py-1" 
            placeholder="Tìm gì cũng có..." 
            value={searchQuery} 
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => saveToHistory(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Filter & Sort Bar */}
      <View className="flex-row items-center px-6 py-3 border-b border-gray-50 justify-between">
        <TouchableOpacity 
          onPress={() => setIsSortVisible(true)}
          className="flex-row items-center bg-gray-50 px-4 py-2 rounded-xl"
        >
          <Text className="text-[10px] font-black uppercase text-gray-500 mr-2">
            Sắp xếp: {sortBy === 'price_asc' ? 'Giá thấp-cao' : sortBy === 'price_desc' ? 'Giá cao-thấp' : 'Mới nhất'}
          </Text>
          <Feather name="chevron-down" size={14} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsFilterVisible(true)}
          className={`p-2.5 rounded-xl ${isFilterVisible ? 'bg-secondary' : 'bg-gray-50'}`}
        >
          <Feather name="sliders" size={16} color={isFilterVisible ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search History */}
        {isFocused && history.length > 0 && searchQuery.length === 0 && (
          <View className="px-6 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tìm kiếm gần đây</Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text className="text-[10px] font-bold text-secondary">Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {history.map((item, index) => (
                <View key={index} className="flex-row items-center bg-gray-50 rounded-full pl-4 pr-2 py-1.5 mr-2 mb-2 border border-gray-100">
                  <TouchableOpacity onPress={() => setSearchQuery(item)}>
                    <Text className="text-xs font-bold text-primary mr-2">{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFromHistory(item)}>
                    <Feather name="x" size={12} color="#CCC" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Product Grid */}
        <View className="p-4">
          <View className="flex-row items-center mb-4 px-2">
            <Text className="text-sm font-black text-primary">
              {sellerName ? `Sản phẩm của "${sellerName}"` : (searchQuery ? `Kết quả cho "${searchQuery}"` : categoryPath[categoryPath.length - 1].name)}
            </Text>
            <Text className="text-xs font-bold text-gray-400 ml-2">— {products.length} sản phẩm</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#FF7524" size="large" className="mt-20" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.map(item => (
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
              {/* Dummy views for alignment */}
              {products.length % 3 === 2 && <View style={{ width: '31.5%' }} />}
              {products.length % 3 === 1 && (
                <>
                  <View style={{ width: '31.5%' }} />
                  <View style={{ width: '31.5%' }} />
                </>
              )}
              {products.length === 0 && (
                <View className="items-center justify-center w-full mt-20">
                  <Feather name="search" size={64} color="#F0F0F0" />
                  <Text className="text-gray-400 font-bold mt-4">Không tìm thấy kết quả</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sort Options Modal */}
      <Modal visible={isSortVisible} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/20" onPress={() => setIsSortVisible(false)}>
          <View className="absolute top-48 left-6 right-6 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl">
            {[
              { label: 'Mới nhất', value: 'newest' },
              { label: 'Giá từ thấp đến cao', value: 'price_asc' },
              { label: 'Giá từ cao đến thấp', value: 'price_desc' }
            ].map((item) => (
              <TouchableOpacity 
                key={item.value}
                onPress={() => { setSortBy(item.value as any); setIsSortVisible(false); }}
                className={`px-6 py-5 border-b border-gray-50 flex-row justify-between items-center ${sortBy === item.value ? 'bg-secondary/5' : ''}`}
              >
                <Text className={`text-sm ${sortBy === item.value ? 'font-black text-secondary' : 'font-bold text-primary'}`}>{item.label}</Text>
                {sortBy === item.value && <Feather name="check" size={16} color="#FF7524" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Advanced Filter Modal */}
      <Modal visible={isFilterVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px]" style={{ height: height * 0.85 }}>
            <View className="p-6 flex-1">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-8">
                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-black uppercase tracking-widest">Bộ lọc nâng cao</Text>
                <TouchableOpacity onPress={resetFilters}>
                  <Text className="text-secondary font-bold text-xs">Đặt lại</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Category Breadcrumbs */}
                <Text className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Danh mục</Text>
                <View className="flex-row items-center flex-wrap mb-4">
                  {categoryPath.map((node, i) => (
                    <React.Fragment key={i}>
                      <TouchableOpacity onPress={() => handleBreadcrumbPress(i)}>
                        <Text className={`text-xs ${i === categoryPath.length - 1 ? 'font-black text-secondary' : 'font-bold text-gray-400'}`}>
                          {node.name}
                        </Text>
                      </TouchableOpacity>
                      {i < categoryPath.length - 1 && <Text className="mx-2 text-gray-200">{'>'}</Text>}
                    </React.Fragment>
                  ))}
                </View>

                <View className="flex-row flex-wrap mb-8">
                  {categoryOptions.map((opt: any) => (
                    <TouchableOpacity 
                      key={opt.id}
                      onPress={() => handleCategorySelect(opt)}
                      className="mr-2 mb-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 flex-row items-center"
                    >
                      <Text className="text-xs font-bold text-primary">{opt.name}</Text>
                      {opt.hasChildren && <Feather name="chevron-right" size={12} color="#CCC" className="ml-1" />}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Price Range */}
                <Text className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Khoảng giá (VNĐ)</Text>
                <View className="flex-row items-center mb-8" style={{ gap: 12 }}>
                  <TextInput 
                    placeholder="Từ" placeholderTextColor="#BBB" keyboardType="numeric" 
                    className="flex-1 bg-gray-50 p-4 rounded-2xl font-bold" value={priceRange.min} 
                    onChangeText={(t: string) => setPriceRange({...priceRange, min: t})} 
                  />
                  <View className="w-4 h-[1.5px] bg-gray-100" />
                  <TextInput 
                    placeholder="Đến" placeholderTextColor="#BBB" keyboardType="numeric" 
                    className="flex-1 bg-gray-50 p-4 rounded-2xl font-bold" value={priceRange.max} 
                    onChangeText={(t: string) => setPriceRange({...priceRange, max: t})} 
                  />
                </View>

                {/* Condition */}
                <Text className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Tình trạng</Text>
                <View className="mb-10" style={{ gap: 8 }}>
                  {PRODUCT_CONDITIONS.map(cond => (
                    <TouchableOpacity 
                      key={cond.label}
                      onPress={() => setFilterCondition(filterCondition === cond.label ? null : cond.label)}
                      className={`p-4 rounded-2xl border ${filterCondition === cond.label ? 'bg-secondary/5 border-secondary' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className={`text-sm font-black ${filterCondition === cond.label ? 'text-secondary' : 'text-primary'}`}>{cond.label}</Text>
                          <Text className="text-[10px] font-bold text-gray-400 mt-1 leading-tight">{cond.description}</Text>
                        </View>
                        {filterCondition === cond.label && <Feather name="check-circle" size={18} color="#FF7524" />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Location */}
                <Text className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Khu vực</Text>
                <View className="flex-row flex-wrap mb-8">
                  <TouchableOpacity 
                    onPress={() => setLocation(null)}
                    className={`mr-2 mb-2 px-5 py-3 rounded-2xl border ${!location ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <Text className={`text-xs font-bold ${!location ? 'text-white' : 'text-primary'}`}>Toàn quốc</Text>
                  </TouchableOpacity>
                  {VIETNAM_PROVINCES.map(province => (
                    <TouchableOpacity 
                      key={province}
                      onPress={() => setLocation(province)}
                      className={`mr-2 mb-2 px-5 py-3 rounded-2xl border ${location === province ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <Text className={`text-xs font-bold ${location === province ? 'text-white' : 'text-primary'}`}>{province}</Text>
                    </TouchableOpacity>
                  ))}
                </View>


              </ScrollView>

              <TouchableOpacity 
                className="bg-secondary p-5 rounded-3xl items-center shadow-lg shadow-secondary/20 mb-6" 
                onPress={() => setIsFilterVisible(false)}
              >
                <Text className="text-white font-black uppercase tracking-widest">Áp dụng lọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}