import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';
import { useCart } from '../../context/CartContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';

const HomeScreen = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { getRootCategories, categories } = useCategoryStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rootCategories = React.useMemo(() => getRootCategories(), [categories]);

  // Hàm lấy sản phẩm từ Supabase
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
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
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm format giá tiền
  const formatPrice = (price: number) => {
    if (!price) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <TopNavbar placeholder="Tìm kiếm sản phẩm..." isHome={true} />

        {/* Categories Section */}
        <View className="mt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {rootCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center mr-6"
                onPress={() => router.push({ pathname: '/explore', params: { categoryId: cat.id } })}
              >
                <View className="w-16 h-16 rounded-full overflow-hidden mb-2 shadow-sm border border-outline">
                   {cat.image_url ? (
                     <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                   ) : (
                     <View className="flex-1 items-center justify-center bg-gray-100">
                        <Feather name="grid" size={20} color="#999" />
                     </View>
                   )}
                </View>
                <Text className="font-black text-[9px] uppercase tracking-tighter text-primary/60">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title Section */}
        <View className="flex-row items-end justify-between px-6 mb-8 mt-6">
          <View>
             <Text className="text-2xl font-black text-primary tracking-tighter">DÀNH CHO BẠN</Text>
          </View>
          <TouchableOpacity onPress={fetchProducts}>
            <Text className="text-secondary font-bold text-xs uppercase tracking-widest">Làm mới</Text>
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
        {isLoading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#FF7524" />
          </View>
        ) : (
          <View className="px-4 flex-row flex-wrap justify-between">
            {products.map((item) => (
              <View key={item.id} style={{ width: '31.5%', marginBottom: 16 }}>
                <ProductCard
                  title={item.title}
                  price={formatPrice(item.price)}
                  image={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                  location={item.location}
                  onPress={() => {
                    addToCart({
                      id: item.id,
                      name: item.title,
                      price: formatPrice(item.price),
                      image: item.images?.[0],
                      shop: 'Tiệm đồ cũ TWEE',
                      checked: true,
                      qty: 1
                    });

                    router.push({
                      pathname: '/product',
                      params: {
                        id: item.id,
                        title: item.title,
                        price: formatPrice(item.price),
                        image: item.images?.[0],
                        location: item.location
                      }
                    });
                  }}
                />
              </View>
            ))}

            {products.length === 0 && (
              <View className="w-full items-center py-20">
                <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chưa có sản phẩm nào được đăng</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
