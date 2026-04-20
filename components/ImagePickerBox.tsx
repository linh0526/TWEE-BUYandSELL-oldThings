import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerBoxProps {
  images: string[];
  onAddImage: (uri: string) => void;
  onRemoveImage: (index: number) => void;
}

export default function ImagePickerBox({ images, onAddImage, onRemoveImage }: ImagePickerBoxProps) {

  // Hàm mở Thư viện ảnh
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thiếu quyền truy cập', 'Bạn cần cho phép app truy cập thư viện ảnh nha!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Cho phép cắt cúp ảnh
      aspect: [1, 1], // Cắt ảnh theo tỷ lệ vuông cho đẹp
      quality: 0.8, // Nén ảnh lại một chút cho nhẹ app
    });

    if (!result.canceled) {
      onAddImage(result.assets[0].uri);
    }
  };

  // Hàm mở Camera chụp ảnh
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thiếu quyền truy cập', 'Bạn cần cho phép app sử dụng Camera nha!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onAddImage(result.assets[0].uri);
    }
  };

  return (
    <View className="mb-10">
      <Text className="text-[10px] font-bold text-on-surface-variant mb-4 uppercase tracking-[0.2em]">Hình ảnh sản phẩm</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {/* Vòng lặp hiển thị các ảnh đã chọn */}
        {images.map((uri, index) => (
          <View key={index} className="w-28 h-28 mr-4 relative rounded-2xl overflow-hidden border border-outline">
            <Image source={{ uri }} className="w-full h-full" />

            {/* Nút dấu X để xóa ảnh */}
            <TouchableOpacity
              onPress={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"
            >
              <Feather name="x" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Nút Chụp ảnh */}
        <TouchableOpacity onPress={takePhoto} className="w-28 h-28 bg-surface-container-high border border-outline rounded-2xl items-center justify-center mr-4">
          <Feather name="camera" size={24} color="#FF7524" />
          <Text className="text-[9px] text-on-surface-variant font-black mt-2 uppercase tracking-widest">Chụp ảnh</Text>
        </TouchableOpacity>

        {/* Nút Thư viện */}
        <TouchableOpacity onPress={pickImage} className="w-28 h-28 bg-surface-container-high border border-outline rounded-2xl items-center justify-center mr-4">
          <Feather name="image" size={24} color="#FF7524" />
          <Text className="text-[9px] text-on-surface-variant font-black mt-2 uppercase tracking-widest">Thư viện</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}