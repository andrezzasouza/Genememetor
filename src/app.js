import { stripHtml } from "string-strip-html";
import { db } from "./database/database.connection.js";
import express, { json } from "express";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import cors from "cors";
import Joi from "joi";

const app = express();

app.use(cors());
app.use(json());

app.get("/health", (_req, res) => {
  res.send("Genememetor is up and running!");
});

app.post("/signup", async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;

  if (!username || !password || !confirmPassword || !email) {
    return res
      .status(422)
      .send("Invalid body format! Please check the data and try again.");
  }

  const sanitizedBody = {
    username: stripHtml(username).result.trim(),
    email: stripHtml(email).result.trim(),
    password: stripHtml(password).result.trim(),
    confirmPassword: stripHtml(confirmPassword).result.trim(),
  };

  const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });

  const validationResult = signUpSchema.validate(sanitizedBody, {
    abortEarly: false,
  });

  if (validationResult.error) {
    const errors = validationResult.error.details.map((error) => error.message);
    console.error(errors);
    return res.status(422).send(errors);
  }

  const {
    email: cleanEmail,
    password: cleanPassword,
    username: cleanUsername,
  } = sanitizedBody;

  try {
    const validName = await db.collection("users").findOne({ cleanUsername });
    const validEmail = await db.collection("users").findOne({ cleanEmail });

    if (validEmail || validName) {
      const warningMessage =
        (validEmail ? "e-mail" : "") +
        (validEmail && validName ? " and " : "") +
        (validName ? "username" : "");

      return res
        .status(409)
        .send(
          `Data already in use. Please, choose a different ${warningMessage} or log in.`
        );
    }

    const hashedPassword = bcrypt.hashSync(cleanPassword, 10);

    delete req.password;
    delete req.confirmPassword;

    await db.collection("users").insertOne({
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(422)
      .send("Invalid body format! Please check the data and try again.");
  }

  const sanitizedBody = {
    username: stripHtml(username).result.trim(),
    password: stripHtml(password).result.trim(),
  };

  const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(8).max(50).required(),
  });

  const validationResult = signUpSchema.validate(sanitizedBody, {
    abortEarly: false,
  });

  if (validationResult.error) {
    const errors = validationResult.error.details.map((error) => error.message);
    console.error(errors);
    return res.status(422).send(errors);
  }

  const { password: cleanPassword, username: cleanUsername } = sanitizedBody;

  try {
    const userData = await db
      .collection("users")
      .findOne({ username: cleanUsername });

    if (!userData)
      return res
        .status(404)
        .send("User not found! Please check and try again.");

    const checkedPassword = bcrypt.compareSync(
      cleanPassword,
      userData.password
    );

    if (!checkedPassword)
      return res
        .status(401)
        .send(
          "Username and password combination is incorrect! Please, check and try again."
        );

    const token = uuid();
    await db.collection("sessions").insertOne({ userId: userData._id, token });

    res.send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/memes", async (req, res) => {
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
});

app.get("/memes", async (req, res) => {
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
});

app.get("/user/:username", async (req, res) => {
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
      .find({ userId: existingUsername._id });

    res.status(200).send(userMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/memes/random", async (_req, res) => {
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
});

app.get("/memes/:id", async (req, res) => {
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
});

app.put("/memes/:memeId", async (req, res) => {
  const { memeId } = req.params;
});

app.delete("/memes/:memeId", async (req, res) => {
  const { memeId } = req.params;
});

app.get("/categories", async (_req, res) => {
  try {
    const categories = await db.collection("categories").find().toArray();

    res.status(200).send(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/categories", async (req, res) => {
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
});
app.put("/categories/:id", async (req, res) => {});
app.delete("/categories/:id", async (req, res) => {});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
});
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`The server is up and running on port ${PORT}!`)
);
