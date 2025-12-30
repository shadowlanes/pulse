import cron from "node-cron";
import { PulseService } from "../services/pulse.service";

const pulseService = new PulseService();

export const setupCronJobs = () => {
  // PRD: "a scheduled task running daily at 23:50 UTC"
  // Note: 23:50 UTC is "50 23 * * *"
  cron.schedule("50 23 * * *", async () => {
    console.log("Triggering scheduled Pulse-Check...");
    try {
      await pulseService.runDailyCheck();
    } catch (error) {
      console.error("Scheduled Pulse-Check failed:", error);
    }
  });

  console.log("Scheduled Pulse-Check job initialized (23:50 UTC daily)");
};
