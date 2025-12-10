/**
 * Formats a number as a currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Formats a number as a percentage string with sign (e.g., "+5.23%", "-1.20%")
 */
export const formatPercentage = (value: number): string => {
    const formatted = Math.abs(value).toFixed(2);
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatted}%`;
};

/**
 * Formats a date string or object into a human-readable string (e.g., "Oct 24, 2024")
 */
export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(d);
};

/**
 * Formats large numbers into compact strings (e.g., "1.2K", "5M", "1B")
 */
export const formatCompactNumber = (number: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(number);
};

/**
 * Truncates a coin name if it exceeds the maximum length
 */
export const formatCoinName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    return `${name.slice(0, maxLength)}...`;
};
