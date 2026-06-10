# AI Stock Assistant

An AI-powered stock market assistant focused on the NIFTY 50. It combines live market data, stock and market news, trend analysis, and an AI chat interface (powered by Groq) to give beginner investors clear, analyst-style insights.

The project is split into two parts:

- `ai-tab-ui/` – React + Vite frontend
- `backend/` – Express API that aggregates market data, news, and AI responses

## Features

- **AI Chat Assistant** – Conversational endpoint that detects user intent and stock tickers, then enriches the AI prompt with live market data, fundamentals, and recent news before responding.
- **AI Tab Dashboard** – Generates a market mood (Bullish / Bearish / Neutral), a short AI insight, a trend signal, and suggested follow-up questions for a focus stock.
- **Live Market Data** – Real-time price, change, day high/low via the Twelve Data API.
- **Stock & Market News** – Recent company-specific and general market news via a news API.
- **Trend Detection** – Compares current data against previously stored market state to detect trend direction.
- **Conversation & Market Memory** – Lightweight in-memory/file-based memory for chat history (`chatMemory`) and per-ticker market state (`marketMemory`), enabling trend comparisons over time.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite, react-markdown, ESLint |
| Backend  | Node.js, Express |
| AI       | Groq API |
| Data     | Twelve Data API (live prices), News API |
| HTTP     | Axios, axios-cookiejar-support, tough-cookie |

## System Architecture

```
ai-tab-ui (React + Vite)
        |
        | HTTP requests
        v
backend (Express server, port 5050)
        |
        |-- GET  /api/health      -> health check
        |
        |-- POST /api/ai/chat     -> aiController.chatWithAI
        |           |-- detectIntent / detectTicker  (intentService, tickerService)
        |           |-- getMarketContext              (marketService)
        |           |-- getStockContext                (stockService)
        |           |-- fetchLiveMarketData            (liveMarketService -> Twelve Data API)
        |           |-- fetchStockNews / fetchMarketNews (stockNewsService, newsService)
        |           |-- chatMemory (per-session conversation history)
        |           |-- askAI                          (groqService -> Groq API)
        |
        |-- GET  /api/aitab       -> aiTabController.getAITabData
        |           |-- marketMemory (previous price/mood/insight per ticker)
        |           |-- getMarketContext                (marketService)
        |           |-- fetchLiveMarketData             (liveMarketService -> Twelve Data API)
        |           |-- detectTrend                     (trendService)
        |           |-- fetchStockNews                  (stockNewsService)
        |           |-- askAI                           (groqService -> Groq API)
        |           |-- saveMarketMemory (persists new state for next comparison)
        v
External services: Groq API, Twelve Data API, News API
```

### Request flow summary

1. The frontend sends a chat message or requests AI tab data for a given ticker.
2. The backend detects intent/ticker (chat) or uses the requested ticker (AI tab).
3. It gathers supporting context: global market context, live price data, fundamentals, and recent news.
4. Previous state is loaded from memory (chat history or per-ticker market memory) for continuity and trend comparison.
5. A structured prompt is built and sent to the Groq API via `groqService`.
6. The AI response is parsed, the new state is saved to memory, and the result is returned to the frontend.

## API Endpoints

### `GET /api/health`
Returns a simple status message confirming the service is running.

### `POST /api/ai/chat`
Conversational AI endpoint.

**Body:**
```json
{
  "message": "What's happening with TCS today?",
  "sessionId": "some-session-id"
}
```

**Response:**
```json
{
  "reply": "...",
  "intent": "...",
  "ticker": "TCS"
}
```

### `GET /api/aitab?ticker=RELIANCE`
Returns dashboard data for the AI tab. `ticker` defaults to `RELIANCE` if omitted.

**Response:**
```json
{
  "focusStock": "RELIANCE",
  "liveData": { "price": 0, "change": 0, "changePercent": 0, "high": 0, "low": 0 },
  "trend": { "trend": "Unknown", "signal": "..." },
  "topNews": [],
  "marketMood": "Neutral",
  "aiInsight": "...",
  "suggestedQuestions": []
}
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- API keys for Groq, Twelve Data, and your chosen News API

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
GROQ_API_KEY=your_groq_api_key
NEWS_API_KEY=your_news_api_key
TWELVE_API_KEY=your_twelve_data_api_key
```

Start the server:

```bash
npm start
```

The backend runs on `http://localhost:5050`.

### Frontend Setup

```bash
cd ai-tab-ui
npm install
npm run dev
```

This starts the Vite development server with hot module reloading.

## Project Structure

```
ai-stock-assistant/
├── ai-tab-ui/              # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── backend/                # Express API
    ├── server.js           # App entry point
    ├── routes/
    │   ├── aiRoutes.js      # /api/ai
    │   └── aiTabRoutes.js   # /api/aitab
    ├── controllers/
    │   ├── aiController.js
    │   └── aiTabController.js
    ├── services/
    │   ├── groqService.js       # Groq API integration
    │   ├── intentService.js     # User intent detection
    │   ├── tickerService.js     # Ticker detection from text
    │   ├── liveMarketService.js # Live price data (Twelve Data)
    │   ├── marketService.js     # Global market context
    │   ├── stockService.js      # Stock fundamentals/context
    │   ├── stockNewsService.js  # Stock-specific news
    │   ├── newsService.js       # General market news
    │   └── trendService.js      # Trend detection logic
    ├── memory/
    │   ├── chatMemory.js        # Per-session conversation history
    │   └── marketMemory.js      # Per-ticker market state history
    └── data/
        └── nifty50.js            # NIFTY 50 ticker reference data
```

## Disclaimer

This project provides AI-generated market commentary for educational purposes only. It does not constitute financial advice.
