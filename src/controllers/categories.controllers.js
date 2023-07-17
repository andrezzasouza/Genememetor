import { db } from "../database/database.connection.js";
import { stripHtml } from "string-strip-html";
import Joi from "joi";

export async function getCategoriesList(_req, res) {
  try {
    const categories = await db.collection("categories").find().toArray();

    res.status(200).send(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function createCategory(req, res) {
  const { name } = req.body;
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .send(
        "You don't have permission to access this! Please, check your credentials and try again."
      );
  }

  try {
    const session = await db.collection("sessions").findOne({ token });

    if (!session) {
      return res
        .status(401)
        .send(
          "You don't have permission to access this! Please, check your credentials and try again."
        );
    }

    const adminUser = await db
      .collection("admins")
      .findOne({ userId: session.userId });

    if (!adminUser) {
      return res
        .status(403)
        .send(
          "You don't have the necessary access level to create new categories! Please, check your credentials and try again."
        );
    }

    if (!name) {
      return res
        .status(422)
        .send("Invalid body format! Please check the data and try again.");
    }

    const sanitizedBody = {
      name: stripHtml(name).result.trim(),
    };

    const categorySchema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
    });

    const validationResult = categorySchema.validate(sanitizedBody, {
      abortEarly: false,
    });

    if (validationResult.error) {
      const errors = validationResult.error.details.map(
        (error) => error.message
      );
      console.error(errors);
      return res.status(422).send(errors);
    }

    const { name: cleanName } = sanitizedBody;

    const existingCategory = await db
      .collection("categories")
      .findOne({ name: cleanName });

    if (existingCategory) {
      return res
        .status(409)
        .send(
          "This category already exists! Choose a new name and try again or take a look at the existing category."
        );
    }

    await db.collection("categories").insertOne({ name: cleanName });

    res
      .status(201)
      .send(`A new category has been created under the name ${cleanName}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editCategory(req, res) {}

export async function deleteCategory(req, res) {}
