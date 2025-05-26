  import express from "express";
  import cors from "cors";
  import brandRouter from "./routes/brand.router";
  import cameraRouter from "./routes/camera.router";
  import bannerRoute from "./routes/banner.router";
  const app = express();
  const port = process.env.PORT || 8080;

  app.use(cors());
  app.use(express.json());

  app.use("/brands", brandRouter);
  app.use("/cameras", cameraRouter);
  app.use("/banner", bannerRoute);
  app.get("/ping", (req, res) => {
    res.json({ message: "pong" }).status(200);
  });

  app.listen(port, () => {
    console.log(`Server up and running on port: ${port}`);
  });
