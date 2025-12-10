import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { coinGeckoService } from '../api/coinGecko';
import type { CoinState } from '../types';

export const useCoinStore = create<CoinState>()(
    immer((set, get) => ({
        coins: [],
        marketData: [],
        selectedCoin: null,
        isLoading: false,
        error: null,
        lastUpdated: 0,

        fetchCoins: async () => {
            // Simple cache: don't fetch if we have coins and it's been less than 1 hour
            const { coins, lastUpdated } = get();
            const oneHour = 60 * 60 * 1000;
            if (coins.length > 0 && Date.now() - lastUpdated < oneHour) return;

            set({ isLoading: true, error: null });
            try {
                const data = await coinGeckoService.getAllCoins();
                set({ coins: data, isLoading: false, lastUpdated: Date.now() });
            } catch (error: any) {
                set({ error: 'Failed to fetch coin list', isLoading: false });
            }
        },

        fetchMarketData: async (currency = 'usd') => {
            set({ isLoading: true, error: null });
            try {
                const data = await coinGeckoService.getMarketData(currency);
                set({ marketData: data, isLoading: false });
            } catch (error: any) {
                set({ error: 'Failed to fetch market data', isLoading: false });
            }
        },

        selectCoin: async (id: string) => {
            set({ isLoading: true, error: null, selectedCoin: null });
            try {
                const data = await coinGeckoService.getCoinDetails(id);
                set({ selectedCoin: data, isLoading: false });
            } catch (error: any) {
                set({ error: 'Failed to fetch coin details', isLoading: false });
            }
        },

        clearSelectedCoin: () => {
            set({ selectedCoin: null });
        }
    }))
);
