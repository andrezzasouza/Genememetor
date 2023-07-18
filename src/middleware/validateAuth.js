import { db } from "../database/database.connection.js";

export async function validateAuth(req, res, next) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token)
    return res
      .status(401)
      .send(
        "You don't have permission to access this! Please, check your credentials and try again."
      );

  try {
    const session = await db.collection("sessao").findOne({ token });
    
    if (!session) {
      return res
        .status(401)
        .send(
          "You don't have permission to access this! Please, check your credentials and try again."
        );
    }

    res.locals.session = session;

    next();
  } catch (error) {}
}
