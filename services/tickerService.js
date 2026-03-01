import { NIFTY_50 } from "../data/nifty50.js";

export const detectTicker = (message) => {
  const text = message.toUpperCase();

  for (const ticker in NIFTY_50) {
    if (text.includes(ticker)) {
      return ticker;
    }
  }

  return null;
};

export const getCompanyName = (ticker) => {
  return NIFTY_50[ticker] || ticker;
};