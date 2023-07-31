import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";

export async function createMeme(_req, res) {
  const {
    body: { description, imageURL, category },
    session,
  } = res.locals;

  try {
    const existingImage = await db
      .collection("memes")
      .findOne({ imageURL: imageURL });

    if (existingImage)
      return res
        .status(409)
        .send(
          `This meme has already been added. Please, accesses it using its id: ${existingImage._id}`
        );

    const categoryData = await db
      .collection("categories")
      .findOne({ name: category });

    if (!categoryData)
      return res
        .status(422)
        .send(
          `Invalid category name! Please, choose an existing category for your meme.`
        );

    const newMeme = await db.collection("memes").insertOne({
      description,
      imageURL,
      categoryId: categoryData._id,
      creatorId: session.userId,
    });

    res.status(201).send(newMeme.insertedId);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function getAllMemes(_req, res) {
  const { category, username } = res.locals.query;

  try {
    const creatorId = await db.collection("users").findOne({ username });
    const categoryId = await db
      .collection("categories")
      .findOne({ name: category });

    const filteredMemes = await db
      .collection("memes")
      .aggregate([
        {
          $match: {
            $and: [
              { creatorId: creatorId ? creatorId._id : { $exists: true } },
              { categoryId: categoryId ? categoryId._id : { $exists: true } },
            ],
          },
        },
      ])
      .toArray();

    res.status(200).send(filteredMemes);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function getRandomMeme(_req, res) {
  try {
    const randomMeme = await db
      .collection("memes")
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();

    res.status(200).send(randomMeme[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function getIdMeme(_req, res) {
  const { id } = res.locals.params;

  try {
    const foundIdMeme = await db
      .collection("memes")
      .findOne({ _id: new ObjectId(id) });

    if (!foundIdMeme) {
      return res
        .status(404)
        .send(
          "This meme hasn't been found! Choose another meme id and try again."
        );
    }

    res.status(200).send(foundIdMeme);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function editIdMeme(_req, res) {
  const {
    params: { id },
    session,
    body: { description, category },
  } = res.locals;

  try {
    const existingMeme = await db
      .collection("memes")
      .findOne({ _id: new ObjectId(id) });

    if (!existingMeme) {
      return res
        .status(404)
        .send(
          "This meme hasn't been found and can't be edited! Choose another meme id and try again."
        );
    }

    const adminUser = await db
      .collection("admins")
      .findOne({ userId: new ObjectId(session.userId) });

    if (!existingMeme.creatorId === session.userId || !adminUser) {
      return res
        .status(403)
        .send(
          "You don't own this or you don't have the necessary access level to edit it! Please, check your credentials and try again."
        );
    }

    const categoryData = await db
      .collection("categories")
      .findOne({ name: category });

    if (!categoryData) {
      return res
        .status(422)
        .send(
          `Invalid category name! Please, choose an existing category for your meme.`
        );
    }

    const newMemeData = {
      description,
      categoryId: categoryData._id,
    };

    const updateMeme = await db
      .collection("memes")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: newMemeData },
        { $multi: true }
      );

    if (updateMeme.modifiedCount === 1 && updateMeme.matchedCount === 1) {
      return res
        .status(200)
        .send(
          `The meme has been updated successfully! Its description and/or category had been changed.`
        );
    }

    if (updateMeme.modifiedCount === 0 && updateMeme.matchedCount === 1) {
      return res
        .status(200)
        .send(
          `The meme has been updated, but no changes were made as the new description and category are identical to the old description and category.`
        );
    }

    res
      .status(400)
      .send(`It wasn't possible to update the meme. Please, try again.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function deleteIdMeme(_req, res) {
  const {
    params: { id },
    session,
  } = res.locals;

  try {
    const existingMeme = await db
      .collection("memes")
      .findOne({ _id: new ObjectId(id) });

    if (!existingMeme) {
      return res
        .status(404)
        .send(
          "This meme hasn't been found and couldn't be deleted! Choose another meme id and try again."
        );
    }

    const adminUser = await db
      .collection("admins")
      .findOne({ userId: new ObjectId(session.userId) });

    if (!existingMeme.creatorId === session.userId || !adminUser) {
      return res
        .status(403)
        .send(
          "You don't own this meme or you don't have the necessary access level to delete it! Please, check your credentials and try again."
        );
    }

    const result = await db
      .collection("memes")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      return res
        .status(200)
        .send(
          `The "${existingCategory.name}" meme has been successfully deleted.`
        );
    }

    res
      .status(400)
      .send(
        `It wasn't possible to delete the meme named ${existingCategory.name}. Please, try again.`
      );
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

export async function voteIdMeme(req, res) {
  const splitString = req.route.path.split("/");
  const voteType = splitString[splitString.length - 1];

  const {
    params: { id },
    session,
  } = res.locals;

  try {
    const existingMeme = await db
      .collection("memes")
      .findOne({ _id: new ObjectId(id) });

    if (!existingMeme) {
      return res
        .status(404)
        .send(
          "This meme hasn't been found! Choose another meme id and try again."
        );
    }

    const vote = {
      memeId: new ObjectId(id),
      voterId: new ObjectId(session.userId),
      voteType,
    };

    await db.collection("votes").insertOne(vote);

    let voteInserted = "Your vote has been added!";

    const downVotesCount = await db
      .collection("votes")
      .countDocuments({ memeId: new ObjectId(id), voteType: "down" });

    if (downVotesCount >= 50) {
      await db.collection("memes").deleteOne({ _id: new ObjectId(id) });
      await db.collection("votes").deleteMany({ memeId: new ObjectId(id) });
      voteInserted +=
        " This meme has exceeded the maximum number of down votes and has been deleted.";
    }

    res.status(201).send(voteInserted);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}
