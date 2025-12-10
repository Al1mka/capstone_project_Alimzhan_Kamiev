import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    PlusCircle,
    Search,
    Download,
    Trash2,
    Edit2,
    TrendingUp,
    TrendingDown,
    Filter,
    ArrowUpDown,
    CheckSquare,
    Square
} from 'lucide-react';
import { portfolioService, type EnrichedPortfolioItem } from '../api/portfolioService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

// Types for filtering and sorting
type SortKey = 'name' | 'totalValue' | 'profit' | 'profitPercentage' | 'amount';
type SortDirection = 'asc' | 'desc';

const Portfolio: React.FC = () => {
    // --- State ---
    const [items, setItems] = useState<EnrichedPortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters & Sort
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('totalValue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [filterProfit, setFilterProfit] = useState<'all' | 'profit' | 'loss'>('all');

    // Selection & Bulk Actions
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EnrichedPortfolioItem | null>(null);

    // Edit Form State
    const [editAmount, setEditAmount] = useState<string>('');
    const [editPrice, setEditPrice] = useState<string>('');

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await portfolioService.syncPortfolioWithPrices();
            setItems(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching portfolio:', err);
            setError('Failed to load portfolio data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Handlers ---

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(new Set(items.map(i => i.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await portfolioService.deleteFromPortfolio(itemToDelete);
            setItems(prev => prev.filter(i => i.id !== itemToDelete));
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemToDelete);
                return newSet;
            });
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const handleEditClick = (item: EnrichedPortfolioItem) => {
        setEditingItem(item);
        setEditAmount(item.amount.toString());
        setEditPrice(item.purchasePrice.toString());
        setIsEditModalOpen(true);
    };

    const confirmEdit = async () => {
        if (!editingItem) return;
        try {
            const updates = {
                amount: parseFloat(editAmount),
                purchasePrice: parseFloat(editPrice)
            };

            await portfolioService.updatePortfolioItem(editingItem.id, updates);

            // Refresh data to get recalculations
            fetchData();
            setIsEditModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            alert('Failed to update item');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(items, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'crypto-portfolio.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // --- Derived State ---

    const filteredAndSortedItems = useMemo(() => {
        let result = [...items];

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(q) ||
                item.symbol.toLowerCase().includes(q)
            );
        }

        // 2. Filter Profit/Loss
        if (filterProfit !== 'all') {
            result = result.filter(item =>
                filterProfit === 'profit' ? item.profit >= 0 : item.profit < 0
            );
        }

        // 3. Sort
        result.sort((a, b) => {
            let valA: string | number = a[sortKey];
            let valB: string | number = b[sortKey];

            if (sortKey === 'name') {
                valA = (valA as string).toLowerCase();
                valB = (valB as string).toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [items, searchQuery, filterProfit, sortKey, sortDirection]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        }).format(val);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    const totalPortfolioValue = items.reduce((acc, i) => acc + i.totalValue, 0);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
                    <p className="text-gray-500 mt-1">
                        Total Value: <span className="font-bold text-gray-900">{formatCurrency(totalPortfolioValue)}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export JSON
                    </button>
                    <Link
                        to="/add-coin"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Asset
                    </Link>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search coins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={filterProfit}
                            onChange={(e) => setFilterProfit(e.target.value as any)}
                            className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
                        >
                            <option value="all">All Assets</option>
                            <option value="profit">In Profit</option>
                            <option value="loss">In Loss</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    {/* Sort Options (Mobile) */}
                    <div className="md:hidden">
                        <select
                            value={sortKey}
                            onChange={(e) => handleSort(e.target.value as SortKey)}
                            className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
                        >
                            <option value="totalValue">Sort by Value</option>
                            <option value="profit">Sort by Profit</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlusCircle className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your portfolio is empty</h3>
                    <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                        Start tracking your crypto journey by adding your first asset.
                    </p>
                    <Link
                        to="/add-coin"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Add First Asset
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 w-10">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => handleSelectAll(selectedItems.size !== items.length)}
                                                className="text-gray-400 hover:text-indigo-600"
                                            >
                                                {selectedItems.size === items.length && items.length > 0 ? (
                                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </th>
                                    <th
                                        className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Asset
                                            {sortKey === 'name' && (
                                                <ArrowUpDown className="w-3 h-3" />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('amount')}
                                    >
                                        Holdings
                                    </th>
                                    <th className="py-3 px-4 text-right">Price</th>
                                    <th
                                        className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('totalValue')}
                                    >
                                        Total Value
                                    </th>
                                    <th
                                        className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('profit')}
                                    >
                                        Profit/Loss
                                    </th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAndSortedItems.map(item => (
                                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedItems.has(item.id) ? 'bg-indigo-50/50' : ''}`}>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleSelectItem(item.id)}
                                                className="text-gray-400 hover:text-indigo-600"
                                            >
                                                {selectedItems.has(item.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500">{item.symbol.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="font-medium text-gray-900">{item.amount}</div>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-600">
                                            {formatCurrency(item.currentPrice)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                                            {formatCurrency(item.totalValue)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className={`font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                                            </div>
                                            <div className={`text-xs ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.profitPercentage.toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List (Cards) */}
                    <div className="md:hidden space-y-4">
                        {filteredAndSortedItems.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <span className="text-xs text-gray-500">{item.symbol.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-50 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Holdings</p>
                                        <p className="font-medium text-gray-900">{item.amount} {item.symbol.toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">Current Price</p>
                                        <p className="font-medium text-gray-900">{formatCurrency(item.currentPrice)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Value</p>
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(item.totalValue)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold flex items-center gap-1 ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {Math.abs(item.profitPercentage).toFixed(2)}%
                                        </p>
                                        <p className={`text-xs ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modals */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Remove Asset"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Remove Asset</Button>
                    </>
                }
            >
                <p className="text-gray-600">
                    Are you sure you want to remove this asset from your portfolio? This action cannot be undone.
                </p>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Asset"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={confirmEdit}>Save Changes</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Owned</label>
                        <input
                            type="number"
                            step="any"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Average Buy Price ($)</label>
                        <input
                            type="number"
                            step="any"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Portfolio;
