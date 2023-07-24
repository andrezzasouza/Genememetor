import { Router } from "express";
import { signUp, logIn } from "../controllers/auth.controllers.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { signUpSchema, signInSchema } from "../schemas/auth.schemas.js";

const authRouter = Router();

authRouter.post("/signup", validateSchema(signUpSchema, "body"), signUp);
authRouter.post("/login", validateSchema(signInSchema, "body"), logIn);

export default authRouter;
