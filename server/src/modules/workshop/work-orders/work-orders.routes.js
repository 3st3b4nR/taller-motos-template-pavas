import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import * as controller from "./work-orders.controller.js";

const router = express.Router();
router.use(verifyToken);
router.post("/", controller.create);
router.get("/", controller.list);
router.delete("/items/:itemId", controller.removeItem);
router.get("/:id", controller.getById);
router.patch("/:id/status", controller.updateStatus);
router.get("/:id/history", controller.history);
router.post("/:id/items", controller.addItem);
export default router;
