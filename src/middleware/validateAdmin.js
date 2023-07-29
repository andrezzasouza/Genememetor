import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";

export async function validateAdmin(_req, res, next) {
  const { session } = res.locals;

  try {
    const adminUser = await db
      .collection("admins")
      .findOne({ userId: new ObjectId(session.userId) });

    if (!adminUser) {
      return res
        .status(403)
        .send(
          "You don't have the necessary access level to create new categories! Please, check your credentials and try again."
        );
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}
