import { db } from "../database/database.connection.js";

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
  const { session, data: {name}  } = res.locals;

  try {
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

export async function editCategory(req, res) {}

export async function deleteCategory(req, res) {}
