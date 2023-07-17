import { Router } from "express";
import { signUp, logIn } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", signUp)
authRouter.post("/login", logIn);

export default authRouter;