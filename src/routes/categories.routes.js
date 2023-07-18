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
  validateSchema(categorySchema),
  createCategory
);
categoriesRouter.put("/categories/:id", editCategory);
categoriesRouter.delete("/categories/:id", deleteCategory);

export default categoriesRouter;
