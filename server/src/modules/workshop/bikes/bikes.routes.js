import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import * as controller from "./bikes.controller.js";

const router = express.Router();
router.use(verifyToken);
router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
export default router;
