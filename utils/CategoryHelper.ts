import { useCategoryStore } from '../lib/store/useCategoryStore';

export const getRootIds = (): string[] => {
  return useCategoryStore.getState().getRootIds();
};

export const getChildrenIds = (parentId: string): string[] => {
  return useCategoryStore.getState().getChildrenIds(parentId);
};

export const getCategoryPath = (id: string): string => {
  const categories = useCategoryStore.getState().categories;
  const path: string[] = [];
  let currentId: string | null = id;
  
  while (currentId && categories[currentId]) {
    path.unshift(currentId);
    currentId = categories[currentId].parent;
  }
  return path.join('/');
};