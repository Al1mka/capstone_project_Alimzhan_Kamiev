import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    CreditCard,
    PieChart,
    ArrowRight,
    RefreshCw,
    Wallet
} from 'lucide-react';
import { portfolioService, type EnrichedPortfolioItem } from '../api/portfolioService';
import { coinGeckoService, type MarketData } from '../api/coinGecko';
import PortfolioChart from '../components/charts/PortfolioChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const Dashboard: React.FC = () => {
    const [portfolioItems, setPortfolioItems] = useState<EnrichedPortfolioItem[]>([]);
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (signal?: AbortSignal) => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Portfolio Data
            const items = await portfolioService.syncPortfolioWithPrices();
            // In a real app, we might want to refresh prices here explicitly if they are stale
            // For now, we rely on the service's internal caching or simple get
            setPortfolioItems(items);

            // 2. Fetch Top 10 Market Data
            const market = await coinGeckoService.getMarketData('usd', 1, 10, 'market_cap_desc', false, signal);
            setMarketData(market);

            setLastUpdated(new Date());
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                console.log('Dashboard fetch canceled');
                return;
            }
            console.error('Dashboard data fetch error:', err);
            setError('Failed to load dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => controller.abort();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Calculate Portfolio Summaries
    const totalValue = portfolioItems.reduce((acc, item) => acc + item.totalValue, 0);
    const totalCost = portfolioItems.reduce((acc, item) => acc + (item.purchasePrice * item.amount), 0);
    const totalProfit = totalValue - totalCost;
    const totalProfitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const assetCount = portfolioItems.length;

    // Recent Activity Mock Data
    const recentActivity = [
        { id: 1, type: 'Buy', coin: 'Bitcoin', amount: 0.05, date: '2023-10-25', status: 'Completed' },
        { id: 2, type: 'Buy', coin: 'Ethereum', amount: 1.2, date: '2023-10-22', status: 'Completed' },
        { id: 3, type: 'Sell', coin: 'Solana', amount: 15, date: '2023-10-15', status: 'Completed' },
    ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    if (loading && !refreshing) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <ErrorMessage message={error} />
                <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Overview of your crypto portfolio and market trends.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden sm:inline">
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all ${refreshing ? 'animate-spin' : ''}`}
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <Link
                        to="/add-coin"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm font-medium text-sm"
                    >
                        <DollarSign className="w-4 h-4" />
                        Add Asset
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Balance */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Balance</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Total P&L */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Profit/Loss</p>
                            <h3 className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                            </h3>
                        </div>
                        <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                    </div>
                    <span className={`text-sm font-medium ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalProfitPercentage.toFixed(2)}%
                    </span>
                </div>

                {/* Total Invested */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Invested</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCost)}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Number of Coins */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Assets</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{assetCount}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <Link to="/portfolio" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Chart (2/3 width on desktop) */}
                <div className="lg:col-span-2">
                    <PortfolioChart />
                </div>

                {/* Right Column: Top Market (1/3 width on desktop) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Market Top 10</h3>
                        <span className="text-xs text-gray-500">By Market Cap</span>
                    </div>
                    <div className="overflow-auto flex-1 h-[300px] lg:h-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                <tr>
                                    <th className="text-left py-2 px-4 font-medium">Coin</th>
                                    <th className="text-right py-2 px-4 font-medium">Price</th>
                                    <th className="text-right py-2 px-4 font-medium">24h</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {marketData.map((coin) => (
                                    <tr key={coin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                                                <span className="font-medium text-gray-900">{coin.symbol.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-900">
                                            {formatCurrency(coin.current_price)}
                                        </td>
                                        <td className={`py-3 px-4 text-right font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {coin.price_change_percentage_24h.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-100">
                                <th className="text-left py-3 px-2 font-medium">Type</th>
                                <th className="text-left py-3 px-2 font-medium">Asset</th>
                                <th className="text-right py-3 px-2 font-medium">Amount</th>
                                <th className="text-right py-3 px-2 font-medium">Date</th>
                                <th className="text-right py-3 px-2 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentActivity.map((activity) => (
                                <tr key={activity.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {activity.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 font-medium text-gray-900">{activity.coin}</td>
                                    <td className="py-3 px-2 text-right text-gray-600">{activity.amount}</td>
                                    <td className="py-3 px-2 text-right text-gray-500">{new Date(activity.date).toLocaleDateString()}</td>
                                    <td className="py-3 px-2 text-right">
                                        <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                                            {activity.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions Grid (Mobile Focused) */}
            <div className="grid grid-cols-2 gap-4 sm:hidden">
                <Link to="/portfolio" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 active:bg-gray-50">
                    <PieChart className="w-6 h-6 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">Portfolio</span>
                </Link>
                <Link to="/add-coin" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 active:bg-gray-50">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Add Asset</span>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
