import { stripHtml } from "string-strip-html";
import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";
import Joi from "joi";

export async function createMeme (req, res) {
  const { description, imageURL, category } = req.body;
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

    if (!description || !imageURL || !category) {
      return res
        .status(422)
        .send("Invalid data! Please, correct it and try again.");
    }

    const sanitizedBody = {
      description: stripHtml(description).result.trim(),
      imageURL: stripHtml(imageURL).result.trim(),
      category: stripHtml(category).result.trim(),
    };

    const categoryOptions = await db.collection("categories").find().toArray();

    const NewMemeSchema = Joi.object({
      description: Joi.string().min(5).max(200).required(),
      imageURL: Joi.string()
        .uri({
          scheme: ["http", "https"],
        })
        .regex(/\.(jpg|jpeg|png|gif)$/i)
        .required(),
      category: Joi.string()
        .valid(...categoryOptions.map((category) => category.name))
        .required(),
    });

    const validationResult = NewMemeSchema.validate(sanitizedBody, {
      abortEarly: false,
    });

    if (validationResult.error) {
      const errors = validationResult.error.details.map(
        (error) => error.message
      );
      console.error(errors);
      return res.status(422).send(errors);
    }

    const {
      description: cleanDescription,
      imageURL: cleanImageURL,
      category: cleanCategory,
    } = sanitizedBody;

    const existingImage = await db
      .collection("memes")
      .findOne({ imageURL: cleanImageURL });

    if (existingImage) {
      return res
        .status(409)
        .send(
          `This meme has already been added. Please, accesses it using its id: ${existingImage._id}`
        );
    }

    const categoryData = await db
      .collection("categories")
      .findOne({ name: cleanCategory });

    const newMeme = await db.collection("memes").insertOne({
      description: cleanDescription,
      imageURL: cleanImageURL,
      categoryId: categoryData._id,
      creatorId: session.userId,
    });

    res.status(201).send(newMeme._id);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export async function getAllMemes (req, res) {
  const { category, username } = req.query;

  try {
    if (!category && !username) {
      const allMemes = await db.collection("memes").find().toArray();
      return res.status(200).send(allMemes);
    }

    const getMemesQuerySchema = Joi.object({
      username: Joi.string().min(3).max(20),
      category: Joi.string().min(3).max(50),
    });

    const validationResult = getMemesQuerySchema.validate(req.query, {
      abortEarly: false,
    });

    if (validationResult.error) {
      const errors = validationResult.error.details.map(
        (error) => error.message
      );
      return res.status(422).send(errors);
    }

    const sanitizedBody = {};

    if (category) sanitizedBody.category = stripHtml(category).result.trim();
    if (username) sanitizedBody.username = stripHtml(username).result.trim();

    const { username: cleanUsername, category: cleanCategory } = sanitizedBody;

    const creatorId = await db
      .collection("users")
      .findOne({ username: cleanUsername });

    const filteredMemes = await db
      .collection("memes")
      .find({ username: creatorId._id, category: cleanCategory })
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
  const { id } = req.params;

  if (!id) {
    return res.status(404).send("Memes not found!");
  }

  const sanitizedId = stripHtml(id).result.trim();

  const idSchema = Joi.object({ id: Joi.string().length(24).required() });

  const validId = idSchema.validate(
    { id: sanitizedId },
    {
      abortEarly: false,
    }
  );

  if (validId.error) {
    const errors = validationResult.error.details.map((error) => error.message);
    return res.status(422).send(errors);
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
