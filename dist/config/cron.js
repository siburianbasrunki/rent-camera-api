"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCronJobs = setupCronJobs;
const booking_controller_1 = require("../controllers/booking.controller");
const node_cron_1 = __importDefault(require("node-cron"));
function setupCronJobs() {
    node_cron_1.default.schedule("0 * * * *", () => {
        console.log("Running booking reminder check...");
        (0, booking_controller_1.checkAndSendBookingReminders)();
    });
}
//# sourceMappingURL=cron.js.map