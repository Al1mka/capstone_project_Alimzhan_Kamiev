# Crypto Portfolio Tracker

A modern, responsive cryptocurrency portfolio tracking application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0.2-blue)

## Features

-   **Dashboard**: Overview of portfolio performance with real-time charts.
-   **Portfolio Management**: Add, edit, and remove assets.
-   **Market Data**: Live cryptocurrency prices and market stats via CoinGecko API.
-   **Interactive Charts**: Visual price history and portfolio allocation.
-   **Persistent State**: Data saved to local storage for persistence.
-   **Responsive Design**: Optimized for desktop, tablet, and mobile.

## Technology Stack

-   **Frontend**: React, TypeScript, Vite
-   **State Management**: Zustand, Immer
-   **Styling**: Tailwind CSS, Lucide React (Icons)
-   **Charts**: Recharts
-   **Form Handling**: React Hook Form, Zod
-   **Routing**: React Router DOM (v7)

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/crypto-portfolio-tracker.git
    cd crypto-portfolio-tracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    -   Copy `.env.development` to `.env` (optional, defaults provided).

4.  Start Development Server:
    ```bash
    npm run dev
    ```
    -   Access the app at `http://localhost:3000`.

5.  Start Mock Data Server (Optional):
    ```bash
    npm run server
    ```
    -   Runs `json-server` on port 3001.

## API Documentation

### External API: CoinGecko
The app uses the free CoinGecko API for market data.
-   **Base URL**: `https://api.coingecko.com/api/v3`
-   **Endpoints**: `/coins/list`, `/simple/price`, `/coins/markets`, `/coins/{id}/market_chart`
-   **Rate Limit**: ~10-30 calls/minute (Free Tier).

### Internal Mock API
Used for simulating backend portfolio persistence during development.
-   **Base URL**: `http://localhost:3001`
-   **Resource**: `/portfolio` (GET, POST, PUT, DELETE)

## Build & Deployment

### Build for Production
To create an optimized production build:
```bash
npm run build
```
This generates static files in the `dist/` directory.

### Deployment Guide (Vercel/Netlify)
1.  **Vercel/Netlify**: Connect your GitHub repository.
2.  **Build Settings**:
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
3.  **Environment Variables**: Add keys from `.env.production` to your deployment settings.
4.  **Deploy**: Trigger the deploy.

## License

This project is licensed under the MIT License.
