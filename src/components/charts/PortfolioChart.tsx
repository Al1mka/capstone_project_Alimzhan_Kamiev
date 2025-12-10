import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const generateMockData = () => {
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Simulating organic-looking growth
        const baseValue = 10000;
        const volatility = Math.random() * 2000 - 1000;
        const trend = (30 - i) * 100; // General upward trend

        data.push({
            date: date.toISOString(),
            value: Math.max(0, baseValue + trend + volatility),
            invested: baseValue + (30 - i) * 50, // Steady investment increase
        });
    }
    return data;
};

const PortfolioChart: React.FC = () => {
    const data = generateMockData();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
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

    if (!isMounted) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Portfolio Growth</h3>
                <div className="h-[350px] w-full bg-gray-50 animate-pulse rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Portfolio Growth</h3>
            <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
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
                        />
                        <Tooltip
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="value"
                            name="Total Value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                        <Area
                            type="monotone"
                            dataKey="invested"
                            name="Invested Amount"
                            stroke="#6b7280"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorInvested)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PortfolioChart;
