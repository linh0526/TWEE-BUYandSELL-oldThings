import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, Platform, LayoutAnimation
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import TopNavbar from '../../components/TopNavbar';
import { FLAT_CATEGORIES } from '../../constants/data_cate';
import { getRootIds, getChildrenIds } from '../../utils/CategoryHelper';

export default function ExploreScreen() {
  const [selectedCatId, setSelectedCatId] = React.useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = React.useState<string | null>(null);

  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. Lấy dữ liệu cần thiết từ Helper và Object
  const rootIds = React.useMemo(() => getRootIds(), []);
  
  const selectedCategory = selectedCatId ? (FLAT_CATEGORIES as any)[selectedCatId] : null;
  const selectedSubCategory = selectedSubId ? (FLAT_CATEGORIES as any)[selectedSubId] : null;

  // Xác định danh sách ID hiển thị ở lưới bên phải
  const displayIds = React.useMemo(() => {
    if (selectedSubId) return getChildrenIds(selectedSubId);
    if (selectedCatId) return getChildrenIds(selectedCatId);
    return rootIds;
  }, [selectedCatId, selectedSubId, rootIds]);

  const displayTitle = selectedSubId 
    ? selectedSubCategory?.name 
    : (selectedCatId ? selectedCategory?.name : 'DANH MỤC');

  // 2. Các hàm xử lý sự kiện
  const handleSetCategory = (id: string | null) => {
    setSelectedCatId(id);
    setSelectedSubId(null);
  };

  const handleSetSubCategory = (id: string | null) => {
    setSelectedSubId(id);
  };

  const handleBack = () => {
    if (selectedSubId) {
      handleSetSubCategory(null);
    } else {
      handleSetCategory(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <TopNavbar 
        title={displayTitle || 'DANH MỤC'} 
        isExplore={!selectedCatId} 
        onBack={selectedCatId ? handleBack : undefined}
        hideIcons={!!selectedCatId}
      />

      {selectedCatId ? (
        <View className="flex-1 flex-row bg-white">
          {/* Cột trái: Sidebar dọc */}
          <View className="w-20 border-r border-black/5 bg-gray-50/50">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
              {rootIds.map((id) => {
                const cat = (FLAT_CATEGORIES as any)[id];
                const isActive = selectedCatId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => handleSetCategory(id)}
                    className={`items-center py-4 px-1 ${isActive ? 'bg-white' : ''}`}
                  >
                    <View className={`w-12 h-12 rounded-full overflow-hidden mb-1 ${isActive ? 'border-2 border-secondary' : 'border border-black/5'}`}>
                      <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <Text className={`text-[8px] font-black uppercase text-center ${isActive ? 'text-secondary' : 'text-primary/40'}`} numberOfLines={2}>
                      {cat.name}
                    </Text>
                    {isActive && <View className="absolute left-0 top-4 bottom-4 w-[3px] bg-secondary rounded-r-full" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Cột phải: Lưới danh mục con */}
          <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false} className="p-3" contentContainerStyle={{ paddingBottom: 100 }}>
              {selectedSubId && (
                <TouchableOpacity onPress={() => handleSetSubCategory(null)} className="mb-4 flex-row items-center px-1">
                  <Feather name="chevron-left" size={16} color="#FF7524" />
                  <Text className="text-secondary font-bold text-xs ml-1 uppercase">Quay lại {selectedCategory?.name}</Text>
                </TouchableOpacity>
              )}

              <View className="flex-row flex-wrap">
                {displayIds.map((id) => {
                  const item = (FLAT_CATEGORIES as any)[id];
                  const childIds = getChildrenIds(id);
                  const hasSubItems = childIds.length > 0;

                  return (
                    <View key={id} style={{ width: '33.33%' }} className="mb-4 px-1">
                      <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={() => {
                          if (hasSubItems) {
                            // Nếu có con -> Chỉ chuyển cấp trong Explore, KHÔNG nhảy sang Search
                            handleSetSubCategory(id);
                          } else {
                          // Nếu là cấp cuối / xem all -> Điều hướng sang Search và truyền ID chính xác
                          router.push({
                            pathname: '/search',
                            params: { categoryId: id } // Dùng ID để Search chuẩn hơn dùng Name
                          });
                        }
                        }
                        }
                      >
                        <View className="w-full aspect-square rounded-2xl overflow-hidden mb-1.5 shadow-sm bg-gray-50">
                            {/* Card ảnh */}
                          <Image source={{ uri: item.image_url || selectedCategory?.image_url }} className="w-full h-full" resizeMode="cover" />
                            {/* icon arrow nếu có subitems*/}
                          {hasSubItems && (
                            <View className="absolute bottom-2 right-2 bg-black/40 p-1 rounded-full z-10">
                              <Feather name="chevron-right" size={10} color="white" />
                            </View>
                          )}
                        </View>
                        <Text className="text-[10px] font-bold text-center text-primary" numberOfLines={2}>{item.name}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/search', params: { categoryId: selectedSubId || selectedCatId }})}
                className="mt-8 mb-16 bg-secondary/10 py-5 rounded-3xl border border-secondary/20 items-center mx-1"
              >
                <Text className="text-secondary font-black text-xs uppercase tracking-widest">Xem tất cả sản phẩm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      ) : (
        /* Màn hình DANH MỤC tổng khi chưa chọn gì */
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-6 py-8">
            <View className="flex-row flex-wrap">
              {rootIds.map((id) => {
                const cat = (FLAT_CATEGORIES as any)[id];
                return (
                  <View key={id} style={{ width: '33.33%', padding: 4 }}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleSetCategory(id)} className="mb-4">
                      <View className="w-full rounded-2xl overflow-hidden mb-2 bg-white border border-black/5" style={{ height: 100 }}>
                        <Image source={{ uri: cat.image_url }} className="w-full h-full" resizeMode="cover" />
                      </View>
                      <Text className="text-[9px] font-black uppercase text-center text-primary tracking-widest">{cat.name}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
