import { db } from "../database/database.connection.js";
import bcrypt from "bcrypt";

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
  const { id } = req.params;
}

export async function changeIdUserPassword(_req, res) {
  const {
    body: { oldPassword, newPassword },
    params: { id },
    session,
  } = res.locals;

  try {
    if (String(session.userId) !== id) {
      return res
        .status(403)
        .send(
          "You don't have authorization to alter this password! Please, check your credentials and try again."
        );
    }

    const userData = await db
      .collection("users")
      .findOne({ _id: session.userId });

    const checkedPassword = bcrypt.compareSync(oldPassword, userData.password);

    if (!checkedPassword)
      return res
        .status(403)
        .send("The old password is incorrect! Please, check and try again.");

    const newHashedPassword = bcrypt.hashSync(newPassword, 10);

    const updatePassword = await db
      .collection("users")
      .updateOne(
        { _id: session.userId },
        { $set: { password: newHashedPassword } }
      );

    if (
      updatePassword.modifiedCount === 1 &&
      updatePassword.matchedCount === 1
    ) {
      return res
        .status(200)
        .send(`The password has been updated successfully!`);
    }

    if (
      updatePassword.modifiedCount === 0 &&
      updatePassword.matchedCount === 1
    ) {
      return res
        .status(200)
        .send(
          `The password has been updated, but no changes were made as the new password is identical to the old password.`
        );
    }

    res
      .status(400)
      .send(`It wasn't possible to update the password. Please, try again.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function deleteIdUser(req, res) {
  const { id } = req.params;
}
