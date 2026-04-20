import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import TopNavbar from '@/components/TopNavbar';
import ImagePickerBox from '@/components/ImagePickerBox';

const CONDITIONS = [
  { label: 'Mới', desc: 'Hàng mới, chưa qua sử dụng' },
  { label: 'Như mới', desc: 'Sử dụng lướt, ngoại hình đẹp' },
  { label: 'Tốt', desc: 'Hoạt động tốt, trầy xước nhẹ' },
  { label: 'Trung bình', desc: 'Cũ, đầy đủ chức năng' },
  { label: 'Kém', desc: 'Nhiều lỗi hoặc hư hỏng' }
];

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { getRootCategories, getChildren } = useCategoryStore();

  const [loading, setLoading] = useState(false);

  // Form States
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [subItemId, setSubItemId] = useState('');
  const [condition, setCondition] = useState('Như mới');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState('Hồ Chí Minh');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [shippingFeeType, setShippingFeeType] = useState('buyer_pays');

  const categories = getRootCategories();
  const subcategories = categoryId ? getChildren(categoryId) : [];

  const uploadImages = async (uris: string[]) => {
    const urls = [];
    for (const uri of uris) {
      try {
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const response = await fetch(uri);
        const blob = await response.blob();
        const { data, error } = await supabase.storage.from('products').upload(fileName, blob);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
        urls.push(publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    return urls;
  };

  const handlePost = async () => {
    if (!user) {
      const msg = 'Bạn cần đăng nhập để đăng tin';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Lỗi', msg);
      return;
    }
    if (!title || !price || !categoryId) {
      const msg = 'Vui lòng điền đủ Tiêu đề, Giá và Danh mục';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thiếu thông tin', msg);
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImages(images);
      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        title,
        price: parseFloat(price.replace(/[^0-9]/g, '')),
        description,
        category_id: categoryId,
        subcategory_id: subcategoryId || null,
        sub_item_id: subItemId || null,
        condition,
        quantity: parseInt(quantity),
        location,
        detailed_address: detailedAddress,
        images: imageUrls,
        weight: weight ? parseFloat(weight) : null,
        shipping_fee_type: shippingFeeType,
        status: 'active'
      });

      if (error) throw error;
      const successMsg = 'Đăng tin thành công! 🎉';
      Platform.OS === 'web' ? window.alert(successMsg) : Alert.alert('Thành công', successMsg);
      router.push('/(tabs)');
    } catch (error: any) {
      Platform.OS === 'web' ? window.alert(error.message) : Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <TopNavbar />
      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>

        <ImagePickerBox
          images={images}
          onAddImage={(uri) => setImages([...images, uri])}
          onRemoveImage={(idx) => setImages(images.filter((_, i) => i !== idx))}
        />

        <View className="space-y-6">
          {/* Thông tin cơ bản */}
          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Tiêu đề niêm yết *</Text>
            <TextInput value={title} onChangeText={setTitle} className="bg-gray-50 p-5 rounded-xl font-bold" placeholder="Nhập tên sản phẩm..." />
          </View>

          <View className="flex-row mb-4" style={{ gap: 16 }}>
            <View className="flex-1">
              <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Giá bán (VNĐ) *</Text>
              <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" className="bg-gray-50 p-5 rounded-xl font-black text-secondary" placeholder="0" />
            </View>
            <View className="w-24">
              <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Số lượng</Text>
              <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" className="bg-gray-50 p-5 rounded-xl font-black text-center" />
            </View>
          </View>

          {/* Danh mục phân cấp */}
          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Danh mục chính *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => { setCategoryId(cat.id); setSubcategoryId(''); }}
                  className={`mr-2 px-4 py-2 rounded-full border ${categoryId === cat.id ? 'bg-secondary border-secondary' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-xs font-bold ${categoryId === cat.id ? 'text-white' : 'text-gray-600'}`}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {categoryId && subcategories.length > 0 && (
            <View className="mb-4">
              <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Danh mục con</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {subcategories.map(sub => (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => setSubcategoryId(sub.id)}
                    className={`mr-2 px-4 py-2 rounded-full border ${subcategoryId === sub.id ? 'bg-secondary border-secondary' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={`text-xs font-bold ${subcategoryId === sub.id ? 'text-white' : 'text-gray-600'}`}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tình trạng sản phẩm */}
          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Tình trạng sản phẩm</Text>
            <View className="flex-row flex-wrap">
              {CONDITIONS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => setCondition(item.label)}
                  className={`mr-2 mb-2 px-4 py-3 rounded-2xl border ${condition === item.label ? 'bg-secondary/10 border-secondary' : 'bg-gray-50 border-gray-100'}`}
                >
                  <Text className={`text-xs font-black uppercase ${condition === item.label ? 'text-secondary' : 'text-gray-500'}`}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Địa điểm */}
          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Khu vực & Địa chỉ chi tiết</Text>
            <TextInput value={location} onChangeText={setLocation} className="bg-gray-50 p-5 rounded-xl font-bold mb-2" placeholder="Ví dụ: Hồ Chí Minh" />
            <TextInput value={detailedAddress} onChangeText={setDetailedAddress} className="bg-gray-50 p-5 rounded-xl font-bold" placeholder="Số nhà, tên đường..." />
          </View>

          {/* Vận chuyển */}
          <View className="mb-4">
             <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Vận chuyển (kg)</Text>
             <View className="flex-row">
                <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Khối lượng" className="flex-1 bg-gray-50 p-5 rounded-xl font-bold mr-2" />
                <TouchableOpacity
                  onPress={() => setShippingFeeType(shippingFeeType === 'buyer_pays' ? 'seller_pays' : 'buyer_pays')}
                  className="flex-1 bg-gray-50 p-5 rounded-xl items-center justify-center border border-gray-100"
                >
                  <Text className="text-[10px] font-black uppercase text-secondary">
                    {shippingFeeType === 'buyer_pays' ? 'Người mua trả phí' : 'Người bán trả phí'}
                  </Text>
                </TouchableOpacity>
             </View>
          </View>

          <View className="mb-8">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Mô tả chi tiết</Text>
            <TextInput value={description} onChangeText={setDescription} multiline className="bg-gray-50 p-5 rounded-xl font-medium min-h-[140px]" placeholder="Thông tin thêm..." style={{ textAlignVertical: 'top' }} />
          </View>
        </View>

        <TouchableOpacity onPress={handlePost} disabled={loading} className={`p-6 rounded-xl items-center mb-20 ${loading ? 'bg-gray-200' : 'bg-secondary'}`}>
          {loading ? <ActivityIndicator color="#3C1300" /> : <Text className="text-[#3C1300] font-black text-lg uppercase">Niêm yết ngay</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
