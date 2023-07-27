import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";

export async function getCategoriesList(_req, res) {
  try {
    const categories = await db.collection("categories").find().toArray();

    res.status(200).send(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function createCategory(_req, res) {
  const {
    session,
    body: { name },
  } = res.locals;

  try {
    const adminUser = await db
      .collection("admins")
      .findOne({ userId: new ObjectId(session.userId) });

    if (!adminUser) {
      return res
        .status(403)
        .send(
          "You don't have the necessary access level to create new categories! Please, check your credentials and try again."
        );
    }

    const existingCategory = await db
      .collection("categories")
      .findOne({ name });

    if (existingCategory) {
      return res
        .status(409)
        .send(
          "This category already exists! Choose a new name and try again or take a look at the existing category."
        );
    }

    await db.collection("categories").insertOne({ name });

    res
      .status(201)
      .send(`A new category has been created under the name ${name}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editCategory(_req, res) {
  const {
    session,
    params: { id },
    body: { name },
  } = res.locals;

  try {
    const adminUser = await db
      .collection("admins")
      .findOne({ userId: new ObjectId(session.userId) });

    if (!adminUser) {
      return res
        .status(403)
        .send(
          "You don't have the necessary access level to create new categories! Please, check your credentials and try again."
        );
    }

    const existingCategory = await db
      .collection("categories")
      .findOne({ name });

    if (existingCategory) {
      return res
        .status(409)
        .send(
          "This category already exists! Choose a new name and try again or take a look at the existing category."
        );
    }

    await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(id) }, { $set: name });

    res
      .status(200)
      .send(`The category has been renamed and is now called ${name}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function deleteCategory(req, res) {}
