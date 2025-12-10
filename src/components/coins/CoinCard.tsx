import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, PlusCircle, ArrowRight } from 'lucide-react';
import type { MarketData } from '../../types';
import { formatPrice, formatMarketCap, formatVolume } from '../../utils/coinUtils';

interface CoinCardProps {
    coin: MarketData;
    onAddToPortfolio?: (coin: MarketData) => void;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, onAddToPortfolio }) => {
    const isProfit = coin.price_change_percentage_24h >= 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 flex flex-col h-full group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1" title={coin.name}>{coin.name}</h3>
                        <span className="text-sm text-gray-500 uppercase">{coin.symbol}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(coin.current_price)}</p>
                    <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-50 text-sm mb-4">
                <div>
                    <p className="text-gray-500 mb-1">Market Cap</p>
                    <p className="font-medium text-gray-900">{formatMarketCap(coin.market_cap)}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 mb-1">Volume (24h)</p>
                    <p className="font-medium text-gray-900">{formatVolume(coin.total_volume)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2">
                <Link
                    to={`/coin/${coin.id}`}
                    className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                >
                    Details <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
                {onAddToPortfolio && (
                    <button
                        onClick={() => onAddToPortfolio(coin)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Add to Portfolio"
                    >
                        <PlusCircle className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CoinCard;
