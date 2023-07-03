import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => `The server is up and running on port ${PORT}!`);
