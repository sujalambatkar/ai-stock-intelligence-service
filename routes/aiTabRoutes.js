import express from "express";
import { getAITabData } from "../controllers/aiTabController.js";

const router = express.Router();

// MAIN ENDPOINT
router.get("/", getAITabData);

export default router;