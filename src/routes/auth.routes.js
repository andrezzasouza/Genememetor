import { Router } from "express";
import { signUp, logIn } from "../controllers/auth.controllers.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { signUpSchema, signInSchema } from "../schemas/auth.schemas.js";

const authRouter = Router();

authRouter.post("/signup", validateSchema(signUpSchema), signUp);
authRouter.post("/login", validateSchema(signInSchema), logIn);

export default authRouter;