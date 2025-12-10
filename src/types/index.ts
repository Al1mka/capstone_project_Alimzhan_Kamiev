// ==========================================
// 1. API Response Types
// ==========================================

// CoinGecko API Types
export interface Coin {
    id: string;
    symbol: string;
    name: string;
}

export interface MarketData extends Coin {
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
}

export interface CoinDetail extends Coin {
    description: { en: string };
    links: {
        homepage: string[];
        blockchain_site: string[];
        official_forum_url: string[];
        chat_url: string[];
        announcement_url: string[];
        twitter_screen_name: string;
        facebook_username: string;
        bitcointalk_thread_identifier: null | number;
        telegram_channel_identifier: string;
        subreddit_url: string;
        repos_url: {
            github: string[];
            bitbucket: string[];
        };
    };
    image: {
        thumb: string;
        small: string;
        large: string;
    };
    market_data: {
        current_price: { [key: string]: number };
        market_cap: { [key: string]: number };
        total_volume: { [key: string]: number };
        high_24h: { [key: string]: number };
        low_24h: { [key: string]: number };
        price_change_24h: number;
        price_change_percentage_24h: number;
        circulating_supply: number;
        ath: { [key: string]: number };
        ath_change_percentage: { [key: string]: number };
    };
}

export interface ChartData {
    prices: [number, number][]; // [timestamp, price]
    market_caps: [number, number][];
    total_volumes: [number, number][];
}

export interface SimplePrice {
    [key: string]: {
        [currency: string]: number;
    };
}

// Portfolio API Types
export interface PortfolioItem {
    id: string;
    coinId: string;
    name: string;
    symbol: string;
    amount: number;
    purchasePrice: number;
    purchaseDate: string; // ISO string
    image: string;
    notes?: string;
    addedDate?: string;
}

export interface EnrichedPortfolioItem extends PortfolioItem {
    currentPrice: number;
    totalValue: number;
    priceChange24h?: number;
    profit: number;
    profitPercentage: number;
}

// ==========================================
// 2. Component & Form Types
// ==========================================

export interface AddCoinFormData {
    coinId?: string;
    amount: number;
    purchasePrice: number;
    purchaseDate: string;
}

export interface PriceChartProps {
    coinId: string;
    coinName: string;
}

// ==========================================
// 3. Store State Types
// ==========================================

// Portfolio Store
export interface PortfolioState {
    items: EnrichedPortfolioItem[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPortfolio: () => Promise<void>;
    addItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateItem: (id: string, item: Partial<PortfolioItem>) => Promise<void>;

    // Selectors/Computed
    getTotalValue: () => number;
    getTotalProfit: () => number;
}

// Coin Store
export interface CoinState {
    coins: Coin[];
    marketData: MarketData[];
    selectedCoin: CoinDetail | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number;

    // Actions
    fetchCoins: () => Promise<void>;
    fetchMarketData: (currency?: string) => Promise<void>;
    selectCoin: (id: string) => Promise<void>;
    clearSelectedCoin: () => void;
}

// UI Store
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

export interface UIState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: Notification[];

    // Actions
    toggleTheme: () => void;
    toggleSidebar: () => void;
    addNotification: (type: Notification['type'], message: string) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

// ==========================================
// 4. Utility Types
// ==========================================

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
    page: number;
    perPage: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}
