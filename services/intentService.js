export const detectIntent = (message) => {
  const text = message.toLowerCase();

  if (text.includes("news") || text.includes("today") || text.includes("latest")) {
    return "NEWS_QUERY";
  }

  if (text.includes("why") || text.includes("how")) {
    return "EXPLANATION";
  }

  if (text.includes("buy") || text.includes("sell") || text.includes("invest")) {
    return "INVESTMENT_GUIDANCE";
  }

  return "GENERAL_CHAT";
};