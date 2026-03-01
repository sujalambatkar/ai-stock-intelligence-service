import axios from "axios";

export const askAI = async (messages) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You explain stock market news simply for beginners. No financial advice.",
          },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.log("===== GROQ ERROR =====");
    console.log(error.response?.data || error.message);
    console.log("======================");

    return "AI error occurred.";
  }
};