const marketMemory = {};

// get previous state
export const getMarketMemory = (ticker) => {
  return marketMemory[ticker] || null;
};

// save new state
export const saveMarketMemory = (ticker, data) => {
  marketMemory[ticker] = {
    ...data,
    timestamp: new Date().toISOString(),
  };
};