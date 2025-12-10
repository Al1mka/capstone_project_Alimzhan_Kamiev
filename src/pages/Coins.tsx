import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { coinGeckoService } from '../api/coinGecko';
import SearchFilter from '../components/coins/SearchFilter';
import CoinList from '../components/coins/CoinList';
import ErrorMessage from '../components/ui/ErrorMessage';
import type { MarketData } from '../types';
import { filterCoins, sortCoins } from '../utils/coinUtils';
import { TrendingUp, BarChart3, Globe } from 'lucide-react';

// Stats Card Component (Internal)
const MarketStatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const Coins: React.FC = () => {
    const navigate = useNavigate();

    // --- State ---
    const [coins, setCoins] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters & Sort
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
    const [sortBy, setSortBy] = useState('market_cap_desc');

    // Market Stats State (Simplified for now, derived from top coins or separate endpoint if needed)
    // For this requirements, we'll try to fetch global stats or just derive from the list
    const [globalStats, setGlobalStats] = useState({
        totalMarketCap: 0,
        totalVolume: 0,
        btcDominance: 0
    });

    // --- Data Fetching ---
    const fetchCoins = async (pageNum: number, isRefresh = false, signal?: AbortSignal) => {
        try {
            setLoading(true);
            const data = await coinGeckoService.getMarketData('usd', pageNum, 10, 'market_cap_desc', false, signal);

            if (data.length === 0) {
                setHasMore(false);
            } else {
                setCoins(prev => isRefresh ? data : [...prev, ...data]);
                // Simplified global stats derivation from the first page of top 50 coins
                if (pageNum === 1) {
                    const totalCap = data.reduce((acc, coin) => acc + coin.market_cap, 0);
                    const totalVol = data.reduce((acc, coin) => acc + coin.total_volume, 0);
                    // Approximate BTC dominance from the list if BTC is present
                    const btc = data.find(c => c.symbol === 'btc');
                    const btcDom = btc ? (btc.market_cap / totalCap) * 100 : 0;

                    setGlobalStats({
                        totalMarketCap: totalCap,
                        totalVolume: totalVol,
                        btcDominance: btcDom
                    });
                }
            }
            setError(null);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                console.log('Request canceled');
                return;
            }
            console.error('Error fetching coins:', err);
            setError('Failed to load cryptocurrency data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchCoins(1, true, controller.signal);
        return () => controller.abort();
    }, []);

    // Load More Handler
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCoins(nextPage);
    };

    // Derived State
    const processedCoins = useMemo(() => {
        let result = filterCoins(coins, searchQuery, filter);
        return sortCoins(result, sortBy);
    }, [coins, searchQuery, filter, sortBy]);

    // Handlers
    const handleAddToPortfolio = (coin: MarketData) => {
        // Navigate to add-coin page with pre-filled data using state
        navigate('/add-coin', { state: { coinId: coin.id } });
    };

    // Format Helpers
    const formatLargeMoney = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(num);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header & Stats */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cryptocurrency Prices</h1>
                    <p className="text-gray-500 mt-1">
                        Live prices, charts, and market data for top cryptocurrencies.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MarketStatCard
                        title="Top 50 Market Cap"
                        value={formatLargeMoney(globalStats.totalMarketCap)}
                        icon={Globe}
                        color="bg-indigo-500"
                    />
                    <MarketStatCard
                        title="24h Volume"
                        value={formatLargeMoney(globalStats.totalVolume)}
                        icon={BarChart3}
                        color="bg-blue-500"
                    />
                    <MarketStatCard
                        title="BTC Dominance (Est.)"
                        value={`${globalStats.btcDominance.toFixed(1)}%`}
                        icon={TrendingUp}
                        color="bg-orange-500"
                    />
                </div>
            </div>

            {/* Controls */}
            <SearchFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* Error State */}
            {error && <ErrorMessage message={error} />}

            {/* Coin Grid */}
            <CoinList
                coins={processedCoins}
                isLoading={loading}
                hasMore={hasMore && !searchQuery && filter === 'all'} // Disable infinite scroll when filtering client-side
                onLoadMore={handleLoadMore}
                onAddToPortfolio={handleAddToPortfolio}
            />
        </div>
    );
};

export default Coins;
