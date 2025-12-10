import React from 'react';
import type { MarketData } from '../../types';
import CoinCard from './CoinCard';
import { Loader2, Search as SearchIcon } from 'lucide-react';

interface CoinListProps {
    coins: MarketData[];
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    onAddToPortfolio: (coin: MarketData) => void;
}

const CoinList: React.FC<CoinListProps> = ({
    coins,
    isLoading,
    hasMore,
    onLoadMore,
    onAddToPortfolio
}) => {
    // Skeleton Loader Component
    const CoinSkeleton = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-[180px] animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1 ml-auto"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded ml-auto"></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-50 mt-4">
                <div>
                    <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="text-right">
                    <div className="h-3 w-16 bg-gray-200 rounded mb-1 ml-auto"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
                </div>
            </div>
        </div>
    );

    // Initial Loading State
    if (isLoading && coins.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <CoinSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty State
    if (!isLoading && coins.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No coins found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {coins.map((coin) => (
                    <CoinCard
                        key={coin.id}
                        coin={coin}
                        onAddToPortfolio={onAddToPortfolio}
                    />
                ))}

                {isLoading && coins.length > 0 && Array.from({ length: 4 }).map((_, i) => (
                    <CoinSkeleton key={`skeleton-${i}`} />
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More Coins'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

// StartIcon needed for empty state? Reusing logic from verify phase to fix missing import if needed.
// Actually, I missed importing SearchIcon for empty state.
export default CoinList;
