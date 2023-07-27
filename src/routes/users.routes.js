import { Router } from "express";
import {
  getUserMemes,
  editIdUser,
  deleteIdUser,
} from "../controllers/users.controllers.js";
import { usernameSchema } from "../schemas/users.schemas.js";
import { validateAuth } from "../middleware/validateAuth.js";
import { validateSchema } from "../middleware/validateSchema.js";

const usersRouter = Router();

usersRouter.get(
  "/users/:username",
  validateSchema(usernameSchema, "params"),
  getUserMemes
);

usersRouter.put(
  "/users/:userId",
  validateAuth,
  validateSchema(usernameSchema, "params"),
  editIdUser
);

usersRouter.delete(
  "/users/:userId",
  validateAuth,
  validateSchema(usernameSchema, "params"),
  deleteIdUser
);

export default usersRouter;
