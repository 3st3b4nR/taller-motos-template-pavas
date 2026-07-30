import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compressionMiddleware from "./src/common/middlewares/compression.middleware.js";
import cleanRequestData from "./src/common/middlewares/cleanRequestData.middleware.js";
import helmetMiddleware from "./src/common/middlewares/helmet.middleware.js";
import errorMiddleware from "./src/common/middlewares/error.middleware.js";
import mainRoutes from "./src/modules/main.routes.js";

dotenv.config();
const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(morgan("dev"));
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(helmetMiddleware);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compressionMiddleware);
app.use(cleanRequestData);
app.use("/api", mainRoutes);
app.use(errorMiddleware);

export { app };
