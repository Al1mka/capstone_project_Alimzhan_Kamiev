import type { MarketData } from '../types';

export const filterCoins = (
    coins: MarketData[],
    searchQuery: string,
    filter: 'all' | 'gainers' | 'losers'
): MarketData[] => {
    let filtered = coins;

    // 1. Search Filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (coin) =>
                coin.name.toLowerCase().includes(query) ||
                coin.symbol.toLowerCase().includes(query)
        );
    }

    // 2. Price Change Filter
    if (filter === 'gainers') {
        filtered = filtered.filter((coin) => coin.price_change_percentage_24h > 0);
    } else if (filter === 'losers') {
        filtered = filtered.filter((coin) => coin.price_change_percentage_24h < 0);
    }

    return filtered;
};

export const sortCoins = (
    coins: MarketData[],
    sortBy: string
): MarketData[] => {
    return [...coins].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc':
                return a.current_price - b.current_price;
            case 'price_desc':
                return b.current_price - a.current_price;
            case 'market_cap_asc':
                return a.market_cap - b.market_cap;
            case 'market_cap_desc':
                return b.market_cap - a.market_cap;
            case 'volume_desc':
                return b.total_volume - a.total_volume;
            case 'change_desc':
                return b.price_change_percentage_24h - a.price_change_percentage_24h;
            case 'change_asc':
                return a.price_change_percentage_24h - b.price_change_percentage_24h;
            case 'name_asc':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
};

export const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
        return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
        return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
        return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
};

export const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
        return `$${(volume / 1e9).toFixed(2)}B`;
    }
    if (volume >= 1e6) {
        return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
};

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
};
