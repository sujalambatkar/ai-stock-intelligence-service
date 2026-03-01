import {
  getMarketMemory,
  saveMarketMemory,
} from "../memory/marketMemory.js";

import { detectTrend } from "../services/trendService.js";
import { fetchLiveMarketData } from "../services/liveMarketService.js";
import { fetchStockNews } from "../services/stockNewsService.js";
import { getMarketContext } from "../services/marketService.js";
import { askAI } from "../services/groqService.js";

export const getAITabData = async (req, res) => {
  try {
    const { ticker = "RELIANCE" } = req.query;

    // ------------------------------------------------
    // 🧠 LOAD PREVIOUS MARKET MEMORY
    // ------------------------------------------------
    const previousState = getMarketMemory(ticker);

    // default trend
    let trendInfo = {
      trend: "Unknown",
      signal: "No trend yet",
    };

    // ------------------------------------------------
    // 🌍 MARKET CONTEXT
    // ------------------------------------------------
    let marketContext = "No market context available.";
    try {
      marketContext = await getMarketContext();
    } catch (err) {
      console.log("Market context failed:", err.message);
    }

    // ------------------------------------------------
    // 📈 LIVE MARKET DATA
    // ------------------------------------------------
    let liveData = null;
    try {
      liveData = await fetchLiveMarketData(ticker);
    } catch (err) {
      console.log("Live market fetch failed:", err.message);
    }

    // ------------------------------------------------
    // 📊 TREND DETECTION (NEW)
    // ------------------------------------------------
    try {
      trendInfo = detectTrend(previousState, liveData);
    } catch (err) {
      console.log("Trend detection failed:", err.message);
    }

    // ------------------------------------------------
    // 📰 STOCK NEWS
    // ------------------------------------------------
    let news = [];
    try {
      news = await fetchStockNews(ticker);
    } catch (err) {
      console.log("Stock news fetch failed:", err.message);
    }

    const newsSummary = news?.length
      ? news
          .slice(0, 5)
          .map((n, i) => `${i + 1}. ${n.title}`)
          .join("\n")
      : "No major news";

    // ------------------------------------------------
    // 🤖 AI INSIGHT GENERATION (WITH MEMORY + TREND)
    // ------------------------------------------------
    const prompt = `
You are a financial AI assistant for beginner investors.

================ MARKET CONTEXT ================
${marketContext}

================ PREVIOUS MARKET STATE ================
${
  previousState
    ? `
Previous Price: ₹${previousState.price}
Previous Mood: ${previousState.mood}
Last Insight: ${previousState.insight}
`
    : "No previous data available."
}

================ TREND ANALYSIS ================
Trend: ${trendInfo.trend}
Signal: ${trendInfo.signal}

================ CURRENT STOCK ================
Stock: ${ticker}

LIVE DATA:
Price: ₹${liveData?.price ?? "N/A"}
Change: ${liveData?.change ?? "N/A"} (${liveData?.changePercent ?? "N/A"}%)

RECENT NEWS:
${newsSummary}

TASK:

1. Determine Market Mood (Bullish / Bearish / Neutral)
2. Give a SHORT AI insight (MAX 2 sentences)
3. Use trend + past state when reasoning
4. Generate 3 smart investor questions

RULES:
- Be concise
- Do NOT hallucinate news
- Compare past vs present
- Sound like a market analyst

Return STRICT JSON ONLY:

{
  "marketMood": "",
  "aiInsight": "",
  "suggestedQuestions": []
}
`;

    const aiResponse = await askAI([
      { role: "user", content: prompt },
    ]);

    // ------------------------------------------------
    // 🧠 SAFE JSON PARSE
    // ------------------------------------------------
    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      parsed = {
        marketMood: "Neutral",
        aiInsight: aiResponse,
        suggestedQuestions: [],
      };
    }

    // ------------------------------------------------
    // 💾 SAVE NEW MARKET MEMORY
    // ------------------------------------------------
    saveMarketMemory(ticker, {
      price: liveData?.price,
      mood: parsed.marketMood,
      insight: parsed.aiInsight,
    });

    // ------------------------------------------------
    // ✅ FINAL RESPONSE
    // ------------------------------------------------
    res.json({
      focusStock: ticker,
      liveData,
      trend: trendInfo, // ⭐ NEW FIELD
      topNews: news.slice(0, 5),
      marketMood: parsed.marketMood,
      aiInsight: parsed.aiInsight,
      suggestedQuestions: parsed.suggestedQuestions,
    });

  } catch (error) {
    console.error("========== AI TAB ERROR ==========");
    console.error(error);
    console.error("==================================");

    res.status(500).json({
      error: "AI Tab failed",
      details: error.message,
    });
  }
};