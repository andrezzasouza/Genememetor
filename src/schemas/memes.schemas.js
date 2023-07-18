import Joi from "joi";
import { stripHtml } from "string-strip-html";

export const newMemeSchema = Joi.object({
  description: Joi.string().min(5).max(200).required(),
  imageURL: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .uri({
      scheme: ["http", "https"],
    })
    .regex(/\.(jpg|jpeg|png|gif)$/i)
    .required(),
  category: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    // .valid(...categoryOptions.map((category) => category.name))
    .required(),
});

export const getMemesQuerySchema = Joi.object({
  username: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .min(3)
    .max(20),
  category: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .min(3)
    .max(50),
});

export const idSchema = Joi.object({ id: Joi.string().length(24).required() });
