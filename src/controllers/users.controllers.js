import { db } from "../database/database.connection.js";
import { stripHtml } from "string-strip-html";
import Joi from "joi";

export async function getUserMemes(req, res) {
  const { username } = req.params;

  if (!username) return res.status(404).send("User not found!");

  const sanitizedUsername = stripHtml(username).result.trim();

  const usernameSchema = Joi.object({
    username: Joi.string().min(3).max(20),
  });

  const validationResult = usernameSchema.validate(
    { username: sanitizedUsername },
    {
      abortEarly: false,
    }
  );

  if (validationResult.error) {
    const errors = validationResult.error.details.map((error) => error.message);
    return res.status(422).send(errors);
  }

  try {
    const existingUsername = await db
      .collection("users")
      .findOne({ username: sanitizedUsername });

    if (!existingUsername) return res.status(404).send("User not found!");

    const userMemes = await db
      .collection("memes")
      .find({ userId: existingUsername._id })
      .toArray();

    res.status(200).send(userMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editIdUser(req, res) {
  const { id } = req.params;
}

export async function deleteIdUser(req, res) {
  const { id } = req.params;
}
