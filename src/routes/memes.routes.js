import { validateAuth } from "../middleware/validateAuth.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { Router } from "express";
import {
  getAllMemes,
  getRandomMeme,
  createMeme,
  editIdMeme,
  deleteIdMeme,
  getIdMeme,
  voteIdMeme
} from "../controllers/memes.controllers.js";
import {
  newMemeSchema,
  getMemesQuerySchema,
  editMemeSchema,
  idSchema,
} from "../schemas/memes.schemas.js";

const memesRouter = Router();

memesRouter.get(
  "/memes",
  validateSchema(getMemesQuerySchema, "query"),
  getAllMemes
);

memesRouter.get("/memes/random", getRandomMeme);

memesRouter.get("/memes/:id", validateSchema(idSchema, "params"), getIdMeme);

memesRouter.post(
  "/memes",
  validateAuth,
  validateSchema(newMemeSchema, "body"),
  createMeme
);

memesRouter.post(
  "/memes/:id/up",
  validateAuth,
  validateSchema(idSchema, "params"),
  voteIdMeme
);

memesRouter.post(
  "/memes/:id/down",
  validateAuth,
  validateSchema(idSchema, "params"),
  voteIdMeme
);

memesRouter.put(
  "/memes/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  validateSchema(editMemeSchema, "body"),
  editIdMeme
);

memesRouter.delete(
  "/memes/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  deleteIdMeme
);

export default memesRouter;
