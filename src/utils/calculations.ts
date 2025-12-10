export const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

export const calculateProfit = (currentPrice: number, purchasePrice: number, amount: number): number => {
    return (currentPrice - purchasePrice) * amount;
};

export const calculateProfitPercentage = (currentPrice: number, purchasePrice: number): number => {
    if (purchasePrice === 0) return 0;
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
};
