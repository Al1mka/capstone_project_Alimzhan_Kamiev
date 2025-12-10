import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { UIState } from '../types';

export const useUIStore = create<UIState>()(
    persist(
        immer((set) => ({
            theme: 'light',
            sidebarOpen: false,
            notifications: [],

            toggleTheme: () =>
                set((state) => {
                    state.theme = state.theme === 'light' ? 'dark' : 'light';
                }),

            toggleSidebar: () =>
                set((state) => {
                    state.sidebarOpen = !state.sidebarOpen;
                }),

            addNotification: (type, message) =>
                set((state) => {
                    state.notifications.push({
                        id: Math.random().toString(36).substring(7),
                        type,
                        message,
                    });
                }),

            removeNotification: (id) =>
                set((state) => {
                    state.notifications = state.notifications.filter((n) => n.id !== id);
                }),

            clearNotifications: () =>
                set((state) => {
                    state.notifications = [];
                }),
        })),
        {
            name: 'ui-storage',
            partialize: (state) => ({ theme: state.theme }), // Persist only theme
        }
    )
);
