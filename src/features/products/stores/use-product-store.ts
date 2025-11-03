import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProductCategory } from '@/lib/constants/category';
import { ProductFilters, ProductStore } from '../types/product.type';

const initialFilters: ProductFilters = {
  category: ProductCategory.TAMPON,
};

export const useProductStore = create<ProductStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,

      setCategory: (category) =>
        set(
          (state) => ({
            filters: { ...state.filters, category },
          }),
          false,
          'setCategory',
        ),

      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
    }),
    {
      name: 'product-store',
    },
  ),
);
