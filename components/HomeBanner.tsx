import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const HomeBanner = () => {
  return (
    <View className="px-5 mt-4 mb-2">
      <TouchableOpacity
        activeOpacity={0.9}
        className="w-full h-44 rounded-[40px] overflow-hidden bg-primary relative shadow-xl shadow-primary/30"
      >
        {/* Background Decorations */}
        <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <View className="absolute -left-10 -bottom-20 w-48 h-48 bg-secondary/20 rounded-full" />

        <View className="flex-1 p-8 justify-center">
          <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3 border border-white/30">
            <Text className="text-white text-[9px] font-black uppercase tracking-[0.2em]">Twee Marketplace</Text>
          </View>
          <Text className="text-white text-3xl font-black uppercase leading-[1.1] tracking-tighter">
            Săn Đồ Cũ{'\n'}Giá Siêu Hời
          </Text>
          <View className="bg-white self-start px-6 py-2.5 rounded-2xl mt-5 shadow-sm">
            <Text className="text-primary font-black text-[10px] uppercase tracking-widest">Khám phá ngay</Text>
          </View>
        </View>

        {/* Illustration Icon */}
        <View className="absolute right-8 bottom-6 opacity-20">
           <Feather name="shopping-bag" size={100} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeBanner;
