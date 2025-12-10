import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { portfolioService } from '../api/portfolioService';
import type { PortfolioState, PortfolioItem } from '../types';

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        immer((set, get) => ({
            items: [],
            isLoading: false,
            error: null,

            fetchPortfolio: async () => {
                set({ isLoading: true, error: null });
                try {
                    const data = await portfolioService.syncPortfolioWithPrices();
                    set({ items: data, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message || 'Failed to fetch portfolio', isLoading: false });
                }
            },

            addItem: async (newItem) => {
                set({ isLoading: true, error: null });
                try {
                    await portfolioService.addToPortfolio(newItem as any); // Type cast until service types sort out if needed
                    // Refresh entire portfolio to get new prices/enrichment
                    await get().fetchPortfolio();
                } catch (error: any) {
                    set({ error: 'Failed to add item', isLoading: false });
                    throw error;
                }
            },

            removeItem: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await portfolioService.deleteFromPortfolio(id);
                    set((state) => {
                        state.items = state.items.filter((i) => i.id !== id);
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    set({ error: 'Failed to remove item', isLoading: false });
                    throw error;
                }
            },

            updateItem: async (id, updatedItem) => {
                set({ isLoading: true, error: null });
                try {
                    await portfolioService.updatePortfolioItem(id, updatedItem);
                    await get().fetchPortfolio();
                } catch (error: any) {
                    set({ error: 'Failed to update item', isLoading: false });
                    throw error;
                }
            },

            getTotalValue: () => {
                const { items } = get();
                return items.reduce((sum, item) => sum + item.totalValue, 0);
            },

            getTotalProfit: () => {
                const { items } = get();
                return items.reduce((sum, item) => sum + item.profit, 0);
            }
        })),
        {
            name: 'portfolio-storage',
            partialize: (state) => ({ items: state.items }), // Only persist items, not loading/error
        }
    )
);
