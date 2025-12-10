import React, { useEffect, useState } from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

interface SearchFilterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filter: 'all' | 'gainers' | 'losers';
    setFilter: (filter: 'all' | 'gainers' | 'losers') => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sortBy,
    setSortBy
}) => {
    // Debounce search input
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery]);

    const activeFiltersCount = (filter !== 'all' ? 1 : 0) + (sortBy !== 'market_cap_desc' ? 1 : 0);

    const clearFilters = () => {
        setFilter('all');
        setSortBy('market_cap_desc');
        setLocalSearch('');
        setSearchQuery('');
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center mb-6">

            {/* Search */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {localSearch && (
                    <button
                        onClick={() => {
                            setLocalSearch('');
                            setSearchQuery('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filters Group */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">

                {/* Status Filter */}
                <div className="flex items-center gap-2 min-w-fit">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
                    >
                        <option value="all">All Coins</option>
                        <option value="gainers">Top Gainers</option>
                        <option value="losers">Top Losers</option>
                    </select>
                </div>

                {/* Sort Filter */}
                <div className="flex items-center gap-2 min-w-fit">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
                    >
                        <option value="market_cap_desc">Market Cap (High to Low)</option>
                        <option value="market_cap_asc">Market Cap (Low to High)</option>
                        <option value="price_desc">Price (High to Low)</option>
                        <option value="price_asc">Price (Low to High)</option>
                        <option value="change_desc">24h Change (High to Low)</option>
                        <option value="change_asc">24h Change (Low to High)</option>
                        <option value="volume_desc">Volume (High to Low)</option>
                        <option value="name_asc">Name (A-Z)</option>
                    </select>
                </div>

                {/* Clear Button */}
                {(activeFiltersCount > 0 || localSearch) && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap px-2"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchFilter;
