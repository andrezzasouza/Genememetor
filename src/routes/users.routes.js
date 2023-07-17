import { Router } from "express";
import {
  getUserMemes,
  editIdUser,
  deleteIdUser,
} from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.get("/users/:username", getUserMemes);
usersRouter.put("/users/:userId", editIdUser);
usersRouter.delete("/users/:userId", deleteIdUser);

export default usersRouter;
