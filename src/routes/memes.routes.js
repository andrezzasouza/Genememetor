import { Router } from "express";
import {
  getAllMemes,
  getRandomMeme,
  createMeme,
  editIdMeme,
  deleteIdMeme,
  getIdMeme,
} from "../controllers/memes.controllers.js";

const memesRouter = Router();

memesRouter.get("/memes", getAllMemes);
memesRouter.post("/memes", createMeme);
memesRouter.get("/memes/random", getRandomMeme);
memesRouter.get("/memes/:memeId", getIdMeme);
memesRouter.put("/memes/:memeId", editIdMeme);
memesRouter.delete("/memes/:memeId", deleteIdMeme);

export default memesRouter;
