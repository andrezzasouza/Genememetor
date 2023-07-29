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
    body: { name },
  } = res.locals;

  try {
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
    params: { id },
    body: { name },
  } = res.locals;

  try {
    const existingCategory = await db
      .collection("categories")
      .findOne({ name });

    if (existingCategory) {
      return res
        .status(409)
        .send(
          "The chosen name has already been used to name a category! Choose a new name and try again or take a look at the existing category."
        );
    }

    const newCategoryData = {
      _id: new ObjectId(id),
      name,
    };

    const result = await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(id) }, { $set: newCategoryData });

    if (result.modifiedCount === 1) {
      return res
        .status(200)
        .send(`The category has been renamed and is now called ${name}.`);
    }

    res
      .status(502)
      .send(
        `It wasn't possible to rename the category. Please, try again.`
      );
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function deleteCategory(_req, res) {
  const {
    params: { id },
  } = res.locals;

  try {
    const existingCategory = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });

    if (!existingCategory) {
      return res
        .status(404)
        .send(
          "This category hasn't been found and can't be deleted! Choose a new category id and try again."
        );
    }

    const result = await db
      .collection("categories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return res
        .status(200)
        .send(
          `The "${existingCategory.name}" category has been successfully deleted.`
        );
    }

    res
      .status(502)
      .send(
        `It wasn't possible to delete the category named ${existingCategory.name}. Please, try again.`
      );
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}
