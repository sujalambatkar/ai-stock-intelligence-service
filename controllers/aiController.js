import { fetchStockNews } from "../services/stockNewsService.js";
import { fetchLiveMarketData } from "../services/liveMarketService.js";
import { getMarketContext } from "../services/marketService.js";
import { detectTicker } from "../services/tickerService.js";
import { getStockContext } from "../services/stockService.js";
import { askAI } from "../services/groqService.js";
import { getConversation, addMessage } from "../memory/chatMemory.js";
import { detectIntent } from "../services/intentService.js";
import { fetchMarketNews } from "../services/newsService.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // ------------------------------------------------
    // ✅ Validation
    // ------------------------------------------------
    if (!message || !sessionId) {
      return res.status(400).json({
        error: "message and sessionId required",
      });
    }

    // ------------------------------------------------
    // 🧠 Intent + ticker detection
    // ------------------------------------------------
    const intent = detectIntent(message);
    const ticker = detectTicker(message);

    const history = getConversation(sessionId) || [];

    // Save user message to memory
    addMessage(sessionId, "user", message);

    // ------------------------------------------------
    // 🌍 GLOBAL MARKET CONTEXT
    // ------------------------------------------------
    let marketContext = "";

    try {
      marketContext = await getMarketContext();
    } catch (err) {
      console.log("Market context failed:", err.message);
    }

    // ------------------------------------------------
    // 🧠 BASE PROMPT
    // ------------------------------------------------
    let enhancedMessage = `
You are an AI financial assistant explaining markets to beginner investors.

GLOBAL MARKET CONTEXT:
${marketContext || "No market context available."}

USER QUESTION:
${message}

INTENT: ${intent}
`;

    // ==================================================
    // ⭐ LIVE STOCK INTELLIGENCE (MAIN UPGRADE)
    // ==================================================
    if (ticker) {
      try {
        const stockContext = await getStockContext(ticker);
        const stockNews = await fetchStockNews(ticker);
        const liveData = await fetchLiveMarketData(ticker);

        // ---------------- LIVE MARKET BLOCK ----------------
        let liveBlock = "Live market data unavailable.";

        if (liveData) {
          liveBlock = `
Current Price: ₹${liveData.price}
Change: ${liveData.change.toFixed(2)} (${liveData.changePercent.toFixed(2)}%)
Day High: ₹${liveData.high}
Day Low: ₹${liveData.low}
`;
        }

        // ---------------- NEWS BLOCK ----------------
        let newsBlock = "No recent company-specific news found.";

        if (stockNews?.length) {
          newsBlock = stockNews
            .slice(0, 5)
            .map(
              (n, i) =>
                `${i + 1}. ${n.title} — ${
                  n.description || "No description"
                }`
            )
            .join("\n");
        }

        // ---------------- FINAL STOCK PROMPT ----------------
        enhancedMessage += `

================ LIVE MARKET DATA =================
${liveBlock}

================ STOCK ANALYSIS =================

STOCK: ${ticker} (NIFTY 50)

STOCK CONTEXT:
${stockContext || "No fundamentals available."}

RECENT NEWS ABOUT ${ticker}:
${newsBlock}

INSTRUCTIONS (VERY IMPORTANT):

Respond like a market analyst, not a news summarizer.

OUTPUT FORMAT:
1. Short summary (1–2 sentences)
2. Key Drivers (bullet points)
3. Mention if company-specific news exists or not
4. Confidence Level: Low / Medium / High

RULES:
- Use LIVE MARKET DATA as primary evidence.
- Focus on THIS stock first.
- Use news and market sentiment as supporting context.
- DO NOT invent causes.
- If no company news exists, clearly state it.
- Avoid long explanations.
- Keep answers analytical and concise.

(No financial advice.)
`;
      } catch (err) {
        console.log("Stock intelligence failed:", err.message);
      }
    }

    // ==================================================
    // 📰 MARKET NEWS MODE (NO TICKER DETECTED)
    // ==================================================
    else if (intent === "NEWS_QUERY") {
      try {
        const news = await fetchMarketNews();

        if (news?.length) {
          const newsContext = news
            .slice(0, 6)
            .map(
              (n, i) =>
                `${i + 1}. ${n.title} — ${
                  n.description || "No description"
                }`
            )
            .join("\n");

          enhancedMessage += `

================ MARKET NEWS =================

${newsContext}

Explain major themes affecting markets today.
Keep explanation beginner-friendly.
(No financial advice.)
`;
        }
      } catch (err) {
        console.log("Market news failed:", err.message);
      }
    }

    // ------------------------------------------------
    // 🤖 CALL AI
    // ------------------------------------------------
    const messages = [
      ...history,
      { role: "user", content: enhancedMessage },
    ];

    const reply = await askAI(messages);

    // Save assistant reply
    addMessage(sessionId, "assistant", reply);

    // ------------------------------------------------
    // ✅ RESPONSE
    // ------------------------------------------------
    res.json({
      reply,
      intent,
      ticker: ticker || null,
    });

  } catch (error) {
    console.error("========== AI CONTROLLER ERROR ==========");
    console.error(error);
    console.error("=========================================");

    res.status(500).json({
      error: "AI failed",
      details: error.message,
    });
  }
};