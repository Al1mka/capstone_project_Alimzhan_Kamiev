/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3b82f6', // blue-500
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                success: {
                    DEFAULT: '#10b981', // emerald-500
                    500: '#10b981',
                },
                danger: {
                    DEFAULT: '#ef4444', // red-500
                    500: '#ef4444',
                },
                warning: {
                    DEFAULT: '#f59e0b', // amber-500
                    500: '#f59e0b',
                },
                dark: {
                    DEFAULT: '#1f2937', // gray-800
                    500: '#1f2937',
                    800: '#1f2937',
                    900: '#111827',
                }
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
