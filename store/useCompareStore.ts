import { create } from "zustand";

const MAX_COMPARE = 3;

export interface CompareItem {
  slug: string;
  model_name: string;
  manufacturer: string;
}

interface CompareState {
  items: CompareItem[];
  add: (item: CompareItem) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
}

export const MAX_COMPARE_COUNT = MAX_COMPARE;

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],

  add(item) {
    const { items } = get();
    if (items.some((i) => i.slug === item.slug)) return true;
    if (items.length >= MAX_COMPARE) return false;
    set({ items: [...items, item] });
    return true;
  },

  remove(slug) {
    set({ items: get().items.filter((i) => i.slug !== slug) });
  },

  clear() {
    set({ items: [] });
  },

  has(slug) {
    return get().items.some((i) => i.slug === slug);
  },
}));

// Selector for count (for reactive UI)
export const useCompareCount = () => useCompareStore((s) => s.items.length);
export const useCompareItems = () => useCompareStore((s) => s.items);
export const useCompareSlugs = () => useCompareStore((s) => s.items.map((i) => i.slug));
