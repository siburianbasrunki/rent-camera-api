"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const brand_router_1 = __importDefault(require("./routes/brand.router"));
const camera_router_1 = __importDefault(require("./routes/camera.router"));
const banner_router_1 = __importDefault(require("./routes/banner.router"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const booking_router_1 = __importDefault(require("./routes/booking.router"));
const dotenv_1 = __importDefault(require("dotenv"));
const cron_1 = require("./config/cron");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/booking", booking_router_1.default);
app.use("/brands", brand_router_1.default);
app.use("/cameras", camera_router_1.default);
app.use("/banner", banner_router_1.default);
app.use("/auth", auth_router_1.default);
app.use("/users", user_router_1.default);
app.get("/ping", (req, res) => {
    res.json({ message: "pong" }).status(200);
});
(0, cron_1.setupCronJobs)();
app.listen(port, () => {
    console.log(`Server up and running on port: ${port}`);
});
//# sourceMappingURL=index.js.map