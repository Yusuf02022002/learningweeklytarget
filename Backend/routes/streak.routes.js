import express from "express";
import { getTopStreaks, updateStreak } from "../controllers/streak.controller.js";

const router = express.Router();

router.get("/", getTopStreaks);

router.put("/", updateStreak);

export default router;
