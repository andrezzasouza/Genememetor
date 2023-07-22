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
} from "../controllers/memes.controllers.js";
import {
  newMemeSchema,
  getMemesQuerySchema,
  idSchema,
} from "../schemas/memes.schemas.js";

const memesRouter = Router();

memesRouter.get("/memes", validateSchema(getMemesQuerySchema), getAllMemes);

memesRouter.post(
  "/memes",
  validateAuth,
  validateSchema(newMemeSchema),
  createMeme
);

memesRouter.get("/memes/random", getRandomMeme);
memesRouter.get("/memes/:memeId", validateSchema(idSchema), getIdMeme);

memesRouter.put(
  "/memes/:memeId",
  validateAuth,
  validateSchema(idSchema),
  editIdMeme
);

memesRouter.delete(
  "/memes/:memeId",
  validateAuth,
  validateSchema(idSchema),
  deleteIdMeme
);

export default memesRouter;
