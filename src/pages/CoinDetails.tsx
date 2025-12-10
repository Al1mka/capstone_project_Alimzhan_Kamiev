import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Globe,
    ExternalLink,
    Github,
    MessageCircle,
    TrendingUp,
    TrendingDown,
    PlusCircle
} from 'lucide-react';
import { coinGeckoService } from '../api/coinGecko';
import type { CoinDetail } from '../types';
import PriceChart from '../components/charts/PriceChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const CoinDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [coin, setCoin] = useState<CoinDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoin = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await coinGeckoService.getCoinDetails(id);
                setCoin(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch coin details', err);
                setError('Failed to load coin details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoin();
    }, [id]);

    const formatCurrency = (val: number, minimumFractionDigits = 2) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits,
        }).format(val);
    };

    const formatNumber = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2,
        }).format(val);
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return (
        <div className="p-8">
            <ErrorMessage message={error} />
            <Link to="/dashboard" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; Back to Dashboard
            </Link>
        </div>
    );
    if (!coin) return null;

    // Helper to calculate price change color
    const getChangeColor = (val: number) => val >= 0 ? 'text-green-600' : 'text-red-600';
    const ChangeIcon = ({ val }: { val: number }) => val >= 0 ? <TrendingUp className="w-4 h-4 ml-1" /> : <TrendingDown className="w-4 h-4 ml-1" />;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
            {/* Nav */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
            </button>

            {/* Header / Main Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <img src={coin.image.large} alt={coin.name} className="w-16 h-16 rounded-full" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            {coin.name}
                            <span className="text-lg font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                {coin.symbol.toUpperCase()}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(coin.market_data.current_price.usd)}
                            </span>
                            <span className={`flex items-center font-medium ${getChangeColor(coin.market_data.price_change_percentage_24h)}`}>
                                {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                                <ChangeIcon val={coin.market_data.price_change_percentage_24h} />
                            </span>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/add-coin?coinId=${coin.id}`}
                    className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm font-semibold"
                >
                    <PlusCircle className="w-5 h-5" />
                    Add to Portfolio
                </Link>
            </div>

            {/* Chart Section */}
            <PriceChart coinId={coin.id} coinName={coin.name} />

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">Market Cap</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(coin.market_data.market_cap.usd, 0)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">Volume (24h)</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(coin.market_data.total_volume.usd, 0)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">Circulating Supply</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                        {formatNumber(coin.market_data.circulating_supply || 0)} <span className="text-sm text-gray-500 font-normal">{coin.symbol.toUpperCase()}</span>
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">All Time High</p>
                    <div className="flex justify-between items-end mt-1">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(coin.market_data.ath.usd)}</p>
                        <p className="text-xs text-red-500 font-medium">{coin.market_data.ath_change_percentage.usd.toFixed(2)}%</p>
                    </div>
                </div>
            </div>

            {/* Description & Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Description */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">About {coin.name}</h3>
                    <div
                        className="prose prose-sm max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: coin.description.en || 'No description available.' }}
                    />
                </div>

                {/* Links */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Official Links</h3>
                    <div className="space-y-3">
                        {coin.links.homepage[0] && (
                            <a href={coin.links.homepage[0]} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                                    Website
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                        )}
                        {coin.links.repos_url.github[0] && (
                            <a href={coin.links.repos_url.github[0]} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Github className="w-4 h-4 text-gray-400 group-hover:text-black" />
                                    Github
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                        )}
                        {coin.links.subreddit_url && (
                            <a href={coin.links.subreddit_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                                    Reddit
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoinDetails;
