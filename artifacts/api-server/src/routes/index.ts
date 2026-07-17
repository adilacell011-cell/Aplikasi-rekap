import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whatsappRouter from "./whatsapp";
import authRouter from "./auth";
import usersRouter from "./users";
import financeRouter from "./finance";
import backupRouter from "./backup";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whatsappRouter);
router.use("/auth", authRouter);
router.use("/users", requireAuth, usersRouter);
router.use(requireAuth, financeRouter);
router.use(requireAuth, backupRouter);

export default router;
