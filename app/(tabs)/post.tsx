import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import TopNavbar from '@/components/TopNavbar';

export default function PostScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <TopNavbar />
 
      <ScrollView className="flex-1 p-6">
        {/* Photo Upload Section */}
        <View className="mb-10">
          <Text className="text-[10px] font-bold text-on-surface-variant mb-4 uppercase tracking-[0.2em]">Hình ảnh sản phẩm</Text>
          <View className="flex-row">
            <TouchableOpacity className="w-28 h-28 bg-surface-container-high border border-outline rounded-2xl items-center justify-center mr-4">
              <Feather name="camera" size={24} color="#FF7524" />
              <Text className="text-[9px] text-on-surface-variant font-black mt-2 uppercase tracking-widest">Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-28 h-28 bg-surface-container-high border border-outline rounded-2xl items-center justify-center">
              <Feather name="image" size={24} color="#FF7524" />
              <Text className="text-[9px] text-on-surface-variant font-black mt-2 uppercase tracking-widest">Thư viện</Text>
            </TouchableOpacity>
          </View>
        </View>
 
        {/* Form Fields */}
        <View className="space-y-8">
          <View className="mb-6">
            <Text className="text-[10px] font-bold text-on-surface-variant mb-3 uppercase tracking-[0.2em]">Tiêu đề niêm yết</Text>
            <TextInput 
              placeholder="Ví dụ: MacBook Pro M3 Max 64GB..." 
              className="bg-surface-container-high p-5 rounded-xl font-bold text-primary"
              placeholderTextColor="#666"
            />
          </View>
 
          <View className="mb-6">
             <Text className="text-[10px] font-bold text-on-surface-variant mb-3 uppercase tracking-[0.2em]">Giá trị dự kiến</Text>
             <View className="flex-row items-center bg-surface-container-high rounded-xl px-5">
               <TextInput 
                 placeholder="0" 
                 keyboardType="numeric"
                 className="flex-1 py-5 font-black text-primary text-xl"
                 placeholderTextColor="#666"
               />
               <Text className="text-secondary font-black tracking-widest">VNĐ</Text>
             </View>
          </View>
 
          <TouchableOpacity className="flex-row items-center bg-surface-container px-5 py-5 rounded-xl mb-3 justify-between">
            <View className="flex-row items-center">
              <Feather name="tag" size={18} color="#FF7524" />
              <Text className="text-primary font-bold ml-3 uppercase text-xs tracking-wider">Danh mục sản phẩm</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#444" />
          </TouchableOpacity>
 
          <TouchableOpacity className="flex-row items-center bg-surface-container px-5 py-5 rounded-xl mb-3 justify-between">
            <View className="flex-row items-center">
              <Feather name="map-pin" size={18} color="#FF7524" />
              <Text className="text-primary font-bold ml-3 uppercase text-xs tracking-wider">Vị trí giao dịch</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#444" />
          </TouchableOpacity>
 
          <View className="mb-12 mt-4">
            <Text className="text-[10px] font-bold text-on-surface-variant mb-3 uppercase tracking-[0.2em]">Chi tiết tình trạng</Text>
            <TextInput 
              placeholder="Mô tả các dấu hiệu đã qua sử dụng, phụ kiện kèm theo..." 
              multiline
              numberOfLines={4}
              className="bg-surface-container-high p-5 rounded-xl font-bold text-primary min-h-[140px]"
              style={{ textAlignVertical: 'top' }}
              placeholderTextColor="#666"
            />
          </View>
        </View>
 
        <TouchableOpacity className="bg-secondary p-6 rounded-xl items-center mb-24">
          <Text className="text-[#3C1300] font-black text-lg uppercase tracking-[0.1em]">Niêm yết ngay</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
