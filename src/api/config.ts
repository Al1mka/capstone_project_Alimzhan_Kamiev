import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

// 1. TypeScript Interfaces

export interface ApiConfig {
    baseUrl: string;
    timeout: number;
}

export interface CoinGeckoCoin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: null | {
        times: number;
        currency: string;
        percentage: number;
    };
    last_updated: string;
    sparkline_in_7d?: {
        price: number[];
    };
}

export interface PortfolioItem {
    id: string;
    coinId: string;
    name: string;
    symbol: string;
    image: string;
    amount: number;
    purchasePrice: number;
    purchaseDate: string;
}

export interface MarketData {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
}

// 2. API Configuration Constants

export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
export const MOCK_API_BASE_URL = 'http://localhost:3001';

export const COINGECKO_ENDPOINTS = {
    coinsList: '/coins/markets',
    coinDetails: (id: string) => `/coins/${id}`,
    marketChart: (id: string) => `/coins/${id}/market_chart`,
    trending: '/search/trending',
    global: '/global',
};

export const MOCK_ENDPOINTS = {
    portfolio: '/portfolio',
};

export const DEFAULT_TIMEOUT = 10000;

// 3. Helper Functions

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string; message?: string }>;
        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
        return axiosError.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

export const createHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
};

// Create Axios instances
export const coingeckoApi: AxiosInstance = axios.create({
    baseURL: COINGECKO_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: createHeaders(),
});

export const mockApi: AxiosInstance = axios.create({
    baseURL: MOCK_API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: createHeaders(),
});

// Add response interceptor for rate limiting handling if needed
coingeckoApi.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.config && error.response && error.response.status === 429) {
            // Simple retry logic could be added here, but for now just return error
        }
        return Promise.reject(error);
    }
);
