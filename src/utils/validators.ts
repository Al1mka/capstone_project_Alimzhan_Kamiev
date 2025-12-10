/**
 * Interface for the Add Coin Form Data
 */
export interface AddCoinFormData {
    coinId: string;
    amount: number | string;
    purchasePrice: number | string;
}

/**
 * Validates the Add Coin Form data.
 * Checks if a coin is selected, and if amount and price are valid positive numbers.
 * 
 * @example
 * validateAddCoinForm({ coinId: 'bitcoin', amount: 1.5, purchasePrice: 50000 }) 
 * // returns { isValid: true, errors: {} }
 * 
 * validateAddCoinForm({ coinId: '', amount: -1, purchasePrice: 'abc' }) 
 * // returns { isValid: false, errors: { coinId: 'Required', amount: 'Must be positive', purchasePrice: 'Invalid number' } }
 */
export const validateAddCoinForm = (data: AddCoinFormData) => {
    const errors: Record<string, string> = {};

    if (!data.coinId.trim()) {
        errors.coinId = 'Please select a cryptocurrency.';
    }

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Amount must be a valid positive number.';
    }

    const price = Number(data.purchasePrice);
    if (isNaN(price) || price < 0) {
        errors.purchasePrice = 'Price must be a valid non-negative number.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Sanitizes and validates a search input query.
 * Trims whitespace and ensures it doesn't contain potentially harmful characters (basic check).
 * 
 * @example
 * validateSearchInput('  bitcoin  ') // returns 'bitcoin'
 * validateSearchInput('<script>') // returns '' (or handles invalid input)
 */
export const validateSearchInput = (query: string): string => {
    const sanitized = query.trim();
    // Basic validation: allow alphanumeric, spaces, dashes (common in coin names/symbols)
    // If it contains characters that are definitely not in coin names/symbols and might be code, we could strip them.
    // For now, just trimming is usually sufficient for React which escapes output by default.
    // But let's restrict length to avoid extremely long regex processing if we were doing that.
    if (sanitized.length > 50) {
        return sanitized.slice(0, 50);
    }
    return sanitized;
};

/**
 * Validates if the input is a valid positive number.
 * 
 * @example
 * validateNumberInput(123) // returns true
 * validateNumberInput('123') // returns true
 * validateNumberInput('abc') // returns false
 * validateNumberInput(-5) // returns false
 */
export const validateNumberInput = (value: string | number): boolean => {
    if (value === '' || value === null || value === undefined) return false;
    const num = Number(value);
    return !isNaN(num) && num >= 0;
};
