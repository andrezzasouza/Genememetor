import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";

export async function createMeme(_req, res) {
  const {
    body: { description, imageURL, category },
    session,
  } = res.locals;

  try {
    const existingImage = await db
      .collection("memes")
      .findOne({ imageURL: imageURL });

    if (existingImage)
      return res
        .status(409)
        .send(
          `This meme has already been added. Please, accesses it using its id: ${existingImage._id}`
        );

    const categoryData = await db
      .collection("categories")
      .findOne({ name: category });

    if (!categoryData)
      return res
        .status(422)
        .send(
          `Invalid category name! Please, choose an existing category for your meme.`
        );

    const newMeme = await db.collection("memes").insertOne({
      description,
      imageURL,
      categoryId: categoryData._id,
      creatorId: session.userId,
    });

    res.status(201).send(newMeme.insertedId);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function getAllMemes(_req, res) {
  const { category, username } = res.locals.query;

  try {
    const creatorId = await db.collection("users").findOne({ username });
    const categoryId = await db
      .collection("categories")
      .findOne({ name: category });

    const filteredMemes = await db
      .collection("memes")
      .aggregate([
        {
          $match: {
            $and: [
              { creatorId: creatorId ? creatorId._id : { $exists: true } },
              { categoryId: categoryId ? categoryId._id : { $exists: true } },
            ],
          },
        },
      ])
      .toArray();

    res.status(200).send(filteredMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function getRandomMeme(_req, res) {
  try {
    const randomMeme = await db
      .collection("memes")
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();

    res.status(200).send(randomMeme[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function getIdMeme(_req, res) {
  const { id } = res.locals.params;

  try {
    const foundIdMeme = await db
      .collection("memes")
      .findOne({ _id: new ObjectId(id) });

    if (!foundIdMeme) {
      return res.status(404).send("Memes not found!");
    }

    res.status(200).send(foundIdMeme);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editIdMeme(req, res) {
  const { memeId } = req.params;
}

export async function deleteIdMeme(req, res) {
  const { memeId } = req.params;
}
