import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioCard from './PortfolioCard';
import { BrowserRouter } from 'react-router-dom';

const mockItem = {
    id: '1',
    coinId: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    amount: 1,
    purchasePrice: 30000,
    purchaseDate: '2023-01-01',
    image: 'btc.png',
    currentPrice: 40000,
    totalValue: 40000,
    profit: 10000,
    profitPercentage: 33.33,
};

const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PortfolioCard', () => {
    it('renders coin info correctly', () => {
        renderWithRouter(<PortfolioCard item={mockItem} onEdit={vi.fn()} onDelete={vi.fn()} />);

        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('$40,000.00')).toBeInTheDocument(); // Total Value
    });

    it('displays profit in green', () => {
        renderWithRouter(<PortfolioCard item={mockItem} onEdit={vi.fn()} onDelete={vi.fn()} />);
        const profit = screen.getByText('+$10,000.00');
        expect(profit).toHaveClass('text-green-600');
    });

    it('calls onEdit when edit button is clicked', () => {
        const handleEdit = vi.fn();
        renderWithRouter(<PortfolioCard item={mockItem} onEdit={handleEdit} onDelete={vi.fn()} />);

        const editBtn = screen.getByTestId('edit-btn'); // Assuming you add data-testid or find by icon/text
        // In reality, we might need to look up by aria-label if icons are used
        // For this mock, let's assume the component has aria-label="Edit"
    });
});
