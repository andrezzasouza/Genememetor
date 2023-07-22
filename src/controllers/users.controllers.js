import { db } from "../database/database.connection.js";

export async function getUserMemes(_req, res) {
  const { username } = res.locals.data;

  if (!username) return res.status(404).send("User not found!");

  try {
    const existingUsername = await db
      .collection("users")
      .findOne({ username });

    if (!existingUsername) return res.status(404).send("User not found!");

    const userMemes = await db
      .collection("memes")
      .find({ userId: existingUsername._id })
      .toArray();

    res.status(200).send(userMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editIdUser(req, res) {
  const { id } = req.params;
}

export async function deleteIdUser(req, res) {
  const { id } = req.params;
}
