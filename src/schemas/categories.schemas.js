import Joi from "joi";
import { stripHtml } from "string-strip-html";

export const categorySchema = Joi.object({
  name: Joi.string()
    .custom((value) => stripHtml(value).result.trim().replace(" ", ""))
    .min(3)
    .max(50)
    .required(),
});
