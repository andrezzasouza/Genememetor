import { db } from "../database/database.connection.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export async function signUp (_req, res) {
  const { username, email, password } = res.locals.data;

  try {
    const validData = await db.collection("users").findOne({ $or: [{ username }, { email }]});

    if (validData) {
      return res
        .status(409)
        .send(
          `Data already in use. Please, choose a different e-mail or username. Alternatively, log in.`
        );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.collection("users").insertOne({
      email,
      username,
      password: hashedPassword,
    });

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export async function logIn (_req, res) {
  const { username, password } = res.locals.data;

  try {
    const userData = await db
      .collection("users")
      .findOne({ username });

    if (!userData)
      return res
        .status(404)
        .send("User not found! Please check and try again.");

    const checkedPassword = bcrypt.compareSync(
      password,
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