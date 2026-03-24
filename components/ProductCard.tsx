import React from 'react';
import { View, Text, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

interface ProductCardProps {
  title: string;
  price: string;
  image: string | ImageSourcePropType;
  condition: string;
  location?: string;
  onPress?: () => void;
}

export default function ProductCard({ title, price, image, condition, location = 'TP. Hồ Chí Minh', onPress }: ProductCardProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-surface-container rounded-2xl overflow-hidden mb-4"
    >
      <View className="relative">
        <View style={{ aspectRatio: 1 }} className="overflow-hidden rounded-xl">
             <Image 
                source={image} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
            />
        </View>
        
        
        {/* Price Tag - Now at Bottom Left (Replacing Condition) */}
        <View className="absolute bottom-2 left-2 bg-secondary px-1 py-0.8 rounded-md shadow-lg">
          <Text className="text-[#3C1300] text-[10px] font-black tracking-tighter uppercase">{price}</Text>
        </View>
      </View>
      
      <View className="p-3">
        <Text className="text-on-surface-variant text-[8px] font-bold uppercase tracking-[0.1em] mb-1">Authenticated</Text>
        <Text className="text-primary font-black text-sm mb-1 leading-tight tracking-tight" numberOfLines={2}>
          {title}
        </Text>
        <View className="flex-row items-center mt-2">
           <Feather name="map-pin" size={10} color="#FF7524" className="mr-1.5" />
           <Text className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest truncate flex-1" numberOfLines={1}>
             {location}
           </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
