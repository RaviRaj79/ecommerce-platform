import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DEFAULT_IMAGE = "/placeholder.svg";

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Product.updateMany(
      { $or: [{ image: { $exists: false } }, { image: "" }, { image: null }] },
      { $set: { image: DEFAULT_IMAGE } }
    );
    console.log(
      `Updated products: ${result.modifiedCount || result.nModified || 0}`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
