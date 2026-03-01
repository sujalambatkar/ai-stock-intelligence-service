import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import aiRoutes from "./routes/aiRoutes.js";
import aiTabRoutes from "./routes/aiTabRoutes.js";

dotenv.config();

const app = express();

// ------------------------------------------------
// Middleware
// ------------------------------------------------
app.use(cors());
app.use(express.json());

// ------------------------------------------------
// Health check
// ------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ message: "AI service running ✅" });
});

// ------------------------------------------------
// AI CHAT API
// ------------------------------------------------
app.use("/api/ai", aiRoutes);

// ------------------------------------------------
// AI TAB API ✅ FIXED PATH
// ------------------------------------------------
app.use("/api/aitab", aiTabRoutes);

// ------------------------------------------------
// Server
// ------------------------------------------------
const PORT = 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});