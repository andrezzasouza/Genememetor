import { Router } from "express";
import statusRoute from "./status.routes.js";
import authRoute from "./auth.routes.js";
import categoriesRoute from "./categories.routes.js";
import memesRoute from "./memes.routes.js";
import usersRoute from "./users.routes.js";

const router = Router();

router.use(statusRoute);
router.use(authRoute);
router.use(categoriesRoute);
router.use(memesRoute);
router.use(usersRoute);

export default router;
