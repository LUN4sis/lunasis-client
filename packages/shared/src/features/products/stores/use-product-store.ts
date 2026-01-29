import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ProductCategory, ProductFilters, ProductStore } from '../types/product.type';

/**
 * set initial filters
 */
const initialFilters: ProductFilters = {
  category: ProductCategory.TAMPON,
};

export const useProductStore = create<ProductStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,

      // set category
      setCategory: (category) =>
        set(
          (state) => ({
            filters: { ...state.filters, category },
          }),
          false,
          'setCategory',
        ),

      // reset filters
      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
    }),
    {
      name: 'product-store',
    },
  ),
);
