import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateProfit, calculateProfitPercentage } from './calculations';

describe('Calculation Utils', () => {
    describe('formatCurrency', () => {
        it('formats USD correctly', () => {
            expect(formatCurrency(1234.56)).toBe('$1,234.56');
        });

        it('handles zero', () => {
            expect(formatCurrency(0)).toBe('$0.00');
        });
    });

    describe('calculateProfit', () => {
        it('calculates profit correctly', () => {
            const profit = calculateProfit(150, 100, 2); // (150 - 100) * 2 = 100
            expect(profit).toBe(100);
        });

        it('calculates loss correctly', () => {
            const loss = calculateProfit(80, 100, 2); // (80 - 100) * 2 = -40
            expect(loss).toBe(-40);
        });
    });

    describe('calculateProfitPercentage', () => {
        it('calculates positive percentage', () => {
            const pct = calculateProfitPercentage(150, 100); // 50%
            expect(pct).toBe(50);
        });

        it('calculates negative percentage', () => {
            const pct = calculateProfitPercentage(50, 100); // -50%
            expect(pct).toBe(-50);
        });

        it('handles zero division safely', () => {
            expect(calculateProfitPercentage(100, 0)).toBe(0);
        });
    });
});
