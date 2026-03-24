-- Tạo bảng danh mục chính (Categories)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INT DEFAULT 0
);

-- Tạo bảng danh mục con (Subcategories)
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INT DEFAULT 0,
  UNIQUE(category_id, name)
);

-- Kích hoạt RLS (Bảo mật mức hàng)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép đọc công khai (Read-only)
CREATE POLICY "Cho phép đọc công khai danh mục" ON categories FOR SELECT USING (true);
CREATE POLICY "Cho phép đọc công khai danh mục con" ON subcategories FOR SELECT USING (true);

-- Dữ liệu danh mục chính
INSERT INTO categories (name, display_order) VALUES
('Sách', 1),
('Đồ cho nam', 2),
('Thời trang nữ', 3),
('Đồ làm đẹp', 4),
('Xe', 5),
('Đồ văn phòng', 6),
('Thiết thiết bị điện tử', 7),
('Khác', 99);

-- Dữ liệu danh mục con (kèm mục "Khác" cho mỗi loại)
-- Sách
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Sách'), 'Sách Giáo Khoa'),
((SELECT id FROM categories WHERE name = 'Sách'), 'Truyện Tranh'),
((SELECT id FROM categories WHERE name = 'Sách'), 'Sách Kỹ Năng'),
((SELECT id FROM categories WHERE name = 'Sách'), 'Khác');

-- Đồ cho nam
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Đồ cho nam'), 'Áo & Quần Nam'),
((SELECT id FROM categories WHERE name = 'Đồ cho nam'), 'Phụ kiện Nam'),
((SELECT id FROM categories WHERE name = 'Đồ cho nam'), 'Giày dép Nam'),
((SELECT id FROM categories WHERE name = 'Đồ cho nam'), 'Khác');

-- Thời trang nữ
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Thời trang nữ'), 'Váy & Đầm'),
((SELECT id FROM categories WHERE name = 'Thời trang nữ'), 'Phụ kiện Nữ'),
((SELECT id FROM categories WHERE name = 'Thời trang nữ'), 'Túi xách'),
((SELECT id FROM categories WHERE name = 'Thời trang nữ'), 'Khác');

-- Đồ làm đẹp
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Đồ làm đẹp'), 'Chăm sóc da'),
((SELECT id FROM categories WHERE name = 'Đồ làm đẹp'), 'Trang điểm'),
((SELECT id FROM categories WHERE name = 'Đồ làm đẹp'), 'Dụng cụ làm đẹp'),
((SELECT id FROM categories WHERE name = 'Đồ làm đẹp'), 'Khác');

-- Xe
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Xe'), 'Xe máy'),
((SELECT id FROM categories WHERE name = 'Xe'), 'Xe đạp'),
((SELECT id FROM categories WHERE name = 'Xe'), 'Ô tô'),
((SELECT id FROM categories WHERE name = 'Xe'), 'Khác');

-- Đồ văn phòng
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Đồ văn phòng'), 'Dụng cụ học tập'),
((SELECT id FROM categories WHERE name = 'Đồ văn phòng'), 'Bàn ghế văn phòng'),
((SELECT id FROM categories WHERE name = 'Đồ văn phòng'), 'Khác');

-- Thiết bị điện tử
INSERT INTO subcategories (category_id, name) VALUES 
((SELECT id FROM categories WHERE name = 'Thiết thiết bị điện tử'), 'Điện thoại'),
((SELECT id FROM categories WHERE name = 'Thiết thiết bị điện tử'), 'Laptop'),
((SELECT id FROM categories WHERE name = 'Thiết thiết bị điện tử'), 'Linh kiện/Phụ kiện'),
((SELECT id FROM categories WHERE name = 'Thiết thiết bị điện tử'), 'Khác');
