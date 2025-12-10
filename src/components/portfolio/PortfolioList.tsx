import React, { useEffect, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type EnrichedPortfolioItem, portfolioService } from '../../api/portfolioService';
import PortfolioCard from './PortfolioCard';
import PortfolioStats from './PortfolioStats';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

const PortfolioList: React.FC = () => {
    const [items, setItems] = useState<EnrichedPortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<'totalValue' | 'profit' | 'name'>('totalValue');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filter, setFilter] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await portfolioService.syncPortfolioWithPrices();
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load portfolio data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await portfolioService.deleteFromPortfolio(id);
                // Refresh data
                fetchData();
            } catch (err) {
                console.error('Failed to delete item:', err);
                alert('Failed to delete item');
            }
        }
    };

    const handleEdit = (id: string) => {
        // In a real app we might navigate to edit page or open modal
        // For now just console log or maybe alert
        console.log('Edit', id);
        // We could use useNavigate to go to /edit-coin/:id if we had that route
    };

    const sortedAndFilteredItems = React.useMemo(() => {
        let result = [...items];

        if (filter) {
            const lowerFilter = filter.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(lowerFilter) ||
                item.symbol.toLowerCase().includes(lowerFilter)
            );
        }

        result.sort((a, b) => {
            let valA: number | string = a[sortKey];
            let valB: number | string = b[sortKey];

            // Handle string sorting for name
            if (sortKey === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [items, sortKey, sortDirection, filter]);

    const toggleSort = (key: 'totalValue' | 'profit' | 'name') => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc'); // Default to high-to-low for numbers mostly
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
                <Link
                    to="/add-coin"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add New Asset
                </Link>
            </div>

            <PortfolioStats items={items} />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                    <button
                        onClick={() => toggleSort('totalValue')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortKey === 'totalValue' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Value {sortKey === 'totalValue' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => toggleSort('profit')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortKey === 'profit' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        P&L {sortKey === 'profit' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => toggleSort('name')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortKey === 'name' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Name {sortKey === 'name' && (sortDirection === 'asc' ? 'A-Z' : 'Z-A')}
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                    <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assets in portfolio</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding usage crypto assets.</p>
                    <div className="mt-6">
                        <Link
                            to="/add-coin"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Add Asset
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAndFilteredItems.map((item) => (
                        <PortfolioCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortfolioList;
