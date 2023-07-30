import Joi from "joi";
import { stripHtml } from "string-strip-html";

export const usernameSchema = Joi.object({
  username: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(3)
    .max(20)
    .required(),
});

export const newPasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(8)
    .max(50)
    .required(),
  newPassword: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(8)
    .max(50)
    .required(),
  repeatNewPassword: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .valid(Joi.ref("password"))
    .required(),
});
