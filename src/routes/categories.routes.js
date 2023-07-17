import { Router } from "express";
import {
  createCategory,
  getCategoriesList,
  editCategory,
  deleteCategory,
} from "../controllers/categories.controllers.js";

const categoriesRouter = Router();

categoriesRouter.get("/categories", getCategoriesList);
categoriesRouter.post("/categories", createCategory);
categoriesRouter.put("/categories/:id", editCategory);
categoriesRouter.delete("/categories/:id", deleteCategory);

export default categoriesRouter;
