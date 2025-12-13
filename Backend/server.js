import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import checkinRoutes from "./routes/checkin.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import streakRoutes from "./routes/streak.routes.js";
import weeklyStatsRoutes from "./routes/weeklyStats.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API berjalan! 😎");
});

app.use("/api/checkin", checkinRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/activity", weeklyStatsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
