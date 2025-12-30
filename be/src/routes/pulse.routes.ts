import { Router } from "express";
import { prisma } from "../lib/prisma";
import { PulseService } from "../services/pulse.service";

const router = Router();
const pulseService = new PulseService();

// GET /api/pulse/history?start=YYYY-MM-DD&end=YYYY-MM-DD
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
      },
      orderBy: { date: "asc" },
    });
    res.json(pulses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pulse history" });
  }
});

// GET /api/pulse/metrics
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
      return { steady, distressed, percentage };
    };

    res.json({
      last7: calculateMetrics(sevenDayPulses),
      last30: calculateMetrics(thirtyDayPulses),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
});

// GET /api/pulse/details/:date
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

// POST /api/pulse/trigger-check (Manual trigger)
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
