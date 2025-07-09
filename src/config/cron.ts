import { checkAndSendBookingReminders } from "../controllers/booking.controller";
import cron from "node-cron";

export function setupCronJobs() {
  cron.schedule("0 * * * *", () => {
    console.log("Running booking reminder check...");
    checkAndSendBookingReminders();
  });
}
