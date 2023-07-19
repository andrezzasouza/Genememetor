import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";

export async function createMeme (_req, res) {
  const { description, imageURL, category } = res.locals.data

  try {
    const existingImage = await db
      .collection("memes")
      .findOne({ imageURL: imageURL });

    if (existingImage) {
      return res
        .status(409)
        .send(
          `This meme has already been added. Please, accesses it using its id: ${existingImage._id}`
        );
    }

    const categoryData = await db
      .collection("categories")
      .findOne({ name: category });

    const newMeme = await db.collection("memes").insertOne({
      description,
      imageURL,
      categoryId: categoryData._id,
      creatorId: session.userId,
    });

    res.status(201).send(newMeme._id);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export async function getAllMemes (_req, res) {
  const { category, username } = res.locals.data;

  try {
    if (!category && !username) {
      const allMemes = await db.collection("memes").find().toArray();
      return res.status(200).send(allMemes);
    }

    const creatorId = await db
      .collection("users")
      .findOne({ username });

    const filteredMemes = await db
      .collection("memes")
      .find({ username: creatorId._id, category: category })
      .toArray();

    res.status(200).send(filteredMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export async function getRandomMeme (_req, res) {
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
};

export async function getIdMeme (req, res) {
  const { id } = res.locals.data;

  if (!id) {
    return res.status(404).send("Memes not found!");
  }

  try {
    const idMeme = await db
      .collection("memes")
      .findOne({ _id: new ObjectId(sanitizedId) });

    res.status(200).send(idMeme);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export async function editIdMeme (req, res) {
  const { memeId } = req.params;
};

export async function deleteIdMeme (req, res) {
  const { memeId } = req.params;
};
