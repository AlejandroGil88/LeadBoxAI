'use client';

import { create } from 'zustand';
import type { FiltersSchema } from '../validation/filters';

type SidebarFiltersState = {
  filters: FiltersSchema;
  setFilters: (filters: FiltersSchema) => void;
};

export const useSidebarFilters = create<SidebarFiltersState>((set) => ({
  filters: {
    channels: [],
    languages: [],
    slaBreachOnly: false
  },
  setFilters: (filters) => set({ filters })
}));
