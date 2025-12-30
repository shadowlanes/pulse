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

const app = express();
const port = Number(process.env.PORT) || 3001;

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
