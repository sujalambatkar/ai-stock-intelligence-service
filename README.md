# AI Stock Assistant

An AI-powered stock market assistant with a React frontend and a Node.js/Express backend. It provides live market data, stock news, trends, and conversational AI insights powered by Groq.

## Project Structure

- `ai-tab-ui/` – React + Vite frontend application
- `backend/` – Express backend API (routes, controllers, and services for market data, news, trends, and AI)

## Backend

### Setup

```bash
cd backend
npm install
npm start
```

### Features

- Live market data (`liveMarketService`, `marketService`)
- Stock news and ticker information (`stockNewsService`, `tickerService`)
- Market trend analysis (`trendService`)
- AI-driven conversation and intent detection via Groq (`groqService`, `intentService`)

## Frontend

### Setup

```bash
cd ai-tab-ui
npm install
npm run dev
```

This starts the Vite development server with hot module reloading.

## Environment Variables

The backend requires a `.env` file with API keys/configuration (e.g., Groq API key) used by the services in `backend/services`.

## System Architecture

```
ai-tab-ui (React + Vite)
        |
        | HTTP requests
        v
backend (Express server, port 5050)
        |
        |-- /api/health        -> health check
        |-- /api/ai            -> aiRoutes -> aiController -> groqService, intentService
        |-- /api/aitab         -> aiTabRoutes -> aiTabController -> marketService,
        |                          liveMarketService, stockService, stockNewsService,
        |                          tickerService, trendService, newsService
        v
External data sources and Groq API
```

- The frontend (`ai-tab-ui`) communicates with the backend over HTTP, calling the `/api/ai` and `/api/aitab` endpoints.
- `aiController` and `intentService` handle conversational AI requests, forwarding prompts to the Groq API via `groqService`.
- `aiTabController` aggregates data from the market, news, ticker, and trend services to power the AI tab dashboard.
- The `backend/data` and `backend/memory` directories support caching and stateful context for AI responses.
