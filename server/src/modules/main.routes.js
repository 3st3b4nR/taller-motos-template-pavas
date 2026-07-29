import express from "express";
import authRoutes from "./auth/auth.routes.js";
import clientsRoutes from "./workshop/clients/clients.routes.js";
import bikesRoutes from "./workshop/bikes/bikes.routes.js";
import workOrdersRoutes from "./workshop/work-orders/work-orders.routes.js";

const mainRoutes = express.Router();
mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/clients", clientsRoutes);
mainRoutes.use("/bikes", bikesRoutes);
mainRoutes.use("/work-orders", workOrdersRoutes);
mainRoutes.get("/health", (_req, res) => res.json({ status: "ok" }));

export default mainRoutes;
