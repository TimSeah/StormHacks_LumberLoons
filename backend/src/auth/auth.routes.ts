import { Router } from "express";
import { signin, signup } from "./auth.controller";

const authRouter = Router();
// Authentication routes for endpoints, handlers in auth.controller.ts
// mounted in /api/auth

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

export default authRouter;
