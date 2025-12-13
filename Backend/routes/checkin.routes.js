import express from "express";
import {
  addCheckin,
  getAllCheckin,
} from "../controllers/checkin.controller.js";

const router = express.Router();

router.get("/", getAllCheckin);

router.post("/", addCheckin);

export default router;
