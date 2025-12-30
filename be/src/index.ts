import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import pulseRoutes from "./routes/pulse.routes";
import { setupCronJobs } from "./cron/pulse.cron";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

if (!NEWS_API_KEY || !GEMINI_API_KEY || !GNEWS_API_KEY) {
    console.error("CRITICAL ERROR: Missing required environment variables.");
    console.error("Please ensure NEWS_API_KEY, GEMINI_API_KEY, and GNEWS_API_KEY are set in your .env file.");
    process.exit(1);
}

const app = express();

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Pulse API",
            version: "1.0.0",
            description: "API documentation for the Pulse Digital Health Dashboard",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ["./src/routes/*.ts"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Pulse routes
app.use("/api/pulse", pulseRoutes);

// Healthcheck endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    setupCronJobs();
});
