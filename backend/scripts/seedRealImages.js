import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const IMAGES = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "https://images.unsplash.com/photo-1523475496153-3d6cc450b17c",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
];

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(process.env.MONGO_URI);

    const products = await Product.find({}).sort({ createdAt: 1 });
    if (!products.length) {
      console.log("No products found.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const updates = products.map((product, index) => {
      const image = IMAGES[index % IMAGES.length];
      product.image = image;
      return product.save();
    });

    await Promise.all(updates);
    console.log(`Updated products: ${products.length}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
