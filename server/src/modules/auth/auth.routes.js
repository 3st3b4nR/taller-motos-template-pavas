import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken, authorize } from "../../common/middlewares/authjwt.middleware.js";
import * as controller from "./auth.controller.js";

const authRoutes = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de acceso. Intenta de nuevo en 15 minutos." }
});

authRoutes.post("/login", loginLimiter, controller.login);
authRoutes.post("/logout", controller.logout);
authRoutes.get("/me", verifyToken, controller.me);
authRoutes.post("/register", verifyToken, authorize("ADMIN"), controller.register);
authRoutes.get("/users", verifyToken, authorize("ADMIN"), controller.listUsers);
authRoutes.patch("/users/:id", verifyToken, authorize("ADMIN"), controller.updateUser);

export default authRoutes;
