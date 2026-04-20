//tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import TopNavbar from '@/components/TopNavbar';
import ImagePickerBox from '@/components/ImagePickerBox';
import { supabase } from '@/lib/supabase';
import { FLAT_CATEGORIES } from '@/constants/data_cate';

export default function PostScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // States cho Auth
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('Như mới');
  const [location, setLocation] = useState('Hồ Chí Minh');
  const [quantity, setQuantity] = useState('1');

  // Kiểm tra xem đã có session chưa khi vào trang
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      setUser(data.user);
      setShowLoginModal(false);
      const msg = 'Đăng nhập thành công! Bạn có thể đăng tin ngay.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thành công', msg);
    } catch (error: any) {
      Platform.OS === 'web' ? window.alert(error.message) : Alert.alert('Lỗi đăng nhập', error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImagesToSupabase = async (uris: string[]) => {
    const publicUrls = [];
    for (const uri of uris) {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
          .from('products')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(data.path);

        publicUrls.push(publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    return publicUrls;
  };

  const handleSubmit = async () => {
    // 1. Kiểm tra đăng nhập
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // 2. Validate dữ liệu
    if (images.length === 0 || !title.trim() || !price.trim() || !categoryId) {
      const msg = 'Vui lòng điền đủ Tiêu đề, Giá, Danh mục và ít nhất 1 hình ảnh nhé!';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thiếu thông tin', msg);
      return;
    }

    setLoading(true);
    try {
      // 3. Upload ảnh
      const imageUrls = await uploadImagesToSupabase(images);

      // 4. Lưu vào Database
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title: title,
          description: description,
          price: parseFloat(price.replace(/[^0-9]/g, '')),
          category_id: categoryId,
          images: imageUrls,
          condition: condition,
          location: location,
          quantity: parseInt(quantity),
          status: 'active'
        });

      if (insertError) throw insertError;

      const successMsg = 'Sản phẩm của bạn đã được đăng niêm yết thành công! 🎉';
      Platform.OS === 'web' ? window.alert(successMsg) : Alert.alert('Thành công!', successMsg);

      setImages([]); setTitle(''); setPrice(''); setDescription(''); setCategoryId('');
    } catch (error: any) {
      const errMsg = error.message || "Không thể đăng tin lúc này";
      Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Lỗi rồi', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <TopNavbar />

      {/* Modal Đăng nhập */}
      <Modal visible={showLoginModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center p-6">
          <View className="bg-white p-8 rounded-3xl space-y-4">
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-xl font-black">ĐĂNG NHẬP</Text>
               <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                  <Feather name="x" size={24} color="black" />
               </TouchableOpacity>
            </View>
            
            <TextInput 
              placeholder="Email (test@gmail.com)" 
              value={email}
              onChangeText={setEmail}
              className="bg-gray-100 p-4 rounded-xl font-bold"
            />
            <TextInput 
              placeholder="Mật khẩu" 
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="bg-gray-100 p-4 rounded-xl font-bold"
            />
            
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className="bg-secondary p-5 rounded-xl items-center mt-4 shadow-lg shadow-secondary/40"
            >
              <Text className="text-white font-black">{loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP NGAY'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 120 }}>
        <ImagePickerBox
          images={images}
          onAddImage={(uri) => setImages([...images, uri])}
          onRemoveImage={(idx) => setImages(images.filter((_, i) => i !== idx))}
        />

        {/* ... (Các phần UI input giữ nguyên như cũ) ... */}
        <View className="space-y-6">
          {/* Tiêu đề */}
          <View className="mb-4">
            <Text className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Tiêu đề niêm yết</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ví dụ: iPhone 15 Pro Max..."
              className="bg-surface-container-high p-4 rounded-xl font-bold text-primary"
            />
          </View>

          {/* Giá tiền */}
          <View className="mb-4">
             <Text className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Giá bán</Text>
             <View className="flex-row items-center bg-surface-container-high rounded-xl px-4">
               <TextInput
                 value={price}
                 onChangeText={setPrice}
                 placeholder="0"
                 keyboardType="numeric"
                 className="flex-1 py-4 font-black text-primary text-lg"
               />
               <Text className="text-secondary font-black">VNĐ</Text>
             </View>
          </View>

          {/* Danh mục */}
          <View className="mb-4">
            <Text className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {Object.entries(FLAT_CATEGORIES)
                .filter(([_, cat]) => (cat as any).level === 0)
                .map(([id, cat]) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => setCategoryId(id)}
                  className={`mr-2 px-4 py-2 rounded-full border ${categoryId === id ? 'bg-secondary border-secondary' : 'bg-surface border-outline'}`}
                >
                  <Text className={`text-xs font-bold ${categoryId === id ? 'text-white' : 'text-primary'}`}>{(cat as any).name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tình trạng & Vị trí */}
          <View className="flex-row mb-4" style={{ gap: 16 }}>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Tình trạng</Text>
              <TextInput value={condition} onChangeText={setCondition} className="bg-surface-container-high p-4 rounded-xl font-bold text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Khu vực</Text>
              <TextInput value={location} onChangeText={setLocation} className="bg-surface-container-high p-4 rounded-xl font-bold text-primary" />
            </View>
          </View>

          {/* Mô tả */}
          <View className="mb-8">
            <Text className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Mô tả chi tiết</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Thông tin thêm về sản phẩm..."
              multiline
              className="bg-surface-container-high p-4 rounded-xl font-bold text-primary min-h-[100px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`p-5 rounded-xl items-center mt-4 mb-20 ${loading ? 'bg-gray-400' : 'bg-secondary'}`}
        >
          <Text className="text-[#3C1300] font-black text-lg uppercase">
            {loading ? 'Đang xử lý...' : 'Niêm yết ngay'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}