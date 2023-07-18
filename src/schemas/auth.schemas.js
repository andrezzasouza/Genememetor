import Joi from "joi";
import { stripHtml } from "string-strip-html";

export const signUpSchema = Joi.object({
  username: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .min(3)
    .max(20)
    .required(),
  email: Joi.string()
    .email()
    .custom((value) => stripHtml(value).result.trim())
    .required(),
  password: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .min(8)
    .max(50)
    .required(),
  confirmPassword: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .valid(Joi.ref("password"))
    .required(),
});

export const signInSchema = Joi.object({
  username: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .trim()
    .min(3)
    .max(20)
    .required(),
  password: Joi.string()
    .custom((value) => stripHtml(value).result.trim())
    .trim()
    .min(8)
    .max(50)
    .required(),
});
