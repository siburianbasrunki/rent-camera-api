import express from "express";
import cors from "cors";
import brandRouter from "./routes/brand.router";
import cameraRouter from "./routes/camera.router";
import bannerRoute from "./routes/banner.router";
import authRouter from "./routes/auth.router";
import userRouter from "./routes/user.router";
import BookingRouter from "./routes/booking.router";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/booking", BookingRouter);
app.use("/brands", brandRouter);
app.use("/cameras", cameraRouter);
app.use("/banner", bannerRoute);
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Jangan pakai app.listen di serverless
// export handler untuk Vercel
export const handler = serverless(app);
