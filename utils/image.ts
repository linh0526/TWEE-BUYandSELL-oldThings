export const getImageUrl = (imageInput: any): string | undefined => {
  const defaultImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
  
  if (!imageInput) return defaultImage;
  
  let parsed = imageInput;
  if (typeof imageInput === 'string' && imageInput.startsWith('[')) {
    try { parsed = JSON.parse(imageInput); } catch (e) {}
  }

  // Nếu là mảng, lấy phần tử đầu tiên
  let imagePath = Array.isArray(parsed) ? parsed[0] : parsed;
  
  if (typeof imagePath !== 'string' || !imagePath) return defaultImage;
  
  if (imagePath.startsWith('http')) return imagePath;
  
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return defaultImage;

  const cleanPath = imagePath.startsWith('products/') ? imagePath : `products/${imagePath}`;
  return `${baseUrl}/storage/v1/object/public/${cleanPath}`;
};
