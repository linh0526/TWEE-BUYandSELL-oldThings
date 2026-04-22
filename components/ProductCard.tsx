import React from 'react';
import { View, Text, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { getImageUrl } from '@/utils/image';

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
  shipping_fee_type?: string;
  is_trusted?: boolean;
  isFavorited?: boolean;
}

const ProductCard = ({ 
  title, 
  price, 
  image, 
  images, 
  quantity, 
  location = 'Toàn quốc', 
  shipping_fee_type,
  is_trusted,
  isFavorited,
  onPress,
  hideTitle, 
  hideLocation 
}: ProductCardProps) => {


  const displayImagePath = (Array.isArray(images) && images.length > 0) ? images[0] : image;
  const displayImageUri = getImageUrl(displayImagePath);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className={`bg-surface-container rounded-2xl overflow-hidden ${hideTitle && hideLocation ? 'mb-2' : 'mb-4'}`}
    >
      <View className="relative">
        <View style={{ aspectRatio: 1 }} className="overflow-hidden rounded-xl">
             <Image 
                source={{ uri: displayImageUri }}
                style={{ width: '100%', height: '100%', backgroundColor: '#F8F9FA' }}
                contentFit="cover"
                transition={200}
            />
            {!displayImageUri && (
              <View className="absolute inset-0 items-center justify-center bg-gray-50">
                <Feather name="image" size={24} color="#DDD" />
              </View>
            )}
        </View>
        
        {/* Tags - Top Left */}
        <View className="absolute top-1.5 left-1.5 flex-row flex-wrap gap-1">
          {shipping_fee_type === 'seller_pays' && (
            <View className="bg-[#E6F9F1] px-1.5 py-0.5 rounded-md border border-[#00B464]/20">
              <Text className="text-[#00B464] text-[8px] font-black uppercase tracking-tighter">Freeship</Text>
            </View>
          )}
          {is_trusted && (
            <View className="bg-[#E8F3FF] px-1.5 py-0.5 rounded-md border border-[#007AFF]/20">
              <Text className="text-[#007AFF] text-[8px] font-black uppercase tracking-tighter">Shop uy tín</Text>
            </View>
          )}
        </View>

        {/* Favorite Icon - Top Right */}
        {isFavorited && (
          <View className="absolute top-1.5 right-1.5 bg-white/80 p-1.5 rounded-full shadow-sm">
             <Feather name="heart" size={12} color="#FF3B30" fill="#FF3B30" />
          </View>
        )}

        {/* Price Tag - Bottom Left */}
        <View className="absolute bottom-2 left-2 bg-secondary px-1.5 py-1 rounded-lg shadow-lg">
          <Text className="text-[#3C1300] text-[10px] font-black tracking-tighter uppercase">{price}</Text>
        </View>
      </View>
      
      {(!hideTitle || !hideLocation) && (
        <View className="p-2.5">
          {!hideTitle && (
            <Text 
              className="text-primary font-black text-[11px] mb-1 leading-[14px] tracking-tight" 
              numberOfLines={2}
              style={{ minHeight: 28 }}
            >
              {title}
            </Text>
          )}
          {!hideLocation && (
            <View className="flex-row items-center mt-1">
               <Feather name="map-pin" size={10} color="#FF7524" className="mr-1" />
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
