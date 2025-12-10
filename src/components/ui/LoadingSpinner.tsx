import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    text?: string;
    className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            <div
                className={`
          ${sizeClasses[size]}
          rounded-full
          border-gray-200
          border-t-blue-600
          animate-spin
        `}
                role="status"
                aria-label="loading"
            />
            {text && (
                <p className="mt-3 text-gray-500 font-medium text-sm animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
