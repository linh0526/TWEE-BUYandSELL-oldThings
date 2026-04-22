-- Cấu trúc danh mục và sản phẩm cho Twee Marketplace

-- 1. Bảng danh mục chính (Categories)
CREATE TABLE IF NOT EXISTS categories (
  id character varying NOT NULL,
  name character varying NOT NULL,
  image_url text,
  display_order integer DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 2. Bảng danh mục con (Subcategories)
CREATE TABLE IF NOT EXISTS subcategories (
  id character varying NOT NULL,
  category_id character varying REFERENCES categories(id) ON DELETE CASCADE,
  name character varying NOT NULL,
  image_url text,
  display_order integer DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT subcategories_pkey PRIMARY KEY (id)
);

-- 3. Bảng mục chi tiết (Sub_items)
CREATE TABLE IF NOT EXISTS sub_items (
  id character varying NOT NULL,
  subcategory_id character varying REFERENCES subcategories(id) ON DELETE CASCADE,
  name character varying NOT NULL,
  image_url text,
  display_order integer DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT sub_items_pkey PRIMARY KEY (id)
);

-- 3. Bảng Profiles (Dựa trên Auth.Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  shop_description TEXT,
  location TEXT,
  phone_number TEXT,
  address TEXT, -- Thêm cột địa chỉ cho xác minh
  phone_verified BOOLEAN DEFAULT FALSE,
  trust_score INT DEFAULT 30, -- Mặc định 30 điểm khi tham gia
  transaction_points INT DEFAULT 0, -- Tối đa 20 điểm từ mua/bán (mỗi lần +1)
  review_points INT DEFAULT 0, -- Tối đa 15 điểm từ đánh giá (mỗi lần +1)
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Sản phẩm (Products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id character varying REFERENCES categories(id),
  subcategory_id character varying REFERENCES subcategories(id),
  sub_item_id character varying REFERENCES sub_items(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  images TEXT[], -- Mảng các URL ảnh từ storage
  condition TEXT, -- 'Mới', 'Như mới', 'Tốt', 'Trung bình', 'Kém'
  quantity INTEGER DEFAULT 1,
  location TEXT,
  detailed_address TEXT,
  shipping_fee_type TEXT,
  weight DECIMAL, -- Cân nặng (gram)
  length DECIMAL, -- Dài (cm)
  width DECIMAL, -- Rộng (cm)
  height DECIMAL, -- Cao (cm)
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'sold'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng đơn hàng (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  total_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng thông báo (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT, -- 'order', 'system', 'approval'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Đánh giá (Reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bảng Giỏ hàng (Phần bổ sung của Hoàng Yến)
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_item_per_user UNIQUE(user_id, product_id)
);

-- Kích hoạt RLS (Bảo mật mức hàng)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- CÁC CHÍNH SÁCH RLS CƠ BẢN
-- Công khai: Danh mục, Danh mục con, Sản phẩm đã duyệt
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read sub_items" ON sub_items FOR SELECT USING (true);
CREATE POLICY "Public read approved products" ON products FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cá nhân: Profile của chính mình
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Sản phẩm: Seller có thể quản lý sản phẩm của mình
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid() = seller_id);

-- Đơn hàng: Phân quyền cho Buyer và Seller
CREATE POLICY "Users can view own buying orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can view own selling orders" ON orders FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Thông báo: Người dùng có thể xem thông báo của mình và gửi thông báo cho người khác
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Giỏ hàng: Cho phép người dùng quản lý giỏ hàng của chính họ
CREATE POLICY "Users can manage own cart" ON cart FOR ALL USING (auth.uid() = user_id);

-- TRIGGERS
-- Tự động tạo profile khi đăng ký mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, full_name, trust_score)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'full_name',
    30 -- Mặc định 30 điểm khi mới tham gia
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Logic cộng điểm tin cậy từ đơn hàng (Mua/Bán thành công)
CREATE OR REPLACE FUNCTION update_trust_score_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Tăng điểm người mua
    UPDATE profiles 
    SET transaction_points = LEAST(transaction_points + 1, 20),
        trust_score = 30 + LEAST(transaction_points + 1, 20) + review_points
    WHERE id = NEW.buyer_id;
    
    -- Tăng điểm người bán
    UPDATE profiles 
    SET transaction_points = LEAST(transaction_points + 1, 20),
        trust_score = 30 + LEAST(transaction_points + 1, 20) + review_points
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_completed
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_trust_score_on_order();

-- Logic cộng điểm tin cậy từ đánh giá (Viết đánh giá)
CREATE OR REPLACE FUNCTION update_trust_score_on_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET review_points = LEAST(review_points + 1, 15),
      trust_score = 30 + transaction_points + LEAST(review_points + 1, 15)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_trust_score_on_review();

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- DỮ LIỆU MẪU (Bổ sung image_url cho categories)
-- DỮ LIỆU MẪU