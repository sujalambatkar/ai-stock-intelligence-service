import axios from "axios";

export const fetchMarketNews = async () => {
  try {
    const response = await axios.get(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: "stock market OR finance OR economy",
          language: "en",
          sortBy: "publishedAt",
          pageSize: 5,
          apiKey: process.env.NEWS_API_KEY,
        },
      }
    );

    // keep only useful info
    return response.data.articles.map((article) => ({
      title: article.title,
      description: article.description,
    }));

  } catch (error) {
    console.log("NEWS API ERROR:", error.message);
    return [];
  }
};