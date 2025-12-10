import axios from 'axios';
import { coinGeckoService } from './coinGecko';
import type { PortfolioItem, EnrichedPortfolioItem } from '../types';
export type { EnrichedPortfolioItem };

// 1. Constants & Types

const API_URL = 'http://localhost:3004/portfolio';
const STORAGE_KEY = 'crypto_portfolio';

// 2. Helper Functions (LocalStorage)

const getLocalStorage = (): PortfolioItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
};

const setLocalStorage = (items: PortfolioItem[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Error writing to localStorage:', error);
    }
};

// 3. Service Implementation

export const portfolioService = {
    // --- READ ---
    getPortfolio: async (): Promise<PortfolioItem[]> => {
        try {
            const response = await axios.get<PortfolioItem[]>(API_URL);
            // Ensure response is valid array
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid API response format');
            }
            // Sync localStorage with latest server data if successful
            setLocalStorage(response.data);
            return response.data;
        } catch (error) {
            console.warn('API unavailable/invalid, falling back to localStorage:', error);
            return getLocalStorage();
        }
    },

    getPortfolioItem: async (id: string): Promise<PortfolioItem | undefined> => {
        try {
            const response = await axios.get<PortfolioItem>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, falling back to localStorage:', error);
            const items = getLocalStorage();
            return items.find((item) => item.id === id);
        }
    },

    // --- CREATE ---
    addToPortfolio: async (item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> => {
        const newItem: PortfolioItem = {
            ...item,
            id: crypto.randomUUID(), // Ensure ID exists
        };

        try {
            const response = await axios.post<PortfolioItem>(API_URL, newItem);
            // Optimistic update / Sync local
            const items = getLocalStorage();
            setLocalStorage([...items, response.data]);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, saving to localStorage:', error);
            const items = getLocalStorage();
            items.push(newItem);
            setLocalStorage(items);
            return newItem;
        }
    },

    // --- UPDATE ---
    updatePortfolioItem: async (id: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem> => {
        try {
            const response = await axios.patch<PortfolioItem>(`${API_URL}/${id}`, updates);

            // Sync local
            const items = getLocalStorage();
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                items[index] = { ...items[index], ...response.data };
                setLocalStorage(items);
            }
            return response.data;
        } catch (error) {
            console.warn('API unavailable, updating in localStorage:', error);
            const items = getLocalStorage();
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                const updatedItem = { ...items[index], ...updates };
                items[index] = updatedItem;
                setLocalStorage(items);
                return updatedItem;
            }
            throw new Error('Item not found in localStorage');
        }
    },

    // --- DELETE ---
    deleteFromPortfolio: async (id: string): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/${id}`);

            // Sync local
            const items = getLocalStorage();
            const filtered = items.filter(i => i.id !== id);
            setLocalStorage(filtered);
        } catch (error) {
            console.warn('API unavailable, deleting from localStorage:', error);
            const items = getLocalStorage();
            const filtered = items.filter(i => i.id !== id);
            setLocalStorage(filtered);
        }
    },

    // --- SYNC / ENRICH ---
    // Calculates current value based on latest prices
    syncPortfolioWithPrices: async (): Promise<EnrichedPortfolioItem[]> => {
        // 1. Get Base Portfolio Items
        let items: PortfolioItem[] = [];
        try {
            // Try getting from API first to ensure we have latest data
            items = await portfolioService.getPortfolio();
        } catch {
            items = getLocalStorage();
        }

        if (items.length === 0) return [];

        // 2. Get unique Coin IDs
        const coinIds = Array.from(new Set(items.map(item => item.coinId)));

        try {
            // 3. Fetch Prices
            const prices = await coinGeckoService.getSimplePrices(coinIds, ['usd']);

            // 4. Enrich Items
            return items.map(item => {
                const currentPrice = prices[item.coinId]?.usd || 0;
                const totalValue = currentPrice * item.amount;
                const cost = item.purchasePrice * item.amount;
                const profit = totalValue - cost;
                const profitPercentage = cost > 0 ? (profit / cost) * 100 : 0;

                return {
                    ...item,
                    currentPrice,
                    totalValue,
                    profit,
                    profitPercentage,
                };
            });
        } catch (error) {
            console.error('Error fetching prices for portfolio sync:', error);
            // Return items without updated prices if fetch fails (or fallback to purchase price/0)
            return items.map(item => ({
                ...item,
                currentPrice: 0,
                totalValue: 0,
                profit: 0,
                profitPercentage: 0,
            }));
        }
    }
};
