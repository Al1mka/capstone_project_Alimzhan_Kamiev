import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Calendar, DollarSign, Coins, Save, ArrowLeft } from 'lucide-react';
import { coinGeckoService, type Coin } from '../../api/coinGecko';
import { portfolioService } from '../../api/portfolioService';
import LoadingSpinner from '../ui/LoadingSpinner';

// Validation Schema
const addCoinSchema = z.object({
    coinId: z.string().min(1, 'Please select a coin'),
    amount: z.number().min(0.00000001, 'Amount must be greater than 0'),
    purchasePrice: z.number().min(0, 'Price cannot be negative'),
    purchaseDate: z.string().refine((date) => new Date(date) <= new Date(), {
        message: 'Purchase date cannot be in the future',
    }),
});

type AddCoinFormData = z.infer<typeof addCoinSchema>;

const AddCoinForm: React.FC = () => {
    const navigate = useNavigate();
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loadingCoins, setLoadingCoins] = useState(false);
    const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AddCoinFormData>({
        resolver: zodResolver(addCoinSchema),
        defaultValues: {
            amount: 0,
            purchasePrice: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
        },
    });

    const [searchParams] = useSearchParams();
    const initialCoinId = searchParams.get('coinId');

    useEffect(() => {
        const fetchCoins = async () => {
            setLoadingCoins(true);
            try {
                // For better UX in a real app, we might want to cache this or use a search endpoint
                // to avoid fetching 10k+ coins every time.
                const allCoins = await coinGeckoService.getAllCoins();
                setCoins(allCoins);

                // Auto-select if URL param exists
                if (initialCoinId) {
                    const foundCoin = allCoins.find(c => c.id === initialCoinId);
                    if (foundCoin) {
                        handleSelectCoin(foundCoin);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch coins', error);
            } finally {
                setLoadingCoins(false);
            }
        };
        fetchCoins();
    }, [initialCoinId]); // Re-run if ID changes, though usually happens on mount only

    useEffect(() => {
        if (searchQuery.length > 1) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = coins
                .filter(coin =>
                    coin.name.toLowerCase().includes(lowerQuery) ||
                    coin.symbol.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 50); // Limit results for performance
            setFilteredCoins(filtered);
            setIsDropdownOpen(true);
        } else {
            setFilteredCoins([]);
            setIsDropdownOpen(false);
        }
    }, [searchQuery, coins]);

    const handleSelectCoin = async (coin: Coin) => {
        setSelectedCoin(coin);
        setValue('coinId', coin.id);
        setSearchQuery(coin.name);
        setIsDropdownOpen(false);

        // Fetch current price to pre-fill purchase price
        try {
            const prices = await coinGeckoService.getSimplePrices([coin.id]);
            const currentPrice = prices[coin.id]?.usd;
            if (currentPrice) {
                setValue('purchasePrice', currentPrice);
            }
        } catch (err) {
            console.error('Failed to fetch current price', err);
        }
    };

    const onSubmit = async (data: AddCoinFormData) => {
        if (!selectedCoin) return;

        try {
            await portfolioService.addToPortfolio({
                coinId: data.coinId,
                name: selectedCoin.name,
                symbol: selectedCoin.symbol,
                amount: data.amount,
                purchasePrice: data.purchasePrice,
                purchaseDate: data.purchaseDate,
                image: 'https://thumb.pincap.plus/t500x500/images/product/2023/10/24/09c70404faed21960255c276b6b7724b.jpg', // Placeholder, ideally fetch image from details
            });
            navigate('/portfolio');
        } catch (error) {
            console.error('Failed to add coin:', error);
            alert('Failed to save portfolio item.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/portfolio')}
                className="mb-6 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Portfolio
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-indigo-600" />
                        Add New Asset
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Coin Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Asset
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder={loadingCoins ? "Loading coins..." : "Search Bitcoin, Ethereum..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={loadingCoins}
                            />
                        </div>
                        {errors.coinId && (
                            <p className="mt-1 text-sm text-red-600">{errors.coinId.message}</p>
                        )}

                        {/* Dropdown */}
                        {isDropdownOpen && filteredCoins.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {filteredCoins.map((coin) => (
                                    <div
                                        key={coin.id}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 text-gray-900"
                                        onClick={() => handleSelectCoin(coin)}
                                    >
                                        <div className="flex items-center">
                                            <span className="font-semibold block truncate">
                                                {coin.name}
                                            </span>
                                            <span className="text-gray-500 ml-2 text-xs uppercase">
                                                {coin.symbol}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity Bought
                            </label>
                            <input
                                type="number"
                                step="any"
                                {...register('amount', { valueAsNumber: true })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.amount && (
                                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                            )}
                        </div>

                        {/* Purchase Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price Per Coin ($)
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    step="any"
                                    {...register('purchasePrice', { valueAsNumber: true })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            {errors.purchasePrice && (
                                <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purchase Date
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                {...register('purchaseDate')}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        {errors.purchaseDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2 text-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Add Transaction
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCoinForm;
