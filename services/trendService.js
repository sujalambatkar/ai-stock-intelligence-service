export const detectTrend = (previousState, liveData) => {
  if (!previousState || !liveData?.price) {
    return {
      trend: "Unknown",
      signal: "Insufficient data",
    };
  }

  const prevPrice = previousState.price;
  const currentPrice = liveData.price;

  const diff = currentPrice - prevPrice;
  const percentMove = (diff / prevPrice) * 100;

  // -----------------------------
  // TREND LOGIC
  // -----------------------------
  if (percentMove > 1.2) {
    return {
      trend: "Strong Uptrend",
      signal: "Bullish Momentum",
    };
  }

  if (percentMove > 0.3) {
    return {
      trend: "Uptrend",
      signal: "Buyers gaining control",
    };
  }

  if (percentMove < -1.2) {
    return {
      trend: "Strong Downtrend",
      signal: "Bearish Pressure",
    };
  }

  if (percentMove < -0.3) {
    return {
      trend: "Downtrend",
      signal: "Selling momentum building",
    };
  }

  return {
    trend: "Sideways",
    signal: "Market consolidating",
  };
};