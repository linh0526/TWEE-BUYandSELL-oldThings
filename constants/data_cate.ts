export interface CategoryDetails {
  name: string;
  parent: string | null;
  level: number;
  image_url?: string;
  path: string;
}

// Deprecated: Use useCategoryStore instead
export const FLAT_CATEGORIES = {};