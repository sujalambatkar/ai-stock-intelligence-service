import axios from "axios";
import { getCompanyName } from "./tickerService.js";

export const fetchStockNews = async (ticker) => {
  try {
    const company = getCompanyName(ticker);

    const res = await axios.get(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: `"${company}" OR ${ticker} stock India`,
          language: "en",
          sortBy: "publishedAt",
          pageSize: 5,
          apiKey: process.env.NEWS_API_KEY,
        },
      }
    );

    return res.data.articles || [];
  } catch (err) {
    console.log("Stock news fetch failed:", err.message);
    return [];
  }
};