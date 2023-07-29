import { Router } from "express";
import {
  createCategory,
  getCategoriesList,
  editCategory,
  deleteCategory,
} from "../controllers/categories.controllers.js";
import { validateAuth } from "../middleware/validateAuth.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { categorySchema } from "../schemas/categories.schemas.js";
import { idSchema } from "../schemas/memes.schemas.js";

const categoriesRouter = Router();

categoriesRouter.get("/categories", getCategoriesList);

categoriesRouter.post(
  "/categories",
  validateAuth,
  validateSchema(categorySchema, "body"),
  createCategory
);

categoriesRouter.put(
  "/categories/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  validateSchema(categorySchema, "body"),
  editCategory
);

categoriesRouter.delete(
  "/categories/:id",
  validateAuth,
  validateSchema(idSchema, "params"),
  deleteCategory
);

export default categoriesRouter;
