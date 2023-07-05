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

// body => username, email, password, confirmPassword
app.post("/user/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });

  const validationResult = signUpSchema.validate(req.body);

  if (validationResult.error) {
    const errors = validationResult.error.details.map((error) => error.message);
    console.error(errors);
    return res.status(422).send(errors);
  }

  try {
    const validName = await db.collection("users").findOne({ username });
    const validEmail = await db.collection("users").findOne({ email });

    if (validEmail || validName) {
      let warningMessage;

      if (validEmail && !validName) {
        warningMessage = "e-mail";
      }
      if (!validEmail && validName) {
        warningMessage = "username";
      }
      if (validEmail && validName) {
        warningMessage = "e-mail and username";
      }

      return res
        .status(409)
        .send(
          `Data already in use. Please, choose a different ${warningMessage} or log in.`
        );
    }

    await db.collection("users").insertOne({
      email,
      username,
      password,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/user/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .send("Invalid data! Please, correct it and try again.");
  }
});

app.put("/user/:id", (req, res) => {
  const { id } = req.params;
});

app.delete("/user/:id", (req, res) => {
  const { id } = req.params;
});

app.get("/memes", (req, res) => {
  const { username, category } = req.query;
  //filter by user
  //filter by category
});

app.post("/memes", (req, res) => {
  const { description, image, category } = req.body;

  if (!description || !image || !category) {
    return res
      .status(422)
      .send("Invalid data! Please, correct it and try again.");
  }
});

app.put("/memes/:memeId", (req, res) => {
  const { memeId } = req.params;
});

app.delete("/memes/:memeId", (req, res) => {
  const { memeId } = req.params;
});

app.get("/memes/random", (_req, res) => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`The server is up and running on port ${PORT}!`)
);
