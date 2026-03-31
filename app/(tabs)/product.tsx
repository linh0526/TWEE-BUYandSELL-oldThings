import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORY_DESCRIPTIONS: any = {
   'Sách': [
     "Sách chính hãng, giấy còn thơm mùi mới, không bị quăn mép hay gạch xóa. Bìa cứng cáp, rất thích hợp để sưu tầm hoặc làm quà tặng.",
     "Cuốn này mình đọc giữ gìn rất kỹ, không có nếp gấp trang. Nội dung cực hay, phù hợp cho bạn nào đang tìm kiếm tri thức mới với giá hạt dẻ.",
     "Hàng hiếm, bản in đời đầu. Tình trạng 95%, giấy có ngả vàng nhẹ theo thời gian nhìn rất vintage. Fan cứng của tác giả không nên bỏ qua."
   ],
   'Thời trang': [
     "Vải bao xịn, không xù lông hay bay màu. Form dáng cực chuẩn, mặc lên là tôn dáng ngay. Đồ mình chỉ mới diện 1-2 lần đi tiệc thôi nè.",
     "Hàng hiệu pass nhanh cho bạn nào cùng size. Chất liệu thoáng mát, đường kim tỉ mỉ. Cam kết sạch sẽ, thơm tho, nhận hàng là mặc được luôn.",
     "Style cực chất, dễ phối đồ. Tình trạng như mới, không lỗi lầm. Pass lại vì mình đổi phong cách, giá này là quá hời cho một món đồ chất lượng."
   ],
   'Điện tử': [
     "Máy nguyên zin, chưa qua sửa chữa, pin còn rất trâu. Mọi chức năng hoạt động hoàn hảo, bao test tại chỗ 30 phút cho yên tâm.",
     "Ngoại hình keng 99%, không một vết trầy xước. Đầy đủ phụ kiện đi kèm. Hiệu năng cực đỉnh cho anh em chiến game mượt mà.",
     "Hàng chính hãng dùng cực giữ gìn. Màn hình sáng đẹp, không điểm chết. Giá bớt lộc cho bạn nào thiện chí qua xem máy sớm."
   ],
   'Mặc định': [
     "Sản phẩm được Twee tuyển chọn kỹ lưỡng, đảm bảo chất lượng vượt trội so với giá tiền. Tình trạng đúng như hình ảnh mô tả 100%.",
     "Món đồ độc bản đang chờ chủ nhân mới. Ngoại hình đẹp, công năng tốt. Liên hệ ngay với Admin để không bỏ lỡ deal hời này nhé!"
   ]
 };

const POLICIES = [
  "Bảo hành 1 tháng", "Lỗi 1 đổi 1", "Nguyên zin 100%", "Giao nhanh 2h", "Bao test tại chỗ", "Giá thợ cực tốt", "Hỗ trợ trả góp"
];

export default function ProductDetailScreen() {
  const item = useLocalSearchParams();
  const router = useRouter();

  // Logic tự nhận diện Category từ Title để lấy câu mô tả phù hợp
  const randomDesc = React.useMemo(() => {
    const title = (item.title as string) || "";
    let category = 'Mặc định';

    if (title.toLowerCase().includes('sách') || title.toLowerCase().includes('truyện')) category = 'Sách';
    else if (title.toLowerCase().includes('áo') || title.toLowerCase().includes('quần') || title.toLowerCase().includes('giày')) category = 'Thời trang';
    else if (title.toLowerCase().includes('iphone') || title.toLowerCase().includes('macbook') || title.toLowerCase().includes('máy')) category = 'Điện tử';

    const list = CATEGORY_DESCRIPTIONS[category] || CATEGORY_DESCRIPTIONS['Mặc định'];
    // Dùng ID để cố định câu mô tả cho từng sản phẩm
    const index = Math.abs(parseInt(item.id as string) || 0) % list.length;
    return list[index];
  }, [item.id, item.title]);

  const randomTags = React.useMemo(() => {
    return [...POLICIES].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [item.id]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <View className="flex-row items-center justify-between px-6 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
          >
            <Feather name="arrow-left" size={20} color="#FF7524" />
          </TouchableOpacity>
          <View className="bg-white/80 px-4 py-2 rounded-full border border-black/5">
            <Text className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">TWEE PREMIUM</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm">
            <Feather name="share-2" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View className="items-center pt-8 pb-10">
          <View style={styles.mainCard}>
            <Image
              source={item.image as string}
              style={{ width: width * 0.8, height: width * 0.8 }}
              contentFit="cover"
              transition={800}
            />
            <View className="absolute top-6 right-6 bg-black/40 px-3 py-1 rounded-full">
                <Text className="text-[8px] text-white font-black">1/1</Text>
            </View>
          </View>
        </View>

        <View className="px-10">
          <View className="flex-row items-center justify-between mb-4">
             <View className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <Text className="text-[8px] font-black text-green-600 uppercase tracking-widest">Đang rao bán</Text>
             </View>
             <View className="flex-row items-center">
                <Feather name="map-pin" size={12} color="#FF7524" />
                <Text className="ml-2 text-[9px] font-black text-primary/40 uppercase tracking-widest">{item.location || 'Hồ Chí Minh'}</Text>
             </View>
          </View>

          <View className="flex-row justify-between items-start">
            <Text className="flex-1 text-3xl font-black text-primary uppercase leading-[38px] tracking-tighter">
                {item.title}
            </Text>
            <TouchableOpacity className="ml-4 p-3 bg-secondary/10 rounded-full">
                <Feather name="heart" size={22} color="#FF7524" />
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row items-baseline">
            <Text className="text-4xl font-black text-secondary tracking-tighter">{item.price}</Text>
            <Text className="ml-2 text-[10px] font-black text-secondary/50 uppercase tracking-widest">VNĐ</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-8 flex-row">
             {randomTags.map((tag, i) => (
               <View key={i} className="mr-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/5">
                  <Text className="text-[9px] font-black text-primary/50 uppercase tracking-widest">{tag}</Text>
               </View>
             ))}
          </ScrollView>

          <View className="h-[1px] bg-black/5 my-10" />

          <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 p-5 rounded-[32px] border border-black/5">
            <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-[22px] bg-secondary items-center justify-center shadow-lg shadow-secondary/20">
                    <Text className="text-white font-black text-lg">AT</Text>
                </View>
                <View className="ml-4">
                    <View className="flex-row items-center">
                        <Text className="text-sm font-black text-primary uppercase mr-2">Admin Twee</Text>
                        <Feather name="check-circle" size={14} color="#22C55E" />
                    </View>
                    <Text className="text-[9px] text-primary/40 font-bold uppercase mt-1 tracking-widest">4.9⭐ • Phản hồi nhanh</Text>
                </View>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <View className="mt-10">
             <Text className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em] mb-4">Mô tả chi tiết</Text>
             <Text className="text-primary/60 font-bold text-[13px] leading-6 uppercase tracking-tight">
                {randomDesc}
             </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.chatBtn} activeOpacity={0.7}>
          <Feather name="message-circle" size={26} color="#FF7524" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} activeOpacity={0.8}>
          <Text className="font-black text-[#3C1300] uppercase tracking-[0.2em] text-xs">Liên hệ chốt ngay</Text>
          <View className="ml-4 bg-black/10 p-2 rounded-full">
             <Feather name="arrow-right" size={14} color="#3C1300" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.85)',
    ...Platform.select({ ios: { backdropFilter: 'blur(15px)' } }),
  },
  mainCard: {
    borderRadius: 48, overflow: 'hidden', backgroundColor: '#fff',
    shadowColor: "#000", shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.12, shadowRadius: 35, elevation: 20,
    borderWidth: 1, borderColor: '#F5F5F5',
  },
  footerContainer: {
    position: 'absolute', bottom: 40, left: 30, right: 30,
    flexDirection: 'row', alignItems: 'center',
  },
  chatBtn: {
    width: 68, height: 68, backgroundColor: '#fff', borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF7524',
  },
  buyBtn: {
    flex: 1, height: 68, backgroundColor: '#FF7524', marginLeft: 15, borderRadius: 26,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: "#FF7524", shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35, shadowRadius: 25, elevation: 12,
  }
});