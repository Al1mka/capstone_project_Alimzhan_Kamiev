import type { EnrichedPortfolioItem } from '../api/portfolioService';

/**
 * Debounces a function call by waiting for a specified delay.
 * 
 * @example
 * const debouncedSearch = debounce((query) => searchApi(query), 500);
 * debouncedSearch('bit'); // Waits 500ms before calling searchApi
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * Generates a unique ID using crypto.randomUUID().
 * 
 * @example
 * const id = generateId(); // e.g., "36b8f84d-df4e-4d49-b662-bcde71a8764f"
 */
export const generateId = (): string => {
    return crypto.randomUUID();
};

/**
 * Sorts portfolio items based on a specific field and direction.
 * 
 * @example
 * sortPortfolio(items, 'name', 'asc') // Sorts A-Z by name
 * sortPortfolio(items, 'totalValue', 'desc') // Sorts highest value first
 */
export const sortPortfolio = (
    items: EnrichedPortfolioItem[],
    sortBy: keyof EnrichedPortfolioItem,
    direction: 'asc' | 'desc'
): EnrichedPortfolioItem[] => {
    return [...items].sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        if (valueA === undefined || valueB === undefined) return 0;

        if (valueA < valueB) {
            return direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
};

/**
 * Filters portfolio items by name or symbol based on a search query.
 * Case-insensitive.
 * 
 * @example
 * filterPortfolio(items, 'bit') // Returns items with 'BTC' or 'Bitcoin' in name/symbol
 */
export const filterPortfolio = (
    items: EnrichedPortfolioItem[],
    query: string
): EnrichedPortfolioItem[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return items;

    return items.filter((item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.symbol.toLowerCase().includes(lowerQuery)
    );
};
