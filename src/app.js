import { stripHtml } from "string-strip-html";
import express, { json } from "express";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import cors from "cors";
import Joi from "joi";

const app = express();

app.use(cors());
app.use(json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
  await mongoClient.connect();
  console.log("MongoDB is up and running!");
} catch (err) {
  (err) => console.error(err.message);
}

const db = mongoClient.db();

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

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
});

app.get("/memes", async (req, res) => {
  const { category } = req.query;
  //filter by user
  //filter by category
});

app.post("/memes", async (req, res) => {
  const { description, image, category } = req.body;

  if (!description || !image || !category) {
    return res
      .status(422)
      .send("Invalid data! Please, correct it and try again.");
  }
});

app.put("/memes/:memeId", async (req, res) => {
  const { memeId } = req.params;
});

app.delete("/memes/:memeId", async (req, res) => {
  const { memeId } = req.params;
});

app.get("/memes/random", async (_req, res) => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`The server is up and running on port ${PORT}!`)
);
