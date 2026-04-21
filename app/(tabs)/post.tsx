import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import TopNavbar from '@/components/TopNavbar';
import Toast from 'react-native-toast-message';
import ImagePickerBox from '@/components/ImagePickerBox';
import { VIETNAM_PROVINCES } from '@/constants/locations';
import { PRODUCT_CONDITIONS } from '@/constants/product';

const { height } = Dimensions.get('window');



export default function PostScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId: string }>();
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

  // UI States
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [tempCategoryPath, setTempCategoryPath] = useState<{id: string, name: string}[]>([]);

  const { categories, getCategoryById, getRootCategories, getChildren } = useCategoryStore();

  const filteredProvinces = useMemo(() => {
    return VIETNAM_PROVINCES.filter(p => 
      p.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locationSearch]);

  const categoryPathList = useMemo(() => {
    const list = [];
    if (categoryId) list.push(getCategoryById(categoryId));
    if (subcategoryId) list.push(getCategoryById(subcategoryId));
    if (subItemId) list.push(getCategoryById(subItemId));
    return list.filter(Boolean);
  }, [categoryId, subcategoryId, subItemId, getCategoryById]);

  // Logic điều hướng danh mục trong Modal
  const categoryOptions = useMemo(() => {
    if (tempCategoryPath.length === 0) return getRootCategories();
    return getChildren(tempCategoryPath[tempCategoryPath.length - 1].id);
  }, [tempCategoryPath, getRootCategories, getChildren]);

  const handleCategoryStep = (cat: {id: string, name: string}) => {
    const newPath = [...tempCategoryPath, { id: cat.id, name: cat.name }];
    const nextChildren = getChildren(cat.id);

    if (nextChildren.length === 0) {
      applyCategoryPath(newPath);
    } else {
      setTempCategoryPath(newPath);
    }
  };

  // Fetch data if editing
  useEffect(() => {
    if (editId) {
      fetchProductData();
    }
  }, [editId]);

  const fetchProductData = async () => {
    if (!editId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', editId)
        .single();
      
      if (error) throw error;
      if (data) {
        setImages(data.images || []);
        setTitle(data.title);
        setPrice(data.price.toString());
        setDescription(data.description);
        setCategoryId(data.category_id);
        setSubcategoryId(data.subcategory_id || '');
        setSubItemId(data.sub_item_id || '');
        setCondition(data.condition || 'Như mới');
        setQuantity(data.quantity.toString());
        setLocation(data.location);
        setDetailedAddress(data.detailed_address || '');
        setWeight(data.weight?.toString() || '');
        setShippingFeeType(data.shipping_fee_type || 'buyer_pays');
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lấy thông tin sản phẩm: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const applyCategoryPath = (path: {id: string, name: string}[]) => {
    setCategoryId(path[0].id);
    setSubcategoryId(path[1]?.id || '');
    setSubItemId(path[2]?.id || '');
    setIsCategoryModalVisible(false);
    setTempCategoryPath([]);
  };

  const uploadImages = async (uris: string[]) => {
    const urls = [];
    for (const uri of uris) {
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      // Sử dụng FormData - Cách chuẩn nhất cho React Native khi dùng Supabase Storage
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, formData, {
          upsert: true
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(data.path);
        
      urls.push(publicUrl);
    }
    return urls;
  };

  const handlePost = async () => {
    // 1. Kiểm tra đăng nhập với Popup chuyên nghiệp
    if (!user) {
      if (Platform.OS === 'web') {
        if (window.confirm('Bạn cần đăng nhập để thực hiện chức năng này. Đăng nhập ngay?')) {
          router.push('/(auth)/login');
        }
      } else {
        Alert.alert(
          'Yêu cầu đăng nhập',
          'Vui lòng đăng nhập để có thể niêm yết sản phẩm của bạn trên Twee.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Đăng nhập ngay', onPress: () => router.push('/(auth)/login'), style: 'default' }
          ]
        );
      }
      return;
    }

    // 2. Ràng buộc điền đầy đủ thông tin
    if (images.length === 0) {
      const msg = 'Vui lòng chọn ít nhất 1 hình ảnh cho sản phẩm';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thiếu ảnh', msg);
      return;
    }
    
    if (!title.trim() || !price || !categoryId) {
      const msg = 'Vui lòng điền Tiêu đề, Giá bán và chọn Danh mục';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thiếu thông tin', msg);
      return;
    }

    if (!description.trim() || description.length < 20) {
      const msg = 'Mô tả cần ít nhất 20 ký tự để người mua dễ hình dung';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Mô tả quá ngắn', msg);
      return;
    }

    if (!location.trim()) {
      const msg = 'Vui lòng nhập Khu vực/Địa điểm bán';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thiếu địa chỉ', msg);
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImages(images);
      
      const productData = {
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
        // Moderation logic: Auto-approve if trust score is high enough (>= 65)
        status: (profile?.trust_score || 0) >= 65 ? 'approved' : 'pending'
      };

      let resultError;
      if (editId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editId);
        resultError = error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        resultError = error;
      }

      if (resultError) throw resultError;
      
      Toast.show({ 
        type: 'success', 
        text1: 'Thành công', 
        text2: editId ? 'Đã cập nhật tin đăng!' : 'Đã đăng tin mới!' 
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
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

          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Danh mục sản phẩm *</Text>
            <TouchableOpacity 
              onPress={() => setIsCategoryModalVisible(true)} 
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  {categoryPathList.length > 0 ? (
                    <View className="flex-row flex-wrap items-center">
                      {categoryPathList.map((cat, idx) => (
                        <View key={cat?.id} className="flex-row items-center">
                          <View className={`px-3 py-1.5 rounded-lg ${idx === categoryPathList.length - 1 ? 'bg-secondary/10' : 'bg-gray-200/50'}`}>
                            <Text className={`text-[11px] font-black uppercase ${idx === categoryPathList.length - 1 ? 'text-secondary' : 'text-gray-500'}`}>
                              {cat?.name}
                            </Text>
                          </View>
                          {idx < categoryPathList.length - 1 && (
                            <Feather name="chevron-right" size={12} color="#CCC" style={{ marginHorizontal: 6 }} />
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="font-bold text-gray-400 italic">Nhấn để chọn danh mục...</Text>
                  )}
                </View>
                <View className="bg-white p-2 rounded-xl shadow-sm">
                  <Feather name="layers" size={18} color="#FF7524" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Tình trạng sản phẩm *</Text>
            <View className="space-y-2">
              {PRODUCT_CONDITIONS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => setCondition(item.label)}
                  className={`p-4 rounded-2xl border flex-row items-center justify-between ${condition === item.label ? 'bg-secondary/5 border-secondary' : 'bg-gray-50 border-gray-100'}`}
                >
                  <View className="flex-1 mr-4">
                    <Text className={`text-sm font-black uppercase ${condition === item.label ? 'text-secondary' : 'text-primary'}`}>{item.label}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold mt-0.5">{item.description}</Text>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${condition === item.label ? 'border-secondary bg-secondary' : 'border-gray-200 bg-white'}`}>
                    {condition === item.label && <Feather name="check" size={12} color="white" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Khu vực *</Text>
            <TouchableOpacity onPress={() => setIsLocationModalVisible(true)} className="bg-gray-50 p-5 rounded-xl flex-row justify-between items-center mb-2">
              <Text className={`font-bold ${location ? 'text-primary' : 'text-gray-400'}`}>{location || 'Chọn tỉnh thành...'}</Text>
              <Feather name="chevron-down" size={18} color="#999" />
            </TouchableOpacity>
            <TextInput value={detailedAddress} onChangeText={setDetailedAddress} className="bg-gray-50 p-5 rounded-xl font-bold" placeholder="Số nhà, tên đường..." />
          </View>

          <View className="mb-4">
             <Text className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Vận chuyển (kg)</Text>
             <View className="flex-row" style={{ gap: 8 }}>
                <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Khối lượng" className="flex-1 bg-gray-50 p-5 rounded-xl font-bold" />
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
            <Text className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Mô tả chi tiết *</Text>
            <TextInput value={description} onChangeText={setDescription} multiline className="bg-gray-50 p-5 rounded-xl font-medium min-h-[140px]" placeholder="Thông tin thêm..." style={{ textAlignVertical: 'top' }} />
          </View>
        </View>

        <TouchableOpacity onPress={handlePost} disabled={loading} className={`p-6 rounded-xl items-center mb-20 ${loading ? 'bg-gray-200' : 'bg-secondary'}`}>
          {loading ? <ActivityIndicator color="#3C1300" /> : <Text className="text-[#3C1300] font-black text-lg uppercase">{editId ? 'Cập nhật tin' : 'Niêm yết ngay'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={isCategoryModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px]" style={{ height: height * 0.7 }}>
            <View className="p-6 flex-1">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                   <Text className="text-lg font-black uppercase tracking-widest">Chọn Danh Mục</Text>
                   {tempCategoryPath.length > 0 && (
                     <Text className="text-[10px] font-bold text-secondary uppercase mt-1">
                        {tempCategoryPath.map(p => p.name).join(' > ')}
                     </Text>
                   )}
                </View>
                <TouchableOpacity onPress={() => { setIsCategoryModalVisible(false); setTempCategoryPath([]); }}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {tempCategoryPath.length > 0 && (
                <TouchableOpacity onPress={() => setTempCategoryPath(tempCategoryPath.slice(0, -1))} className="flex-row items-center mb-4">
                  <Feather name="arrow-left" size={16} color="#FF7524" />
                  <Text className="ml-2 font-black text-xs text-secondary uppercase">Quay lại</Text>
                </TouchableOpacity>
              )}

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="space-y-2">
                  {tempCategoryPath.length > 0 && (
                    <TouchableOpacity onPress={() => applyCategoryPath(tempCategoryPath)} className="p-5 rounded-2xl bg-secondary/5 border border-secondary mb-4">
                      <Text className="text-sm font-black text-secondary uppercase">Áp dụng: {tempCategoryPath[tempCategoryPath.length-1].name}</Text>
                    </TouchableOpacity>
                  )}
                  {categoryOptions.map(cat => (
                    <TouchableOpacity key={cat.id} onPress={() => handleCategoryStep(cat)} className="p-5 rounded-2xl bg-gray-50 flex-row justify-between items-center mb-2">
                      <Text className="font-bold text-primary">{cat.name}</Text>
                      {getChildren(cat.id).length > 0 && <Feather name="chevron-right" size={18} color="#CCC" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal visible={isLocationModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px]" style={{ height: height * 0.8 }}>
            <View className="p-6 flex-1">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-black uppercase tracking-widest">Chọn Khu Vực</Text>
                <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <View className="bg-gray-100 px-4 py-3 rounded-2xl flex-row items-center mb-4">
                <Feather name="search" size={16} color="#999" />
                <TextInput placeholder="Tìm tỉnh thành..." className="flex-1 ml-3 font-bold" value={locationSearch} onChangeText={setLocationSearch} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap">
                  {filteredProvinces.map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => { setLocation(p); setIsLocationModalVisible(false); }} 
                      className={`mr-2 mb-2 px-5 py-3 rounded-2xl border ${location === p ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <Text className={`text-xs font-bold ${location === p ? 'text-white' : 'text-primary'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
