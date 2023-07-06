import { stripHtml } from "string-strip-html";
import express, { json } from "express";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v4 } from "uuid";
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

  if (!req.body.username || !req.body.password || !req.body.confirmPassword || !req.body.email) {
    return res.status(422).send("Invalid body format! Please check the data and try again.");
  }

  const sanitizedBody = {
    username: stripHtml(req.body.username).result.trim(),
    email: stripHtml(req.body.email).result.trim(),
    password: stripHtml(req.body.password).result.trim(),
    confirmPassword: stripHtml(req.body.confirmPassword).result.trim(),
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

  const { email, password, username } = sanitizedBody;

  try {
    const validName = await db.collection("users").findOne({ username });
    const validEmail = await db.collection("users").findOne({ email });

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

    const hashedPassword = bcrypt.hashSync(password, 10);

    delete req.body.password;
    delete req.body.confirmPassword;

    await db.collection("users").insertOne({
      email,
      username,
      hashedPassword,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .send("Invalid data! Please, correct it and try again.");
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
});

app.get("/memes", async (req, res) => {
  const { username, category } = req.query;
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
