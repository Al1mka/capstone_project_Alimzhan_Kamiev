import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddCoin from './AddCoin';

// Mock stores
vi.mock('../stores/coinStore', () => ({
    useCoinStore: () => ({
        coins: [
            { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
            { id: 'ethereum', symbol: 'eth', name: 'Ethereum' }
        ],
        selectedCoin: {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            market_data: { current_price: { usd: 40000 } }
        },
        isLoading: false,
        fetchCoins: vi.fn(),
        selectCoin: vi.fn(),
        clearSelectedCoin: vi.fn(),
    })
}));

vi.mock('../stores/portfolioStore', () => ({
    usePortfolioStore: () => ({
        addItem: vi.fn(),
    })
}));

const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AddCoin Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders step 1 initially', () => {
        renderWithRouter(<AddCoin />);
        expect(screen.getByText('Select Coin')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search coins...')).toBeInTheDocument();
    });

    it('validates step 2 form inputs', async () => {
        // Manually simulate being on step 2 by tricking the component or mocking state if possible.
        // Since step state is local, we simulate the user flow:
        // 1. Render
        // 2. Click a coin to select it (which moves to step 2)

        renderWithRouter(<AddCoin />);

        // Find and click Bitcoin (mocked data)
        const coinBtn = screen.getByText('Bitcoin');
        fireEvent.click(coinBtn);

        // Now on Step 2
        await waitFor(() => {
            expect(screen.getByText('Transaction Details')).toBeInTheDocument();
        });

        // Try submitting empty
        const submitBtn = screen.getByText('Add Transaction');
        fireEvent.click(submitBtn);

        // Check for validation errors (zod schema)
        await waitFor(() => {
            expect(screen.getByText(/Amount must be positive/i)).toBeInTheDocument();
        });
    });
});
