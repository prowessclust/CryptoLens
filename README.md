# CryptoLens

A real-time cryptocurrency tracking application built with Next.js that provides live market data, price charts, and trending coins using the CoinGecko API.

## Key Features

- **Live Market Data**: Real-time cryptocurrency prices and market statistics
- **Interactive Charts**: Candlestick charts with multiple timeframes (1D, 7D, 30D, 90D, 1Y)
- **Trending Coins**: Track the most popular cryptocurrencies with 24h price changes
- **Coin Categories**: Browse cryptocurrencies by categories
- **Currency Converter**: Convert between different cryptocurrencies
- **Responsive Design**: Modern UI with dark mode support

## Tech Stack

**Frontend:**
- Next.js 16.1.1 (React 19.2.3)
- TypeScript
- TailwindCSS 4
- Radix UI components
- Lucide React icons

**Libraries:**
- `lightweight-charts` - Interactive candlestick charts
- `query-string` - URL query parsing
- `class-variance-authority` & `clsx` - Styling utilities

**API:**
- CoinGecko Demo API

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cryptolens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
   COINGECKO_API_KEY=your_api_key_here
   ```

4. **Get a CoinGecko API key**
   - Sign up at [CoinGecko](https://www.coingecko.com/en/api)
   - Get your free demo API key
   - Add it to `.env.local`

## How to Run the Project

**Development mode:**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

**Production build:**
```bash
npm run build
npm start
```

**Linting and formatting:**
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## Project Structure

```
cryptolens/
├── app/                    # Next.js app directory
│   ├── coins/             # Coin detail pages
│   ├── api/               # API routes
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── home/             # Home page components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   └── coingecko.actions.ts  # API fetching logic
├── constants.ts           # App constants
└── type.d.ts             # TypeScript type definitions
```

## Important Notes

- **API Rate Limits**: CoinGecko Demo API has rate limits. The app implements 60-second revalidation to minimize requests.
- **Supported Chart Periods**: 1D, 7D, 30D, 90D, 1Y (3M and MAX are not supported by the demo API)
- **Environment Variables**: Ensure `.env.local` is properly configured before running the app.

## Future Improvements

- Add user authentication and portfolio tracking
- Implement price alerts and notifications
- Add more chart types (line, area)
- Support for multiple fiat currencies
- Historical data comparison tools
