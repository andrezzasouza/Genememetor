import { Router } from "express";
import {
  getUserMemes,
  editIdUser,
  deleteIdUser,
} from "../controllers/users.controllers.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { usernameSchema } from "../schemas/users.schemas.js";

const usersRouter = Router();

usersRouter.get(
  "/users/:username",
  validateSchema(usernameSchema, "params"),
  getUserMemes
);
usersRouter.put("/users/:userId", editIdUser);
usersRouter.delete("/users/:userId", deleteIdUser);

export default usersRouter;
