import React from 'react';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex space-x-6 md:order-2">
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Twitter</span>
                            <Twitter className="h-6 w-6" />
                        </a>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} CryptoTracker. All rights reserved.
                        </p>
                        <p className="mt-2 text-center text-xs text-gray-400">
                            Powered by <a href="https://www.coingecko.com/en/api" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">CoinGecko API</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
