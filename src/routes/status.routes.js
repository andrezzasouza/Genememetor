import { Router } from "express";

const statusRouter = Router();

statusRouter.get("/health", (_req, res) => {
  res.send("Genememetor is up and running!");
});

export default statusRouter;
