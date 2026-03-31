import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import TopNavbar from '@/components/TopNavbar';
import { FLAT_CATEGORIES } from '@/constants/data_cate';
import { MOCK_PRODUCTS } from '@/app/search';

const rootCategories = Object.entries(FLAT_CATEGORIES) 
  .filter(([_, details]: [string, any]) => details.parent === null)
  .map(([id, details]: [string, any]) => ({
    id, // Gán key vào làm thuộc tính id
    ...details,
  }))

const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* New Navbar Style - Modern Search Left, Icons Right */}
        <TopNavbar placeholder="Tìm kiếm sản phẩm..." isHome={true} />

        {/* Categories Section - Circular with Static Data */}
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
                <View className={`w-16 h-16 rounded-full overflow-hidden mb-2 shadow-sm border border-outline`}>
                   {cat.image_url ? (
                     <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                   ) : (
                     <View className="flex-1 items-center justify-center bg-gray-100">
                        <Feather name="grid" size={20} color="#999" />
                     </View>
                   )}
                </View>
                <Text 
                  className={`font-black text-[9px] uppercase tracking-tighter text-primary/60`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
 
        {/* Featured Section Header */}
        <View className="flex-row items-end justify-between px-6 mb-8 mt-6">
          <View>
             <Text className="text-2xl font-black text-primary tracking-tighter">DÀNH CHO BẠN</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-secondary font-bold text-xs uppercase tracking-widest">Xem tất cả</Text>
          </TouchableOpacity>
        </View>
 
        {/* Product Grid - 3 Column Layout */}
                <View className="px-4 flex-row flex-wrap justify-between">
                  {MOCK_PRODUCTS.map((item) => (
                    <View key={item.id} style={{ width: '31.5%', marginBottom: 16 }}>
                      <ProductCard
                        title={item.title}
                        price={item.price}
                        image={item.image}
                        location={item.location}
                        // XỬ LÝ CLICK: Truyền dữ liệu sang trang product.tsx trong (tabs)
                        onPress={() => router.push({
                          pathname: '/product',
                          params: {
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            image: item.image,
                            location: item.location
                          }
                        })}
                      />
                    </View>
                  ))}
                </View>
      </ScrollView>
    </SafeAreaView>
  );
}


export default HomeScreen;