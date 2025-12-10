import React from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import { type EnrichedPortfolioItem } from '../../api/portfolioService';


interface PortfolioCardProps {
    item: EnrichedPortfolioItem;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, onEdit, onDelete }) => {
    const isProfit = item.profit >= 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="text-sm text-gray-500 uppercase">{item.symbol}</span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Action buttons could go here if we want them always visible or on hover 
                         For mobile, they need to be always visible or in a menu 
                      */}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Holdings</p>
                    <p className="font-semibold text-gray-900">{item.amount}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.totalValue)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Avg. Buy Price</p>
                    <p className="text-sm text-gray-700">{formatCurrency(item.purchasePrice)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Current Price</p>
                    <p className="text-sm text-gray-700">{formatCurrency(item.currentPrice)}</p>
                </div>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                    {isProfit ? (
                        <TrendingUp className={`w-4 h-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                        <TrendingDown className={`w-4 h-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
                    )}
                    <span className={`font-semibold text-sm ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                        {Math.abs(item.profitPercentage).toFixed(2)}%
                    </span>
                </div>
                <span className={`font-semibold text-sm ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                    {isProfit ? '+' : ''}{formatCurrency(item.profit)}
                </span>
            </div>

            <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-gray-50">
                <button
                    onClick={() => onEdit(item.id)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    aria-label="Edit"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PortfolioCard;
