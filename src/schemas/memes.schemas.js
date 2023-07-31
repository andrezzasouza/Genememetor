import Joi from "joi";
import { stripHtml } from "string-strip-html";

export const newMemeSchema = Joi.object({
  description: Joi.string().min(5).max(200).required(),
  imageURL: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .uri({
      scheme: ["http", "https"],
    })
    .regex(/\.(jpg|jpeg|png|gif)/i)
    .required(),
  category: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
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

export const editMemeSchema = Joi.object({
  description: Joi.string().min(5).max(200).required(),
  category: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .required(),
});

export const idSchema = Joi.object({
  id: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .hex()
    .length(24)
    .required(),
});
