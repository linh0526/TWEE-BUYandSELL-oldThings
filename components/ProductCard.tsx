import React from 'react';
import { View, Text, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

interface ProductCardProps {
  title: string;
  price: string;
  image: string | ImageSourcePropType;
  images?: string[] | ImageSourcePropType[];
  quantity?: number;
  location?: string;
  onPress?: () => void;
  hideTitle?: boolean;
  hideLocation?: boolean;
}

const ProductCard = ({ 
  title, 
  price, 
  image, 
  images, 
  quantity, 
  location = 'TP. Hồ Chí Minh', 
  onPress, 
  hideTitle, 
  hideLocation 
}: ProductCardProps) => {
  const displayImage = images && images.length > 0 ? images[0] : image;
  const imageCount = images?.length || 0;

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className={`bg-surface-container rounded-2xl overflow-hidden ${hideTitle && hideLocation ? 'mb-2' : 'mb-4'}`}
    >
      <View className="relative">
        <View style={{ aspectRatio: 1 }} className="overflow-hidden rounded-xl">
             <Image 
                source={displayImage} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
            />
        </View>
        
        {/* Price Tag - Bottom Left */}
        <View className="absolute bottom-2 left-2 bg-secondary px-1.5 py-1 rounded-lg shadow-lg">
          <Text className="text-[#3C1300] text-[10px] font-black tracking-tighter uppercase">{price}</Text>
        </View>
      </View>
      
      {(!hideTitle || !hideLocation) && (
        <View className="p-3">
          {!hideTitle && (
            <Text className="text-primary font-black text-sm mb-1 leading-tight tracking-tight" numberOfLines={2}>
              {title}
            </Text>
          )}
          {!hideLocation && (
            <View className="flex-row items-center mt-2">
               <Feather name="map-pin" size={10} color="#FF7524" className="mr-1.5" />
               <Text className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest truncate flex-1" numberOfLines={1}>
                 {location}
               </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default ProductCard;
