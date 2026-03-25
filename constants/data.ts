const iconOther = 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=400'

export const STATIC_CATEGORIES = [
  {
    id: 'sach',
    name: 'Sách',
    image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    display_order: 1,
    subcategories: [
      { id: 'sach-giao-khoa', name: 'Sách Giáo Khoa', image_url: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400' },
      { id: 'truyen-tranh', name: 'Truyện Tranh', image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400' },
      { id: 'sach-ky-nang', name: 'Sách Kỹ Năng Sống', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'sach-van-hoc', name: 'Sách Văn Học', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'sach-kinh-te', name: 'Sách Kinh Tế', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'sach-thieu-nhi', name: 'Sách Thiếu Nhi', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'sach-ngoai-ngu', name: 'Sách Ngoại Ngữ', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'sach-kien-thuc', name: 'Sách Kiến Thức Tổng Hợp', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'sach-cong-nghe', name: 'Sách Công Nghệ', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'do-nam',
    name: 'Đồ cho nam',
    image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    display_order: 2,
    subcategories: [
      { id: 'ao-nam', name: 'Áo Nam', image_url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400' },
      { id: 'quan-nam', name: 'Quần Nam', image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400' },
      { id: 'giay-nam', name: 'Giày Nam', image_url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400' },
      { id: 'phu-kien-nam', name: 'Phụ kiện Nam', image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'thoi-trang-nu',
    name: 'Thời trang nữ',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    display_order: 3,
    subcategories: [
      { id: 'do-nu', name: 'Đồ Nữ', image_url: 'https://images.unsplash.com/photo-1564242254377-33e9d028000d?w=400' },
      { id: 'vay-dam', name: 'Váy & Đầm', image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400' },
      { id: 'tui-xach', name: 'Túi xách', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
      { id: 'trang-suc', name: 'Trang sức', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
      { id: 'giay-nu', name: 'Giày Nữ', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
      { id: 'phu-kien-nu', name: 'Phụ kiện Nữ', image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'lam-dep',
    name: 'Làm đẹp',
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    display_order: 4,
    subcategories: [
      { id: 'cham-soc-da', name: 'Chăm sóc da', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' },
      { id: 'trang-diem', name: 'Trang điểm', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'xe',
    name: 'Xe',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    display_order: 5,
    subcategories: [
      { id: 'xe-may', name: 'Xe máy', image_url: 'https://images.unsplash.com/photo-1457076098342-5ce69fc59d33?w=400' },
      { id: 'xe-dap', name: 'Xe đạp', image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400' },
      { id: 'oto', name: 'Ô tô', image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'dien-tu',
    name: 'Điện tử',
    image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    display_order: 6,
    subcategories: [
      { id: 'dien-thoai', name: 'Điện thoại', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
      { id: 'laptop', name: 'Laptop', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
      { id: 'phu-kien-dt', name: 'Phụ kiện', image_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'van-phong',
    name: 'Văn phòng',
    image_url: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800',
    display_order: 7,
    subcategories: [
      { id: 'vpp', name: 'Dụng cụ học tập', image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400' },
      { id: 'ban-ghe', name: 'Bàn ghế', image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'do-gia-dung',
    name: 'Đồ gia dụng',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    display_order: 8,
    subcategories: [
      { id: 'do-gia-dung', name: 'Đồ gia dụng', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'do-choi',
    name: 'Đồ chơi',
    image_url: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800',
    display_order: 9,
    subcategories: [
      { id: 'do-choi', name: 'Đồ chơi', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'thuc-pham',
    name: 'Thực phẩm',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    display_order: 10,
    subcategories: [
      { id: 'thuc-pham', name: 'Thức phẩm', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'thu-cung',
    name: 'Thú cưng',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    display_order: 11,
    subcategories: [
      { id: 'thuc-pham', name: 'Thức phẩm', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { id: 'khac', name: 'Khác', image_url: iconOther },
    ]
  },
  {
    id: 'khac',
    name: 'Khác',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    display_order: 15,
    subcategories: [
    ]
  },
];
