import { Router } from "express";
import {
  getUserMemes,
  editIdUser,
  deleteIdUser,
  changeIdUserPassword,
} from "../controllers/users.controllers.js";
import { usernameSchema, newPasswordSchema } from "../schemas/users.schemas.js";
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
  "/users/:id/username",
  validateAuth,
  validateSchema(idSchema, "params"),
  validateSchema(usernameSchema),
  editIdUser
);

usersRouter.put(
  "/users/:id/password",
  validateAuth,
  validateSchema(idSchema, "params"),
  validateSchema(newPasswordSchema, "body"),
  changeIdUserPassword
);

usersRouter.delete(
  "/users/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  deleteIdUser
);

export default usersRouter;
