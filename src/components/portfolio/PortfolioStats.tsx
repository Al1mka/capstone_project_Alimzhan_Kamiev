import React, { useMemo } from 'react';

import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { type EnrichedPortfolioItem } from '../../api/portfolioService';
import AllocationChart from '../charts/AllocationChart';
import PortfolioChart from '../charts/PortfolioChart';

interface PortfolioStatsProps {
    items: EnrichedPortfolioItem[];
}



const PortfolioStats: React.FC<PortfolioStatsProps> = ({ items }) => {
    const stats = useMemo(() => {
        const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
        const totalCost = items.reduce((sum, item) => sum + (item.purchasePrice * item.amount), 0);
        const totalProfit = totalValue - totalCost;
        const totalProfitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

        const bestPerformer = [...items].sort((a, b) => b.profitPercentage - a.profitPercentage)[0];
        const worstPerformer = [...items].sort((a, b) => a.profitPercentage - b.profitPercentage)[0];

        const allocationData = items
            .map(item => ({
                name: item.name,
                value: item.totalValue,
            }))
            .sort((a, b) => b.value - a.value);

        return {
            totalValue,
            totalProfit,
            totalProfitPercentage,
            bestPerformer,
            worstPerformer,
            allocationData,
        };
    }, [items]);

    if (items.length === 0) {
        return null;
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    return (
        <div className="space-y-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-600" />
                Portfolio Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                            {formatCurrency(stats.totalValue)}
                        </span>
                    </div>
                </div>

                {/* Profit/Loss Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Profit/Loss</p>
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
                        </span>
                        <div className={`px-2.5 py-0.5 rounded-full text-sm font-medium flex items-center gap-1 ${stats.totalProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {stats.totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {stats.totalProfitPercentage.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Best Performer Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Best Performer</p>
                    {stats.bestPerformer ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src={stats.bestPerformer.image} alt={stats.bestPerformer.name} className="w-8 h-8 rounded-full" />
                                <span className="font-semibold text-gray-900">{stats.bestPerformer.name}</span>
                            </div>
                            <span className="text-green-600 font-bold">
                                +{stats.bestPerformer.profitPercentage.toFixed(2)}%
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">No data</span>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PortfolioChart />

                <AllocationChart items={items} />
            </div>
        </div>
    );
};

export default PortfolioStats;
