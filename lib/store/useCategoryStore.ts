import { create } from 'zustand';
import { supabase } from '../supabase';

export interface Category {
  id: string;
  name: string;
  parent: string | null;
  level: number;
  image_url: string | null;
  path: string;
}

interface CategoryStore {
  categories: Record<string, Category>;
  isLoaded: boolean;
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getRootIds: () => string[];
  getChildrenIds: (parentId: string) => string[];
  getRootCategories: () => Category[];
  getChildren: (parentId: string) => Category[];
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: {},
  isLoaded: false,
  isLoading: false,

  fetchCategories: async () => {
    if (get().isLoaded) return;
    
    set({ isLoading: true });
    try {
      const [
        { data: cats },
        { data: subs },
        { data: items }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('subcategories').select('*'),
        supabase.from('sub_items').select('*')
      ]);

      const flat: Record<string, Category> = {};

      cats?.forEach(cat => {
        flat[cat.id] = {
          id: cat.id,
          name: cat.name,
          parent: null,
          level: 0,
          image_url: cat.image_url,
          path: cat.id
        };
      });

      subs?.forEach(sub => {
        flat[sub.id] = {
          id: sub.id,
          name: sub.name,
          parent: sub.category_id,
          level: 1,
          image_url: sub.image_url,
          path: `${sub.category_id}/${sub.id}`
        };
      });

      items?.forEach(item => {
        const parentSub = flat[item.subcategory_id];
        const rootId = parentSub ? parentSub.parent : '';
        flat[item.id] = {
          id: item.id,
          name: item.name,
          parent: item.subcategory_id,
          level: 2,
          image_url: item.image_url,
          path: rootId ? `${rootId}/${item.subcategory_id}/${item.id}` : `${item.subcategory_id}/${item.id}`
        };
      });

      set({ categories: flat, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ isLoading: false });
    }
  },

  getCategoryById: (id) => get().categories[id],
  
  getRootIds: () => 
    Object.values(get().categories)
      .filter(c => c.level === 0)
      .map(c => c.id),

  getChildrenIds: (parentId) => 
    Object.values(get().categories)
      .filter(c => c.parent === parentId)
      .map(c => c.id),

  getRootCategories: () => 
    Object.values(get().categories).filter(c => c.level === 0),
    
  getChildren: (parentId) => 
    Object.values(get().categories).filter(c => c.parent === parentId)
}));
