import Joi from "joi";
import { stripHtml } from "string-strip-html";

export const usernameSchema = Joi.object({
  username: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(3)
    .max(20)
    .required(),
});