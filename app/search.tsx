import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProductCard from '@/components/ProductCard';
import { FLAT_CATEGORIES } from '@/constants/data_cate';
const { height } = Dimensions.get('window');
import { getChildrenIds, getRootIds } from '@/utils/CategoryHelper';

export const MOCK_PRODUCTS = [
  // --- SÁCH (sach) ---
  { id: '1', title: 'Tiểu thuyết "Mắt Biếc" - Nguyễn Nhật Ánh', price: '95.000đ', image: 'https://cdn1.fahasa.com/media/catalog/product/8/9/8934974178637.jpg', quantity: 5, condition: 'Như mới', location: 'Hồ Chí Minh', category: 'Văn Học Việt Nam', categoryId: 'van-hoc-viet-nam' },
  { id: '2', title: 'Sách "Nhà Giả Kim" - Paulo Coelho', price: '85.000đ', image: 'https://cdn1.fahasa.com/media/flashmagazine/images/page_images/nha_gia_kim_tai_ban_2020/2024_03_20_18_29_19_1-390x510.jpg', condition: 'Mới', location: 'Hà Nội', category: 'Văn Học Nước Ngoài', categoryId: 'van-hoc-nuoc-ngoai' },
  { id: '3', title: 'Truyện tranh Conan - Tập 104', price: '25.000đ', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800', condition: 'Như mới', location: 'Đà Nẵng', category: 'Truyện Tranh', categoryId: 'truyen-tranh' },
  { id: '4', title: 'Combo 5 cuốn Nhật ký chú bé nhút nhát', price: '450.000đ', image: 'https://images.unsplash.com/photo-1533561304446-88a43deb6229?w=400', condition: 'Tốt', location: 'Cần Thơ', category: 'Sách Thiếu Nhi', categoryId: 'sach-thieu-nhi' },
  { id: '22', title: 'Giáo trình Giải tích 1 - ĐH Bách Khoa', price: '45.000đ', image: 'https://images.unsplash.com/photo-1543004629-ff56ecbd4002?w=400', condition: 'Kém', location: 'Hồ Chí Minh', category: 'Sách Giáo Khoa', categoryId: 'sach-giao-khoa' },

  // --- ĐIỆN TỬ (dien-tu) ---
  { id: '5', title: 'iPhone 15 Pro Max 256GB Gold', price: '27.500.000đ', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800', quantity: 2, condition: 'Như mới', location: 'Hồ Chí Minh', category: 'iPhone', categoryId: 'iphone' },
  { id: '6', title: 'Samsung Galaxy S24 Ultra Titanium', price: '23.500.000đ', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', condition: 'Như mới', location: 'Hà Nội', category: 'Android', categoryId: 'android' },
  { id: '7', title: 'MacBook Air M2 8GB/256GB Silver', price: '21.000.000đ', image: 'https://images.unsplash.com/photo-1517336714460-4c50dbf1ef5e?w=800', condition: 'Như mới', location: 'Đà Nẵng', category: 'Laptop', categoryId: 'laptop' },
  { id: '8', title: 'Sony Alpha A7 III kèm Lens Kit', price: '32.000.000đ', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', condition: 'Tốt', location: 'Hồ Chí Minh', category: 'Máy ảnh', categoryId: 'may-anh' },
  { id: '9', title: 'Loa Harman Kardon Aura Studio 3', price: '4.800.000đ', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', condition: 'Như mới', location: 'Bình Dương', category: 'Loa', categoryId: 'loa' },
  { id: '23', title: 'Tai nghe Sony WH-1000XM5', price: '6.200.000đ', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', condition: 'Mới', location: 'Toàn quốc', category: 'Tai nghe', categoryId: 'tai-nghe' },

  // --- THỜI TRANG NAM (do-nam) ---
  { id: '10', title: 'Áo thun Polo nam Uniqlo chính hãng', price: '250.000đ', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', condition: 'Mới', location: 'Hà Nội', category: 'Áo thun', categoryId: 'ao-thun-nam' },
  { id: '11', title: 'Quần Jean nam ống đứng xanh đậm', price: '500.000đ', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', condition: 'Tốt', location: 'Hồ Chí Minh', category: 'Quần Jean', categoryId: 'quan-jean-nam' },
  { id: '12', title: 'Đồng hồ nam Citizen Eco-Drive', price: '3.200.000đ', image: 'https://plus.unsplash.com/premium_photo-1661385963299-c08f8590a652?w=400', condition: 'Như mới', location: 'Toàn quốc', category: 'Đồng Hồ', categoryId: 'dong-ho-nam' },
  { id: '24', title: 'Giày Sneaker Biti’s Hunter Street', price: '650.000đ', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', condition: 'Mới', location: 'Hồ Chí Minh', category: 'Giày dép', categoryId: 'giay-nam' },

  // --- THỜI TRANG NỮ (thoi-trang-nu) ---
  { id: '13', title: 'Đầm hoa nhí đi biển phong cách Hàn Quốc', price: '350.000đ', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680fe0a?w=400', condition: 'Trung bình', location: 'Hồ Chí Minh', category: 'Đầm Dạo Phố', categoryId: 'dam-nu' },
  { id: '14', title: 'Túi xách tay nữ thời trang sang trọng', price: '1.200.000đ', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', condition: 'Tốt', location: 'Đà Nẵng', category: 'Túi xách', categoryId: 'tui-xach-nu' },
  { id: '25', title: 'Chân váy xếp ly dáng dài màu kem', price: '180.000đ', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', condition: 'Mới', location: 'Hà Nội', category: 'Chân váy', categoryId: 'chan-vay' },

  // --- LÀM ĐẸP (lam-dep) ---
  { id: '15', title: 'Son Shu Uemura Rouge Unlimited AM OR 570', price: '550.000đ', image: 'https://images.unsplash.com/photo-1570088727237-68500d217455?w=400', condition: 'Mới', location: 'Toàn quốc', category: 'Son', categoryId: 'son-moi' },
  { id: '16', title: 'Kem chống nắng La Roche-Posay Anthelios', price: '320.000đ', image: 'https://images.unsplash.com/photo-1672015521020-ab4f86d5cc00?w=400', condition: 'Mới', location: 'Hà Nội', category: 'Kem chống nắng', categoryId: 'cham-soc-da' },
  { id: '26', title: 'Nước hoa Chanel Bleu de Chanel EDP', price: '2.800.000đ', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', condition: 'Mới', location: 'TP. HCM', category: 'Nước hoa', categoryId: 'nuoc-hoa' },

  // --- XE CỘ (xe) ---
  { id: '17', title: 'Honda Vision 2022 bản đặc biệt Đen Nhám', price: '35.000.000đ', image: 'https://images.unsplash.com/photo-1597755269789-89407cf1a199?w=400', condition: 'Tốt', location: 'Hồ Chí Minh', category: 'Xe tay ga', categoryId: 'xe-may' },
  { id: '18', title: 'Xe đạp địa hình MTB Giant ATX 620', price: '6.500.000đ', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800', condition: 'Như mới', location: 'Hải Phòng', category: 'Xe đạp thể thao', categoryId: 'xe-dap' },
  { id: '27', title: 'Mazda 3 Luxury đời 2021 màu Đỏ', price: '580.000.000đ', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400', condition: 'Tốt', location: 'Hà Nội', category: 'Ô tô', categoryId: 'o-to' },

  // --- GIA DỤNG & VĂN PHÒNG (gia-dung) ---
  { id: '19', title: 'Máy hút bụi không dây Dyson V12', price: '12.500.000đ', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', condition: 'Như mới', location: 'Hồ Chí Minh', category: 'Dụng cụ vệ sinh', categoryId: 'thiet-bi-gia-dung' },
  { id: '20', title: 'Bàn phím cơ Keychron K2V2 Aluminum', price: '1.800.000đ', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', condition: 'Tốt', location: 'Hà Nội', category: 'Máy tính', categoryId: 'phu-kien-pc' },
  { id: '21', title: 'Ghế xoay văn phòng Hòa Phát GL309', price: '1.450.000đ', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400', condition: 'Tốt', location: 'Đà Nẵng', category: 'Ghế', categoryId: 'noi-that-van-phong' },
  { id: '28', title: 'Nồi chiên không dầu Philips XXL', price: '3.500.000đ', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400', condition: 'Mới', location: 'Hồ Chí Minh', category: 'Nhà bếp', categoryId: 'thiet-bi-nha-bep' },
  { id: '29', title: 'Máy pha cà phê Delonghi Dedica', price: '4.200.000đ', image: 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400', condition: 'Như mới', location: 'Hà Nội', category: 'Nhà bếp', categoryId: 'thiet-bi-nha-bep' },
  { id: '30', title: 'Đèn bàn học chống cận Taotronics', price: '450.000đ', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=400', condition: 'Mới', location: 'Toàn quốc', category: 'Đèn decor', categoryId: 'noi-that-van-phong' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { q, category, categoryId } = useLocalSearchParams<{ q?: string, category?: string, categoryId?: string }>();
  const initialCategory = categoryId || category;
  
  const [searchQuery, setSearchQuery] = React.useState(q || '');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(initialCategory || null);
  const [sortBy, setSortBy] = React.useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [filterCondition, setFilterCondition] = React.useState<string | null>(null);
  const [location, setLocation] = React.useState<string | null>(null);
  const [priceRange, setPriceRange] = React.useState<{min: string, max: string}>({min: '', max: ''});
  
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const [isSortVisible, setIsSortVisible] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Category Hierarchy State
  const [categoryPath, setCategoryPath] = React.useState<{id: string, name: string, type: 'root' | 'cat' | 'sub'}[]>([
    { id: 'all', name: 'Tất cả', type: 'root' }
  ]);

// Sửa useEffect đồng bộ category theo ID
React.useEffect(() => {
  if (initialCategory && (FLAT_CATEGORIES as any)[initialCategory]) {
    const item = (FLAT_CATEGORIES as any)[initialCategory];
    
    // Tìm tất cả các cha của item này để dựng lại Breadcrumb
    const pathIds = item.path.split('/'); 
    
    const newPath = [
      { id: 'all', name: 'Tất cả', type: 'root' },
      ...pathIds.map((id: string) => ({
        id: id,
        name: (FLAT_CATEGORIES as any)[id].name,
        type: (FLAT_CATEGORIES as any)[id].level === 0 ? 'cat' : 'sub'
      }))
    ];
    
    setCategoryPath(newPath as any);
    setSelectedCategory(null); 
  }
}, [initialCategory]);

  const currentLevel = categoryPath[categoryPath.length - 1];

  const getOptions = () => {
    const currentId = categoryPath[categoryPath.length - 1].id;
    const targetIds = currentId === 'all' ? getRootIds() : getChildrenIds(currentId);

    return targetIds.map(id => {
      const item = (FLAT_CATEGORIES as any)[id];
      const childIds = getChildrenIds(id);
      return {
        id: id,
        name: item.name,
        type: item.level === 0 ? 'cat' : 'sub',
        hasChildren: childIds.length > 0
      };
    });
  };

  const options = getOptions();

  const handleCategorySelect = (opt: {id: string, name: string, type: any, hasChildren: boolean}) => {
    if (opt.hasChildren) {
      setSelectedCategory(null);
      setCategoryPath([...categoryPath, { id: opt.id, name: opt.name, type: opt.type }]);
    } else {
      setSelectedCategory(opt.name);
    }
  };

  const handleBreadcrumbPress = (index: number) => {
    const newPath = categoryPath.slice(0, index + 1);
    setCategoryPath(newPath);
    setSelectedCategory(null);
  };

  const filteredProducts = React.useMemo(() => {
    return MOCK_PRODUCTS
      .filter(p => {
        // 1. Tìm theo từ khóa
        const matchQuery = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Lấy danh mục hiện tại từ Breadcrumb
        const currentCategory = categoryPath[categoryPath.length - 1];
        let matchCategory = true;

        if (currentCategory.id !== 'all') {
          const item = (FLAT_CATEGORIES as any)[p.categoryId];
          const productPath = item ? item.path : '';
          matchCategory = productPath.includes(currentCategory.id);
        }
        
        const matchCondition = !filterCondition || p.condition === filterCondition;
        const matchLocation = !location || p.location === location;
        
        const priceVal = parseInt(p.price.replace(/[.\D]/g, ''));
        const minP = priceRange.min ? parseInt(priceRange.min) : 0;
        const maxP = priceRange.max ? parseInt(priceRange.max) : Infinity;
        const matchPrice = priceVal >= minP && priceVal <= maxP;

        return matchQuery && matchCategory && matchCondition && matchLocation && matchPrice;
      })
      .sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[.\D]/g, ''));
        const priceB = parseInt(b.price.replace(/[.\D]/g, ''));
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        return 0;
      });
  }, [searchQuery, categoryPath, filterCondition, location, priceRange, sortBy]);

  const resetFilters = () => {
    setFilterCondition(null);
    setLocation(null);
    setPriceRange({min: '', max: ''});
    setSelectedCategory(null);
    setCategoryPath([{ id: 'all', name: 'Tất cả', type: 'root' }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Search Header */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-black/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-4">
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-white rounded-full px-4 py-2 ml-2 border border-black/10">
           <Feather name="search" size={16} color="#1A1A1A" />
           <TextInput 
             className="ml-3 flex-1 text-primary text-sm font-bold py-1"
             placeholder="Tìm kiếm sản phẩm..."
             placeholderTextColor="#999"
             autoFocus={!q && !initialCategory}
             onFocus={() => setIsFocused(true)}
             onBlur={() => setIsFocused(false)}
             value={searchQuery}
             onChangeText={setSearchQuery}
             returnKeyType="search"
           />
           {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
               <Feather name="x" size={18} color="#1A1A1A" />
             </TouchableOpacity>
           )}
        </View>
      </View>

      {/* Filter & Sort Bar */}
      {!(isFocused && searchQuery.length === 0 && !selectedCategory && currentLevel.id === 'all') && (
        <View className="flex-row items-center border-b border-black/5 px-6 py-3 justify-between bg-white">
          <View className="flex-row flex-1">
            <TouchableOpacity 
              onPress={() => setIsSortVisible(true)}
              className="px-4 py-2.5 rounded-2xl bg-black/5 flex-row items-center mr-3"
            >
              <Text className="text-[10px] font-black uppercase text-primary mr-2">
                Sắp xếp: {sortBy === 'price_asc' ? 'Giá thấp-cao' : sortBy === 'price_desc' ? 'Giá cao-thấp' : 'Mới nhất'}
              </Text>
              <Feather name="chevron-down" size={14} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => setIsFilterVisible(true)}
            className={`p-2.5 rounded-2xl ${isFilterVisible ? 'bg-secondary' : 'bg-black/5'}`}
          >
            <Feather name="sliders" size={16} color={isFilterVisible ? "white" : "#1A1A1A"} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Dropdown Modal */}
      <Modal
        visible={isSortVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSortVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/20" 
          activeOpacity={1} 
          onPress={() => setIsSortVisible(false)}
        >
          <View className="absolute top-[170px] left-6 right-6">
            <View className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5">
              {[
                { label: 'Mới nhất', value: 'newest' },
                { label: 'Giá từ thấp đến cao', value: 'price_asc' },
                { label: 'Giá từ cao đến thấp', value: 'price_desc' }
                
              ].map((item) => (
                <TouchableOpacity 
                  key={item.value}
                  onPress={() => {
                    setSortBy(item.value as any);
                    setIsSortVisible(false);
                  }}
                  className={`px-6 py-5 border-b border-black/5 last:border-0 flex-row items-center justify-between ${sortBy === item.value ? 'bg-secondary/5' : ''}`}
                >
                  <Text className={`text-sm ${sortBy === item.value ? 'font-black text-secondary' : 'font-bold text-primary'}`}>
                    {item.label}
                  </Text>
                  {sortBy === item.value && <Feather name="check" size={16} color="#FF7524" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isFocused && searchQuery.length === 0 && !selectedCategory && currentLevel.id === 'all' ? (
          <View className="px-6 pt-4">
            <Text className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-8">Lịch sử tìm kiếm</Text>
            {['Laptop cũ', 'Ghế làm việc'].map((item) => (
              <TouchableOpacity 
                key={item} 
                className="flex-row items-center py-4 border-b border-black/5"
                onPress={() => setSearchQuery(item)}
              >
                <Feather name="clock" size={16} color="#999" className="mr-3" />
                <Text className="text-primary font-bold text-sm">{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="p-4">
            <View className="mb-6 px-2 flex-row items-center">
              <Text className="text-sm font-bold text-primary tracking-tighter">
                {searchQuery 
                  ? `Kết quả cho từ khoá "${searchQuery}"`
                  : (selectedCategory || currentLevel.id !== 'all') 
                    ? `Tất cả cho "${selectedCategory || currentLevel.name}"`
                    : 'Kết quả tìm kiếm'}
              </Text>
              <Text className="text-xs font-bold text-black/40 ml-2">
                 - {filteredProducts.length} sản phẩm
              </Text>
            </View>

            <View className="flex-row flex-wrap">
              {filteredProducts.map((item) => (
                <View key={item.id} style={{ width: '33.33%', padding: 4 }}>
                  <ProductCard
                    title={item.title}
                    price={item.price}
                    image={item.image}
                    images={(item as any).images}
                    quantity={(item as any).quantity}
                    location={item.location}
                    hideTitle={true}
                    hideLocation={true}
                  />
                </View>
              ))}
              {filteredProducts.length === 0 && (
                <View className="mt-20 items-center justify-center w-full">
                  <Feather name="search" size={64} color="#F0F0F0" />
                  <Text className="mt-4 text-primary opacity-40 font-bold uppercase text-xs tracking-widest text-center px-10">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px]" style={{ height: height * 0.85 }}>
            <View className="p-6 pb-0">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                  <Feather name="x" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="text-lg font-black uppercase tracking-widest text-primary">Bộ lọc nâng cao</Text>
                <View className="w-6" />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-32">
                {/* Category Section with Breadcrumbs */}
                <View className="mb-8">
                  <Text className="text-[10px] font-black uppercase text-primary/40 tracking-widest mb-4">Danh mục</Text>
                  
                  {/* Breadcrumbs */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                    {categoryPath.map((node, i) => (
                      <React.Fragment key={i}>
                        <TouchableOpacity onPress={() => handleBreadcrumbPress(i)}>
                          <Text className={`text-xs ${i === categoryPath.length - 1 ? 'font-black text-secondary' : 'font-bold text-primary/40'}`}>
                            {node.name}
                          </Text>
                        </TouchableOpacity>
                        {i < categoryPath.length - 1 && (
                          <Text className="text-primary/20 mx-2 text-xs">{">"}</Text>
                        )}
                      </React.Fragment>
                    ))}
                  </ScrollView>

                  {/* Hierarchy Chips */}
                  <View className="flex-row flex-wrap">
                    {options.map((opt) => (
                      <TouchableOpacity 
                        key={opt.id}
                        onPress={() => handleCategorySelect(opt)}
                        className={`mr-2 mb-2 px-5 py-3 rounded-2xl border ${selectedCategory === opt.name ? 'bg-secondary/10 border-secondary' : 'bg-white border-black/5'}`}
                      >
                        <View className="flex-row items-center">
                          <Text className={`text-xs font-bold ${selectedCategory === opt.name ? 'text-secondary' : 'text-primary'}`}>{opt.name}</Text>
                          {opt.hasChildren && <Feather name="chevron-right" size={12} color="#999" className="ml-1" />}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Range Section */}
                <View className="mb-8">
                  <Text className="text-[10px] font-black uppercase text-primary/40 tracking-widest mb-4">Khoảng giá (VNĐ)</Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 bg-black/5 rounded-2xl px-4 py-3 border border-black/5">
                      <TextInput 
                        placeholder="Tối thiểu"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={priceRange.min}
                        onChangeText={(text) => setPriceRange({...priceRange, min: text})}
                        className="text-primary font-bold"
                      />
                    </View>
                    <View className="w-4 h-[1px] bg-black/10 mx-3" />
                    <View className="flex-1 bg-black/5 rounded-2xl px-4 py-3 border border-black/5">
                      <TextInput 
                        placeholder="Tối đa"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={priceRange.max}
                        onChangeText={(text) => setPriceRange({...priceRange, max: text})}
                        className="text-primary font-bold"
                      />
                    </View>
                  </View>
                </View>

                {/* Location Section */}
                <View className="mb-8">
                  <Text className="text-[10px] font-black uppercase text-primary/40 tracking-widest mb-4">Khu vực</Text>
                  <View className="flex-row flex-wrap">
                    {['Toàn quốc', 'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'].map((loc) => (
                      <TouchableOpacity 
                        key={loc}
                        onPress={() => setLocation(location === (loc === 'Toàn quốc' ? null : loc) ? null : (loc === 'Toàn quốc' ? null : loc))}
                        className={`mr-2 mb-2 px-5 py-3 rounded-2xl border ${((loc === 'Toàn quốc' && !location) || location === loc) ? 'bg-secondary border-secondary' : 'bg-white border-black/5'}`}
                      >
                        <Text className={`text-xs font-bold ${((loc === 'Toàn quốc' && !location) || location === loc) ? 'text-white' : 'text-primary'}`}>{loc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Condition Section */}
                <View className="mb-8">
                  <Text className="text-[10px] font-black uppercase text-primary/40 tracking-widest mb-4">Tình trạng</Text>
                  <View className="space-y-3">
                    {[
                      { label: 'Mới', desc: 'Hàng mới, chưa mở hộp/ bao bì, chưa qua sử dụng' },
                      { label: 'Như mới', desc: 'Hàng mới, chưa mở hộp/ bao bì, chưa qua sử dụng' },
                      { label: 'Tốt', desc: 'đã qua sử dụng, tính năng đầy đủ, hoạt động tốt (có thể có vài vết xước nhỏ)' },
                      { label: 'Trung bình', desc: 'đã qua sở dụng, đầy đủ chức năng, nhiều sai sót hoặc lỗi nhẹ' },
                      { label: 'Kém', desc: 'đã qua sở dụng, nhiều lỗi, có thể bị hư hỏng (đề cập chi tiết nếu hư hỏng)' },
                    ].map((cond) => (
                      <TouchableOpacity 
                        key={cond.label}
                        onPress={() => setFilterCondition(filterCondition === cond.label ? null : cond.label)}
                        className={`p-4 rounded-3xl border ${filterCondition === cond.label ? 'bg-secondary/5 border-secondary' : 'bg-white border-black/5'}`}
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className={`text-sm font-black ${filterCondition === cond.label ? 'text-secondary' : 'text-primary'}`}>{cond.label}</Text>
                          {filterCondition === cond.label && (
                            <View className="bg-secondary rounded-full p-0.5">
                              <Feather name="check" size={12} color="white" />
                            </View>
                          )}
                        </View>
                        <Text className={`text-[10px] leading-4 ${filterCondition === cond.label ? 'text-secondary/70' : 'text-primary/40'} font-bold`}>
                          {cond.desc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>

            <View className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-white border-t border-black/5 flex-row">
              <TouchableOpacity 
                onPress={resetFilters}
                className="flex-1 bg-black/5 p-5 rounded-3xl flex-row items-center justify-center mr-3"
              >
                <Feather name="rotate-ccw" size={16} color="#1A1A1A" className="mr-2" />
                <Text className="text-primary font-black uppercase tracking-widest text-xs">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsFilterVisible(false)}
                className="flex-[2] bg-secondary p-5 rounded-3xl flex-row items-center justify-center shadow-lg shadow-secondary/40"
              >
                <Feather name="check" size={18} color="white" className="mr-2" />
                <Text className="text-white font-black uppercase tracking-widest text-xs">Áp dụng lọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
