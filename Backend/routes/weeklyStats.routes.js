import express from "express";
import {
  getWeeklyStats,
  updateWeeklyStats,
} from "../controllers/weeklyStats.controller.js";

const router = express.Router();

router.get("/", getWeeklyStats);
router.post("/update", updateWeeklyStats);

export default router;
