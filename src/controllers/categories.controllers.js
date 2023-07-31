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
    const existingName = await db.collection("categories").findOne({ name });

    if (existingName) {
      return res
        .status(409)
        .send(
          "The chosen name has already been used to name a category! Choose a new name and try again or take a look at the existing category."
        );
    }

    const newCategoryData = {
      name,
    };

    const updateCategory = await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(id) }, { $set: newCategoryData });

    if (updateCategory.matchedCount === 0) {
      return res
        .status(404)
        .send(
          "This category hasn't been found and can't be edited! Choose a new category id and try again."
        );
    }

    if (updateCategory.modifiedCount === 1 || updateMeme.matchedCount === 1) {
      return res
        .status(200)
        .send(`The category has been renamed and is now called ${name}.`);
    }

    if (updateCategory.modifiedCount === 0 || updateMeme.matchedCount === 1) {
      return res
        .status(200)
        .send(
          `The category has been updated, but no changes were made as the new category name is identical to the old name.`
        );
    }

    res
      .status(400)
      .send(`It wasn't possible to rename the category. Please, try again.`);
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
    const result = await db
      .collection("categories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1 && result.acknowledged) {
      return res
        .status(200)
        .send(`The category has been successfully deleted!`);
    }

    if (result.deletedCount === 0 && result.acknowledged) {
      return res
        .status(404)
        .send(
          "This category hasn't been found and couldn't be deleted! Choose a new category id and try again."
        );
    }

    res
      .status(400)
      .send(
        `It wasn't possible to delete the category named ${existingCategory.name}. Please, try again.`
      );
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}
