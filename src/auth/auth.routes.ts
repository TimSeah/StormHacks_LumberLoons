import { Router } from "express";
import { signup, signin } from "./auth.controller";

const router = Router();
// Authentication routes for endpoints, handlers in auth.controller.ts
// mounted in /api/auth

router.post("/signup", signup);
router.post("/signin", signin);

export default router;
