import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';

import { useCategoryStore } from '@/lib/store/useCategoryStore';

// Helper to convert base64 to ArrayBuffer for Supabase Storage
const decodeBase64 = (base64: string) => {
  // Polyfill for atob if it's missing in some RN environments
  const _atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  };

  const binaryString = typeof atob !== 'undefined' ? atob(base64) : _atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const CONDITIONS = [
  { label: 'Mới', desc: 'Hàng mới, chưa mở hộp/ bao bì, chưa qua sử dụng' },
  { label: 'Như mới', desc: 'Hàng mới, chưa mở hộp/ bao bì, chưa qua sử dụng' },
  { label: 'Tốt', desc: 'Đã qua sử dụng, tính năng đầy đủ, hoạt động tốt (có thể có vài vết xước nhỏ)' },
  { label: 'Trung bình', desc: 'Đã qua sử dụng, đầy đủ chức năng, nhiều sai sót hoặc lỗi nhẹ' },
  { label: 'Kém', desc: 'Đã qua sử dụng, nhiều lỗi, có thể bị hư hỏng (đề cập chi tiết nếu hư hỏng)' }
];

export default function PostScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { getRootCategories, getChildren } = useCategoryStore();
  
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [subItemId, setSubItemId] = useState('');
  const [condition, setCondition] = useState('Như mới');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('Hồ Chí Minh');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [shippingFeeType, setShippingFeeType] = useState('buyer_pays'); // 'buyer_pays' hoặc 'seller_pays'
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  // Lấy data từ store
  const categories = getRootCategories();
  const subcategories = categoryId ? getChildren(categoryId) : [];
  const subItems = subcategoryId ? getChildren(subcategoryId) : [];

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setSubcategoryId('');
    setSubItemId('');
  };

  const handleSelectSubcategory = (id: string) => {
    setSubcategoryId(id);
    setSubItemId('');
  };


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập camera để chụp ảnh!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };


  const uploadImages = async (uris: string[]) => {

    const uploadedUrls = [];
    
    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      const ext = uri.split('.').pop() || 'jpg';
      const filename = `${user?.id}/${Date.now()}-${i}.${ext}`;
      
      try {
        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        // Convert to ArrayBuffer
        const arrayBuffer = decodeBase64(base64);

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, arrayBuffer, {
            contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
            upsert: true
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error(`Error uploading image ${i}:`, error);
      }
    }
    
    return uploadedUrls;
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Bạn cần đăng nhập để đăng tin');
      return;
    }

    if (!title || !price || !categoryId) {
      Alert.alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const numericPrice = parseFloat(price.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá sản phẩm hợp lệ');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload images first
      let finalImages = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800']; // Placeholder if no images
      
      if (images.length > 0) {
        const uploadedUrls = await uploadImages(images);
        if (uploadedUrls.length > 0) {
          finalImages = uploadedUrls;
        } else {
          Alert.alert('Lưu ý', 'Không thể tải ảnh lên máy chủ. Sản phẩm sẽ tạm thời sử dụng ảnh mặc định.');
        }
      }

      // 2. Insert product record
      const { data, error } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title,
          price: numericPrice,
          description,
          category_id: categoryId,
          subcategory_id: subcategoryId || null,
          sub_item_id: subItemId || null,
          condition,
          quantity,
          location,
          detailed_address: detailedAddress,
          shipping_fee_type: shippingFeeType,
          weight: weight ? parseFloat(weight) : null,
          length: length ? parseFloat(length) : null,
          width: width ? parseFloat(width) : null,
          height: height ? parseFloat(height) : null,
          images: finalImages,
          status: (profile?.trust_score ?? 0) >= 10 ? 'approved' : 'pending'
        })
        .select();

      if (error) throw error;

      // Reset form after success
      setTitle('');
      setPrice('');
      setDescription('');
      setImages([]);
      setCategoryId('');
      setSubcategoryId('');
      setSubItemId('');
      setCondition('Như mới');
      setQuantity(1);
      setDetailedAddress('');
      setWeight('');
      setLength('');
      setWidth('');
      setHeight('');
      setShippingFeeType('buyer_pays');

      Alert.alert(
        'Thành công!', 
        'Tin đăng của bạn đã được gửi. Chúng tôi sẽ duyệt tin sớm nhất có thể.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi khi đăng tin', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-xl font-black tracking-tighter text-secondary uppercase">Đăng bán món đồ</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photo Upload Section */}
        <View className="mt-8 mb-10">
          <Text className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Hình ảnh thực tế ({images.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity 
              onPress={takePhoto}
              className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl items-center justify-center mr-3"
            >
              <Feather name="camera" size={24} color="#FF7524" />
              <Text className="text-[8px] text-gray-500 font-bold mt-1 uppercase">Chụp ảnh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={pickImage}
              className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl items-center justify-center mr-3"
            >
              <Feather name="image" size={24} color="#FF7524" />
              <Text className="text-[8px] text-gray-500 font-bold mt-1 uppercase">Thư viện</Text>
            </TouchableOpacity>

            {images.map((uri, index) => (
              <View key={index} className="relative mr-3">
                <Image 
                  source={{ uri }} 
                  style={{ width: 96, height: 96, borderRadius: 24 }} 
                />
                <TouchableOpacity 
                  onPress={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white"
                >
                  <Feather name="x" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Basic Info Section */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Tên món đồ bạn bán</Text>
          <TextInput 
            placeholder="Ví dụ: Giày Nike Air Jordan 1 Like New" 
            className="bg-gray-50 p-5 rounded-2xl font-bold text-primary text-base border border-gray-100"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="flex-row mb-8">
          <View className="flex-1 mr-4">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Giá thanh lý (VNĐ)</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 border border-gray-100">
              <TextInput 
                placeholder="0" 
                keyboardType="numeric"
                className="flex-1 py-5 font-black text-primary text-xl"
                placeholderTextColor="#999"
                value={price}
                onChangeText={setPrice}
              />
              <Text className="text-[#FF7524] font-black text-xs uppercase tracking-widest">Đồng</Text>
            </View>
          </View>

          <View className="w-24">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Số lượng</Text>
            <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100 h-[64px]">
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white items-center justify-center border border-gray-100"
              >
                <Feather name="minus" size={14} color="#3C1300" />
              </TouchableOpacity>
              <Text className="font-black text-primary text-lg">{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
              >
                <Feather name="plus" size={14} color="#3C1300" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Category Selection */}
        <View className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className="flex-row items-center flex-wrap">
                <TouchableOpacity onPress={() => { setCategoryId(''); setSubcategoryId(''); setSubItemId(''); }}>
                  <Text className={`text-[10px] font-black uppercase tracking-widest ${!categoryId ? 'text-secondary' : 'text-gray-400'}`}>Danh mục</Text>
                </TouchableOpacity>
                
                {categoryId && (
                  <>
                    <Feather name="chevron-right" size={10} color="#CCC" style={{ marginHorizontal: 4 }} />
                    <TouchableOpacity onPress={() => { setSubcategoryId(''); setSubItemId(''); }}>
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${!subcategoryId ? 'text-secondary' : 'text-gray-400'}`}>
                        {categories.find(c => c.id === categoryId)?.name}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {subcategoryId && (
                  <>
                    <Feather name="chevron-right" size={10} color="#CCC" style={{ marginHorizontal: 4 }} />
                    <Text className="text-[10px] font-black text-secondary uppercase tracking-widest">
                      {subcategories.find(s => s.id === subcategoryId)?.name}
                    </Text>
                  </>
                )}
              </View>
            </View>
            
            {(categoryId || subcategoryId) && (
              <TouchableOpacity 
                onPress={() => {
                  if (subcategoryId) { setSubcategoryId(''); }
                  else if (categoryId) { setCategoryId(''); }
                }}
                className="bg-white px-2 py-1 rounded-lg border border-gray-100"
              >
                <Text className="text-[8px] font-black text-gray-500 uppercase">Quay lại</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row flex-wrap">
            {!categoryId ? (
              categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  onPress={() => handleSelectCategory(cat.id)}
                  className="mr-2 mb-2 px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm"
                >
                  <Text className="text-[11px] font-black text-primary uppercase tracking-tight">{cat.name}</Text>
                </TouchableOpacity>
              ))
            ) : !subcategoryId ? (
              subcategories.length > 0 ? (
                subcategories.map((sub) => (
                  <TouchableOpacity 
                    key={sub.id}
                    onPress={() => handleSelectSubcategory(sub.id)}
                    className="mr-2 mb-2 px-4 py-3 rounded-2xl bg-white border border-secondary shadow-sm"
                  >
                    <Text className="text-[11px] font-black text-primary uppercase tracking-tight">{sub.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-[10px] text-gray-400 font-bold italic ml-2">Không có danh mục con</Text>
              )
            ) : (
              subItems.length > 0 ? (
                subItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id}
                    onPress={() => setSubItemId(item.id)}
                    className={`mr-2 mb-2 px-4 py-3 rounded-2xl border shadow-sm ${subItemId === item.id ? 'bg-secondary border-secondary' : 'bg-white border-gray-100'}`}
                  >
                    <Text className={`text-[11px] font-black uppercase tracking-tight ${subItemId === item.id ? 'text-[#3C1300]' : 'text-primary'}`}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity 
                  onPress={() => setSubItemId('')}
                  className="px-4 py-3 rounded-2xl bg-secondary border border-secondary"
                >
                  <Text className="text-[11px] font-black text-[#3C1300] uppercase">Mặc định</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Condition Selection */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Tình trạng sản phẩm</Text>
          {CONDITIONS.map((item) => (
            <TouchableOpacity 
              key={item.label}
              onPress={() => setCondition(item.label)}
              className={`mb-3 p-4 rounded-3xl border ${condition === item.label ? 'bg-secondary/10 border-secondary' : 'bg-gray-50 border-gray-100'}`}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className={`font-black uppercase tracking-wider ${condition === item.label ? 'text-secondary' : 'text-primary'}`}>{item.label}</Text>
                {condition === item.label && <Feather name="check-circle" size={16} color="#FF7524" />}
              </View>
              <Text className="text-gray-500 text-[11px] font-medium leading-4">{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Detailed Address Section */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Địa điểm & Địa chỉ chi tiết</Text>
          <View className="mb-3">
            <TouchableOpacity className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex-row items-center justify-between">
              <Text className="font-bold text-primary">{location}</Text>
              <Feather name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          <TextInput 
            placeholder="Số nhà, tên đường, phường..." 
            className="bg-gray-50 p-5 rounded-2xl font-bold text-primary border border-gray-100"
            placeholderTextColor="#999"
            value={detailedAddress}
            onChangeText={setDetailedAddress}
          />
        </View>

        {/* Logistics Section */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Khối lượng & Kích thước (Sau đóng gói)</Text>
          
          <View className="mb-3">
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 border border-gray-100">
              <TextInput 
                placeholder="Khối lượng" 
                keyboardType="numeric"
                className="flex-1 py-5 font-black text-primary text-base"
                placeholderTextColor="#999"
                value={weight}
                onChangeText={setWeight}
              />
              <Text className="text-gray-400 font-bold ml-2">kg</Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-2 bg-gray-50 rounded-2xl px-4 border border-gray-100 flex-row items-center">
              <TextInput 
                placeholder="Dài" 
                keyboardType="numeric"
                className="flex-1 py-5 font-black text-primary text-sm"
                placeholderTextColor="#999"
                value={length}
                onChangeText={setLength}
              />
              <Text className="text-[10px] text-gray-400 font-bold">cm</Text>
            </View>
            <View className="flex-1 mr-2 bg-gray-50 rounded-2xl px-4 border border-gray-100 flex-row items-center">
              <TextInput 
                placeholder="Rộng" 
                keyboardType="numeric"
                className="flex-1 py-5 font-black text-primary text-sm"
                placeholderTextColor="#999"
                value={width}
                onChangeText={setWidth}
              />
              <Text className="text-[10px] text-gray-400 font-bold">cm</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 border border-gray-100 flex-row items-center">
              <TextInput 
                placeholder="Cao" 
                keyboardType="numeric"
                className="flex-1 py-5 font-black text-primary text-sm"
                placeholderTextColor="#999"
                value={height}
                onChangeText={setHeight}
              />
              <Text className="text-[10px] text-gray-400 font-bold">cm</Text>
            </View>
          </View>
        </View>

        {/* Shipping Fee Selection */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Phí vận chuyển</Text>
          <View className="flex-row">
            <TouchableOpacity 
              onPress={() => setShippingFeeType('buyer_pays')}
              className={`flex-1 p-5 rounded-2xl border flex-row items-center justify-center mr-2 ${shippingFeeType === 'buyer_pays' ? 'bg-secondary/10 border-secondary' : 'bg-white border-gray-100'}`}
            >
              <Feather name="user" size={16} color={shippingFeeType === 'buyer_pays' ? '#FF7524' : '#999'} style={{ marginRight: 8 }} />
              <Text className={`font-black text-[11px] uppercase ${shippingFeeType === 'buyer_pays' ? 'text-secondary' : 'text-primary'}`}>Người mua trả</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShippingFeeType('seller_pays')}
              className={`flex-1 p-5 rounded-2xl border flex-row items-center justify-center ${shippingFeeType === 'seller_pays' ? 'bg-secondary/10 border-secondary' : 'bg-white border-gray-100'}`}
            >
              <Feather name="gift" size={16} color={shippingFeeType === 'seller_pays' ? '#FF7524' : '#999'} style={{ marginRight: 8 }} />
              <Text className={`font-black text-[11px] uppercase ${shippingFeeType === 'seller_pays' ? 'text-secondary' : 'text-primary'}`}>Người bán trả</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Mô tả chi tiết</Text>
          <TextInput 
            placeholder="Mô tả thêm về sản phẩm, lý do bán..." 
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-gray-50 p-5 rounded-3xl font-medium text-primary text-base border border-gray-100 min-h-[120px]"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={handlePost}
          disabled={loading}
          className={`bg-secondary p-6 rounded-[32px] items-center mb-20 shadow-xl shadow-secondary/30 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#3C1300" />
          ) : (
            <Text className="text-[#3C1300] font-black text-base uppercase tracking-[0.2em]">Đăng tin ngay</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
