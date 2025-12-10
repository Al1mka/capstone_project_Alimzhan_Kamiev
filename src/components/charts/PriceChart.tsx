import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { coinGeckoService, type ChartData } from '../../api/coinGecko';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

interface PriceChartProps {
    coinId: string;
    coinName: string;
}

type Timeframe = '1D' | '7D' | '1M' | '3M' | '1Y';

const PriceChart: React.FC<PriceChartProps> = ({ coinId, coinName }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('7D');
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChart = async () => {
            setLoading(true);
            setError(null);
            try {
                let days: number | 'max' = 7;
                switch (timeframe) {
                    case '1D': days = 1; break;
                    case '7D': days = 7; break;
                    case '1M': days = 30; break;
                    case '3M': days = 90; break;
                    case '1Y': days = 365; break;
                }

                const data = await coinGeckoService.getPriceChart(coinId, days);
                setChartData(data);
            } catch (err) {
                console.error('Failed to fetch chart data:', err);
                setError('Failed to load chart data');
            } finally {
                setLoading(false);
            }
        };

        fetchChart();
    }, [coinId, timeframe]);

    if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="h-64 flex items-center justify-center"><ErrorMessage message={error} /></div>;
    if (!chartData) return null;

    const formattedData = chartData.prices.map(([timestamp, price]) => ({
        date: timestamp,
        price,
    }));

    const formatXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        if (timeframe === '1D') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatYAxis = (tickItem: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(tickItem);
    };

    const formatTooltip = (value: number) => {
        return [
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value),
            'Price'
        ];
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900">{coinName} Price History</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['1D', '7D', '1M', '3M', '1Y'] as Timeframe[]).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeframe === tf
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            minTickGap={30}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                            formatter={formatTooltip}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceChart;
