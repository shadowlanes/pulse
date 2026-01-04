import { Router } from "express";
import { prisma } from "../lib/prisma";
import { PulseService } from "../services/pulse.service";

const router = Router();
const pulseService = new PulseService();

/**
 * @swagger
 * components:
 *   schemas:
 *     PulseStatus:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [Good, Bad]
 *         score:
 *           type: number
 */

/**
 * @swagger
 * /api/pulse/history:
 *   get:
 *     summary: Get pulse history for a date range
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: A list of pulse statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PulseStatus'
 */
router.get("/history", async (req, res) => {
  const { start, end } = req.query;
  
  try {
    const pulses = await prisma.pulse.findMany({
      where: {
        date: {
          gte: start ? new Date(start as string) : undefined,
          lte: end ? new Date(end as string) : undefined,
        },
      },
      select: {
        date: true,
        status: true,
        score: true,
      },
      orderBy: { date: "asc" },
    });
    res.json(pulses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pulse history" });
  }
});

/**
 * @swagger
 * /api/pulse/metrics:
 *   get:
 *     summary: Get weekly and monthly health metrics
 *     responses:
 *       200:
 *         description: Pulse metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 last7:
 *                   type: object
 *                   properties:
 *                     steady: { type: integer }
 *                     distressed: { type: integer }
 *                     percentage: { type: integer }
 *                 last30:
 *                   type: object
 *                   properties:
 *                     steady: { type: integer }
 *                     distressed: { type: integer }
 *                     percentage: { type: integer }
 */
router.get("/metrics", async (req, res) => {
  try {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    const [sevenDayPulses, thirtyDayPulses] = await Promise.all([
      prisma.pulse.findMany({ where: { date: { gte: last7Days } } }),
      prisma.pulse.findMany({ where: { date: { gte: last30Days } } }),
    ]);

    const calculateMetrics = (pulses: any[]) => {
      const steady = pulses.filter(p => p.status === "Good").length;
      const distressed = pulses.filter(p => p.status === "Bad").length;
      const percentage = pulses.length > 0 ? Math.round((steady / pulses.length) * 100) : 0;
      const averageScore = pulses.length > 0 
        ? Number((pulses.reduce((acc, p) => acc + p.score, 0) / pulses.length).toFixed(1))
        : 0;
      return { steady, distressed, percentage, averageScore };
    };

    res.json({
      last7: calculateMetrics(sevenDayPulses),
      last30: calculateMetrics(thirtyDayPulses),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
});

/**
 * @swagger
 * /api/pulse/last-7-days:
 *   get:
 *     summary: Get complete pulse data for the last 7 days
 *     responses:
 *       200:
 *         description: Array of pulse data with all fields (id, date, status, score, headlines, rationale, timestamps)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   date: { type: string, format: date-time }
 *                   status: { type: string, enum: [Good, Bad] }
 *                   score: { type: number }
 *                   headlines: { type: array }
 *                   rationale: { type: string }
 *                   createdAt: { type: string, format: date-time }
 *                   updatedAt: { type: string, format: date-time }
 */
router.get("/last-7-days", async (req, res) => {
  try {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const pulses = await prisma.pulse.findMany({
      where: {
        date: {
          gte: last7Days,
        },
      },
      orderBy: { date: "asc" },
    });

    res.json(pulses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch last 7 days data" });
  }
});

/**
 * @swagger
 * /api/pulse/details/{date}:
 *   get:
 *     summary: Get full pulse details for a specific date
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Pulse data including headlines and rationale
 *       404:
 *         description: Pulse not found
 */
router.get("/details/:date", async (req, res) => {
  const { date } = req.params;
  try {
    const pulse = await prisma.pulse.findUnique({
      where: { date: new Date(date) },
    });
    if (!pulse) return res.status(404).json({ error: "Pulse not found" });
    res.json(pulse);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pulse details" });
  }
});

/**
 * @swagger
 * /api/pulse/trigger-check:
 *   post:
 *     summary: Manually trigger a pulse check
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Optional date to check (defaults to today)
 *     responses:
 *       200:
 *         description: Pulse check result
 */
router.post("/trigger-check", async (req, res) => {
  const { date } = req.body;
  try {
    const result = await pulseService.runDailyCheck(date ? new Date(date) : new Date());
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
