import { Router } from "express";
import {
  getUserMemes,
  editIdUser,
  deleteIdUser,
} from "../controllers/users.controllers.js";
import { usernameSchema } from "../schemas/users.schemas.js";
import { validateAuth } from "../middleware/validateAuth.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { idSchema } from "../schemas/memes.schemas.js";

const usersRouter = Router();

usersRouter.get(
  "/users/:username",
  validateSchema(usernameSchema, "params"),
  getUserMemes
);

usersRouter.put(
  "/users/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  editIdUser
);

usersRouter.delete(
  "/users/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  deleteIdUser
);

export default usersRouter;
