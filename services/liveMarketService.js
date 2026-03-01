import axios from "axios";

// ---------------------------------------------
// NSE SYMBOL MAP
// ---------------------------------------------
const nseTickerMap = {
  RELIANCE: "RELIANCE",
  TCS: "TCS",
  INFY: "INFY",
  HDFCBANK: "HDFCBANK",
  ICICIBANK: "ICICIBANK",
};

// ---------------------------------------------
// NSE LIVE DATA (PRIMARY SOURCE)
// ---------------------------------------------
const fetchFromNSE = async (ticker) => {
  try {
    const symbol = nseTickerMap[ticker];
    if (!symbol) return null;

    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        Accept: "application/json",
        Referer: "https://www.nseindia.com/",
      },
    });

    const data = response.data?.priceInfo;

    if (!data) return null;

    return {
      price: data.lastPrice,
      change: data.change,
      changePercent: data.pChange,
      high: data.intraDayHighLow?.max,
      low: data.intraDayHighLow?.min,
      source: "NSE",
    };
  } catch (err) {
    console.log("NSE fetch failed:", err.message);
    return null;
  }
};

// ---------------------------------------------
// TWELVEDATA FALLBACK
// ---------------------------------------------
const fetchFromTwelveData = async (ticker) => {
  try {
    const apiKey = process.env.TWELVE_API_KEY;

    const symbol = `${ticker}.NSE`;

    const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`;

    const response = await axios.get(url);

    if (!response.data?.price) return null;

    return {
      price: Number(response.data.price),
      change: null,
      changePercent: null,
      high: null,
      low: null,
      source: "TwelveData",
    };
  } catch (err) {
    console.log("TwelveData fetch failed:", err.message);
    return null;
  }
};

// ---------------------------------------------
// MAIN EXPORT (SMART FALLBACK)
// ---------------------------------------------
export const fetchLiveMarketData = async (ticker) => {
  // 1️⃣ Try NSE first
  const nseData = await fetchFromNSE(ticker);
  if (nseData) return nseData;

  // 2️⃣ Fallback → TwelveData
  const tdData = await fetchFromTwelveData(ticker);
  if (tdData) return tdData;

  return null;
};