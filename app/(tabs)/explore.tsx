import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import TopNavbar from '../../components/TopNavbar';
import { STATIC_CATEGORIES } from '../../constants/data';

export default function ExploreScreen() {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: selectedCatId ? { display: 'none' } : {
        height: Platform.OS === 'ios' ? 60 + insets.bottom : 72,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
      },
    });
  }, [selectedCatId, navigation, insets.bottom]);

  const selectedCategory = STATIC_CATEGORIES.find(c => c.id === selectedCatId);
  const subCategories = selectedCategory?.subcategories || [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {selectedCatId ? (
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-black/5 bg-white">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setSelectedCatId(null)}
              className="p-1 rounded-full"
            >
              <Feather name="arrow-left" size={24} color="#FF7524" />
            </TouchableOpacity>
            <Text className="ml-4 text-base font-black text-primary uppercase tracking-widest">
              {selectedCategory?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('search' as never)}>
            <Feather name="search" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      ) : (
        <TopNavbar placeholder="Tìm danh mục..." title="DANH MỤC" isExplore={true} />
      )}

      {selectedCatId ? (
        <View className="flex-1 flex-row bg-white">
          {/* Cột trái: Sidebar danh mục dọc */}
          <View className="w-20 border-r border-black/5 bg-[#F9F9F9]">
              <ScrollView showsVerticalScrollIndicator={false}>
                {STATIC_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCatId(cat.id)}
                    className={`items-center py-4 px-1 ${selectedCatId === cat.id ? 'bg-white' : ''}`}
                  >
                    <View className={`w-12 h-12 rounded-full overflow-hidden mb-1 ${selectedCatId === cat.id ? 'border-2 border-secondary' : 'border border-black/5'}`}>
                      <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <Text 
                      className={`text-[8px] font-black uppercase text-center tracking-tighter ${selectedCatId === cat.id ? 'text-secondary' : 'text-primary/40'}`}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                    {selectedCatId === cat.id && (
                      <View className="absolute left-0 top-4 bottom-4 w-[3px] bg-secondary rounded-r-full" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cột phải: Lưới 2 cột cate chi tiết */}
            <View className="flex-1">
              <ScrollView showsVerticalScrollIndicator={false} className="p-3">
                <View className="flex-row flex-wrap">
                  {subCategories.map((sub, idx) => (
                    <TouchableOpacity 
                      key={idx}
                      className="mb-4 px-1"
                      style={{ width: '50%' }}
                    >
                      <View className="w-full aspect-square rounded-2xl overflow-hidden mb-1.5 shadow-sm bg-white">
                        <Image source={{ uri: sub.image_url }} className="w-full h-full" resizeMode="cover" />
                      </View>
                      <Text className="text-[11px] font-bold text-center text-primary leading-tight px-1" numberOfLines={2}>
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="h-10" />
              </ScrollView>
            </View>
          </View>
        ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8">
            <View className="flex-row flex-wrap justify-between">
              {STATIC_CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedCatId(cat.id)}
                  className="mb-5 overflow-hidden rounded-[32px] border border-black/5"
                  style={{ width: '48%', height: 210, backgroundColor: '#F8F8F8' }}
                >
                  <ImageBackground 
                    source={{ uri: cat.image_url }} 
                    className="flex-1"
                    resizeMode="cover"
                  >
                    <View 
                      className="flex-1 p-6 justify-between"
                      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    >
                      <View 
                        className="self-start p-2 rounded-full border border-white/20"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <Feather name="layers" size={12} color="white" />
                      </View>
                      
                      <View>
                        <Text className="font-black text-xs uppercase text-white mb-1 tracking-widest leading-tight">
                          {cat.name}
                        </Text>
                        <View className="flex-row items-center">
                          <View className="h-[1px] w-4 mr-2" style={{ backgroundColor: '#FF7524' }} />
                          <Text className="text-[10px] font-bold uppercase text-white opacity-80">
                            {Math.floor(Math.random() * 50) + 10} Sản phẩm
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>

            <View 
              className="mt-8 mb-20 rounded-3xl p-8 border border-black/5"
              style={{ backgroundColor: '#F9F9F9' }}
            >
              <Text className="text-xl font-black text-secondary mb-6 uppercase tracking-tighter">
                Khám phá nhanh
              </Text>
              
              <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-black/5">
                  <Text className="text-primary font-bold text-sm">Gần vị trí của bạn</Text>
                  <View className="bg-secondary/10 p-2 rounded-full">
                    <Feather name="chevron-right" size={14} color="#FF7524" />
                  </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-black/5">
                  <Text className="text-primary font-bold text-sm">Đang giảm giá mạnh</Text>
                  <View className="bg-secondary/10 p-2 rounded-full">
                    <Feather name="chevron-right" size={14} color="#FF7524" />
                  </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-5">
                  <Text className="text-primary font-bold text-sm">Reviewers lựa chọn</Text>
                  <View className="bg-secondary/10 p-2 rounded-full">
                    <Feather name="chevron-right" size={14} color="#FF7524" />
                  </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
