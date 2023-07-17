import { db } from "../database/database.connection.js";
import { stripHtml } from "string-strip-html";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import Joi from "joi";

export async function signUp (req, res) {
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
    const validName = await db.collection("users").findOne({ username: cleanUsername });
    const validEmail = await db.collection("users").findOne({ email: cleanEmail });

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
};

export async function logIn (req, res) {
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
};