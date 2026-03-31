import { FLAT_CATEGORIES, CategoryDetails } from '../constants/data_cate';

export const getRootIds = (): string[] => {
  return Object.entries(FLAT_CATEGORIES)
    .filter(([_, details]) => (details as CategoryDetails).level === 0)
    .map(([id]) => id);
};

export const getChildrenIds = (parentId: string): string[] => {
  return Object.entries(FLAT_CATEGORIES)
    .filter(([_, details]) => (details as CategoryDetails).parent === parentId)
    .map(([id]) => id);
};

export const getCategoryPath = (id: string): string => {
  const path: string[] = [];
  let currentId: string | null = id;
  
  // Dùng "as any" hoặc "keyof typeof" để vượt qua kiểm tra index
  const DATA = FLAT_CATEGORIES as Record<string, CategoryDetails>;

  while (currentId && DATA[currentId]) {
    path.unshift(currentId);
    currentId = DATA[currentId].parent;
  }
  return path.join('/');
};