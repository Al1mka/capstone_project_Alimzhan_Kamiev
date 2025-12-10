import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { type Coin, type MarketData, type CoinDetail, type ChartData, type SimplePrice } from '../types';
export type { Coin, MarketData, CoinDetail, ChartData, SimplePrice };

// 2. Axios Instance Configuration
const BASE_URL = import.meta.env.PROD
    ? 'https://api.coingecko.com/api/v3'
    : '/api/cg';

const coinGeckoClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10s timeout
    headers: {
        'Accept': 'application/json',
    },
});

// 3. Interceptors

// Request Interceptor: Rate Limiting
// Request Interceptor: Rate Limiting & Queueing
let requestQueue = Promise.resolve();
const MIN_DELAY_BETWEEN_REQUESTS = 1500; // 1.5s delay to stay within ~40 req/min limit safe zone

coinGeckoClient.interceptors.request.use(async (config) => {
    // Chain requests to ensure we don't hit the API in parallel
    // and respect the minimum delay between calls.
    const previousQueue = requestQueue;

    // Create a new promise for this request
    const myTurn = async () => {
        // Wait for previous request to finish/start
        try {
            await previousQueue;
        } catch (e) {
            // If previous failed, we still proceed
        }
        // Force a delay
        await new Promise(resolve => setTimeout(resolve, MIN_DELAY_BETWEEN_REQUESTS));
    };

    // Update the queue tail
    requestQueue = myTurn();

    // Wait for our turn
    await requestQueue;

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Error Handling
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

coinGeckoClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        let errorMessage = 'An error occurred while fetching data from CoinGecko.';

        const config = error.config as any;

        // Retry logic for 429 (Too Many Requests)
        if (error.response?.status === 429 && config && !config.__isRetry) {
            config.__retryCount = config.__retryCount || 0;

            if (config.__retryCount < MAX_RETRIES) {
                config.__retryCount += 1;
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, config.__retryCount - 1); // 1s, 2s, 4s
                console.warn(`CoinGecko Rate Limit Hit. Retrying in ${delay}ms... (Attempt ${config.__retryCount}/${MAX_RETRIES})`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return coinGeckoClient(config);
            }
        }

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('CoinGecko API Error:', error.response.status, error.response.data);
            if (error.response.status === 429) {
                errorMessage = 'Rate limit exceeded. Please try again later.';
            } else if (error.response.status === 404) {
                errorMessage = 'Resource not found.';
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('CoinGecko API No Response:', error.request);
            errorMessage = 'No response received from CoinGecko API. Check your internet connection.';
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('CoinGecko API Request Error:', error.message);
            errorMessage = error.message;
        }

        // You might want to throw a custom error object here or just the message
        return Promise.reject(new Error(errorMessage));
    }
);

// 4. Service Functions

// Simple in-memory cache to prevent hitting rate limits
const cache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache

const getCachedData = <T>(key: string): T | null => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }
    return null;
};

const setCachedData = (key: string, data: any) => {
    cache[key] = { data, timestamp: Date.now() };
};

export const coinGeckoService = {
    // Get List of All Coins (ID, Name, Symbol) - Useful for search/dropdowns
    getAllCoins: async (signal?: AbortSignal): Promise<Coin[]> => {
        const cacheKey = 'all_coins';
        const cached = getCachedData<Coin[]>(cacheKey);
        if (cached) return cached;

        try {
            const response = await coinGeckoClient.get<Coin[]>('/coins/list', { signal });
            setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Error fetching all coins:', error);
            }
            throw error;
        }
    },

    // Get Market Data (Coins with price, vol, etc.) - Main Table Data
    // Get MarketData with Caching
    getMarketData: async (
        vs_currency: string = 'usd',
        page: number = 1,
        per_page: number = 20,
        order: string = 'market_cap_desc',
        sparkline: boolean = false,
        signal?: AbortSignal
    ): Promise<MarketData[]> => {
        const cacheKey = `market_${vs_currency}_${page}_${per_page}_${order}_${sparkline}`;
        const cached = getCachedData<MarketData[]>(cacheKey);
        if (cached) return cached;

        try {
            const response = await coinGeckoClient.get<MarketData[]>('/coins/markets', {
                params: {
                    vs_currency,
                    page,
                    per_page,
                    order,
                    sparkline,
                },
                signal,
            });
            setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Error fetching market data:', error);
            }
            throw error;
        }
    },

    // Get Specific Coin Details with Caching
    getCoinDetails: async (id: string, signal?: AbortSignal): Promise<CoinDetail> => {
        const cacheKey = `detail_${id}`;
        const cached = getCachedData<CoinDetail>(cacheKey);
        if (cached) return cached;

        try {
            const response = await coinGeckoClient.get<CoinDetail>(`/coins/${id}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: false,
                },
                signal,
            });
            setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error(`Error fetching details for coin ${id}:`, error);
            }
            throw error;
        }
    },

    // Get Historical Chart Data
    getPriceChart: async (id: string, days: number | 'max' = 7, vs_currency: string = 'usd', signal?: AbortSignal): Promise<ChartData> => {
        try {
            const response = await coinGeckoClient.get<ChartData>(`/coins/${id}/market_chart`, {
                params: {
                    vs_currency,
                    days,
                },
                signal,
            });
            return response.data;
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error(`Error fetching chart data for coin ${id}:`, error);
            }
            throw error;
        }
    },

    // Get Simple Prices for multiple coins
    getSimplePrices: async (ids: string[], vs_currencies: string[] = ['usd'], signal?: AbortSignal): Promise<SimplePrice> => {
        const cacheKey = `prices_${ids.sort().join('_')}_${vs_currencies.sort().join('_')}`;
        const cached = getCachedData<SimplePrice>(cacheKey);
        if (cached) return cached;

        try {
            const response = await coinGeckoClient.get<SimplePrice>('/simple/price', {
                params: {
                    ids: ids.join(','),
                    vs_currencies: vs_currencies.join(','),
                },
                signal,
            });
            setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Error fetching simple prices:', error);
            }
            throw error;
        }
    },
};
