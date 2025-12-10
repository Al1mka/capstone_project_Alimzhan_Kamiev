import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Calendar, DollarSign, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { coinGeckoService, type Coin } from '../api/coinGecko';
import { portfolioService } from '../api/portfolioService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Validation Schema
const addCoinSchema = z.object({
    amount: z.number().min(0.00000001, 'Amount must be greater than 0'),
    purchasePrice: z.number().min(0, 'Price cannot be negative'),
    purchaseDate: z.string().refine((date) => new Date(date) <= new Date(), {
        message: 'Purchase date cannot be in the future',
    }),
});

type AddCoinFormData = z.infer<typeof addCoinSchema>;

const AddCoin: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialCoinId = searchParams.get('coinId');

    // State
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

    // Step 1: Search State
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loadingCoins, setLoadingCoins] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);

    // Step 2: Form State
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AddCoinFormData>({
        resolver: zodResolver(addCoinSchema),
        defaultValues: {
            amount: 0,
            purchasePrice: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
        },
    });

    // Real-timeout calculation
    const amount = watch('amount');
    const purchasePrice = watch('purchasePrice');
    const totalValue = (amount || 0) * (purchasePrice || 0);

    // Fetch Coins on Mount
    useEffect(() => {
        const fetchCoins = async () => {
            setLoadingCoins(true);
            try {
                const allCoins = await coinGeckoService.getAllCoins();
                setCoins(allCoins);

                // Handle URL pre-selection
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
    }, [initialCoinId]);

    // Search Filtering
    useEffect(() => {
        if (searchQuery.length > 1) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = coins
                .filter(coin =>
                    coin.name.toLowerCase().includes(lowerQuery) ||
                    coin.symbol.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 20); // Show top 20 results
            setFilteredCoins(filtered);
        } else {
            setFilteredCoins([]);
        }
    }, [searchQuery, coins]);

    const handleSelectCoin = async (coin: Coin) => {
        setSelectedCoin(coin);
        setStep(2);

        // Fetch current price
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
                coinId: selectedCoin.id,
                name: selectedCoin.name,
                symbol: selectedCoin.symbol,
                amount: data.amount,
                purchasePrice: data.purchasePrice,
                purchaseDate: data.purchaseDate,
                image: 'https://thumb.pincap.plus/t500x500/images/product/2023/10/24/09c70404faed21960255c276b6b7724b.jpg', // Placeholder
            });
            navigate('/portfolio');
        } catch (error) {
            console.error('Failed to add coin:', error);
            alert('Failed to save portfolio item.');
        }
    };

    return (
        <div className="max-w-xl mx-auto pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => step === 2 ? setStep(1) : navigate('/portfolio')}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {step === 2 ? 'Back to Search' : 'Back to Portfolio'}
                </button>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {step === 1 ? 'Select Asset' : 'Transaction Details'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {step === 1 ? 'Search for the cryptocurrency you want to add' : `Enter purchase details for ${selectedCoin?.name}`}
                    </p>
                </div>

                <div className="p-8">
                    {/* STEP 1: SELECT COIN */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-lg transition-all"
                                    placeholder={loadingCoins ? "Loading coins..." : "Search Bitcoin, Ethereum..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={loadingCoins}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {loadingCoins ? (
                                    <div className="flex justify-center py-8"><LoadingSpinner /></div>
                                ) : filteredCoins.length > 0 ? (
                                    filteredCoins.map((coin) => (
                                        <button
                                            key={coin.id}
                                            onClick={() => handleSelectCoin(coin)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 rounded-xl transition-all group border border-transparent hover:border-indigo-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {coin.symbol[0].toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900">{coin.name}</p>
                                                    <p className="text-sm text-gray-500 uppercase">{coin.symbol}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
                                        </button>
                                    ))
                                ) : searchQuery.length > 1 ? (
                                    <p className="text-center text-gray-500 py-8">No coins found matching "{searchQuery}"</p>
                                ) : (
                                    <p className="text-center text-gray-400 py-8">Type to search for coins</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DETAILS FORM */}
                    {step === 2 && selectedCoin && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
                                    {selectedCoin.symbol[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{selectedCoin.name}</p>
                                    <p className="text-sm text-indigo-600 uppercase font-medium">{selectedCoin.symbol}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Quantity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            {...register('amount', { valueAsNumber: true })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                                            {selectedCoin.symbol.toUpperCase()}
                                        </span>
                                    </div>
                                    {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Price Per Coin</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            step="any"
                                            {...register('purchasePrice', { valueAsNumber: true })}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.purchasePrice && <p className="text-sm text-red-500">{errors.purchasePrice.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="date"
                                        {...register('purchaseDate')}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                {errors.purchaseDate && <p className="text-sm text-red-500">{errors.purchaseDate.message}</p>}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Total Spent</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" className="text-white" />
                                        Adding Asset...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Add Transaction
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCoin;
