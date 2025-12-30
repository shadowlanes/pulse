import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import pulseRoutes from "./routes/pulse.routes";
import { setupCronJobs } from "./cron/pulse.cron";
import path from "path";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8100",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Pulse routes
app.use("/api/pulse", pulseRoutes);

// Serve static pulse pages
app.use("/pulse", express.static(path.join(process.cwd(), "static", "pulse")));

// Healthcheck endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    setupCronJobs();
});
