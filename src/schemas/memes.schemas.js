import Joi from "joi";
import { stripHtml } from "string-strip-html";
import { db } from "../database/database.connection.js";

async function getCategories() {
  try {
    const categoryOptions = await db.collection("categories").find().toArray();
    return categoryOptions;
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export const newMemeSchema = Joi.object({
  description: Joi.string().min(5).max(200).required(),
  imageURL: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .uri({
      scheme: ["http", "https"],
    })
    .regex(/\.(jpg|jpeg|png|gif)$/i)
    .required(),
  category: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .custom(async (value, helpers) => {
      const categories = await getCategories();
      const isValidCategory = categories.some(
        (category) => category.name === value
      );
      if (!isValidCategory) return helpers.message("Invalid category!");
      return value;
    })
    .required(),
});

export const getMemesQuerySchema = Joi.object({
  username: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(3)
    .max(20),
  category: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(3)
    .max(50),
});

export const idSchema = Joi.object({
  id: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .length(24)
    .required(),
});
