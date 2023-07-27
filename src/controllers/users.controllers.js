import { db } from "../database/database.connection.js";

export async function getUserMemes(_req, res) {
  const { username } = res.locals.params;

  try {
    const existingUsername = await db.collection("users").findOne({ username });

    if (!existingUsername) return res.status(404).send("User not found!");

    const userMemes = await db
      .collection("memes")
      .find({ creatorId: existingUsername._id })
      .toArray();

    res.status(200).send(userMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editIdUser(req, res) {
  const { userId } = req.params;
}

export async function deleteIdUser(req, res) {
  const { userId } = req.params;
}
