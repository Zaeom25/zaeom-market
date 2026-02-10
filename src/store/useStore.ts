import { create } from 'zustand'

interface AppState {
    sidebarOpen: boolean;
    activeCategory: string | null;
    searchQuery: string;
    setSidebarOpen: (open: boolean) => void;
    setActiveCategory: (slug: string | null) => void;
    setSearchQuery: (query: string) => void;
    toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
    sidebarOpen: true,
    activeCategory: null,
    searchQuery: '',
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setActiveCategory: (slug) => set({ activeCategory: slug }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
