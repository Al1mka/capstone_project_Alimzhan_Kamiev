import { describe, it, expect, vi, beforeEach } from 'vitest';
import { portfolioService } from './portfolioService';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

vi.mock('./coinGecko', () => ({
    coinGeckoService: {
        getSimplePrices: vi.fn(),
    },
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random(),
    },
});

describe('PortfolioService', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        mockedAxios.get.mockRejectedValue(new Error('Network Error'));
        mockedAxios.post.mockRejectedValue(new Error('Network Error'));
        mockedAxios.delete.mockRejectedValue(new Error('Network Error'));
        mockedAxios.patch.mockRejectedValue(new Error('Network Error'));
    });

    it('adds an item to portfolio', async () => {
        const newItem = {
            coinId: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            amount: 1,
            purchasePrice: 40000,
            purchaseDate: '2024-01-01',
            image: 'btc.png',
        };

        await portfolioService.addToPortfolio(newItem);

        const items = await portfolioService.getPortfolio();
        expect(items).toHaveLength(1);
        expect(items[0].coinId).toBe('bitcoin');
    });

    it('removes an item from portfolio', async () => {
        const newItem = {
            coinId: 'ethereum',
            name: 'Ethereum',
            symbol: 'eth',
            amount: 10,
            purchasePrice: 2000,
            purchaseDate: '2024-01-01',
            image: 'eth.png',
        };

        await portfolioService.addToPortfolio(newItem);
        let items = await portfolioService.getPortfolio();
        const id = items[0].id;

        await portfolioService.deleteFromPortfolio(id);
        items = await portfolioService.getPortfolio();
        expect(items).toHaveLength(0);
    });
});
