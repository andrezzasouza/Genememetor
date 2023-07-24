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
  validateSchema(categorySchema, "body"),
  editCategory
);

categoriesRouter.delete(
  "/categories/:id",
  validateAuth,
  validateSchema(categorySchema, "body"),
  deleteCategory
);

export default categoriesRouter;
