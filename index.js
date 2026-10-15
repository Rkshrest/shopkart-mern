import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ success: true, message: "ShopKart API is running" });
});

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.warn("Primary MongoDB URI connection error:", err.message);
    console.warn("Attempting fallback to local / in-memory MongoDB server...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/shopkart", { serverSelectionTimeoutMS: 3000 });
      console.log("Connected to local MongoDB daemon successfully");
    } catch (localErr) {
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create({ binary: { version: "6.0.14" } });
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.warn("--------------------------------------------------");
        console.warn("⚠️  WARNING: Connected to temporary MongoMemoryServer!");
        console.warn("⚠️  Data will NOT persist across server restarts.");
        console.warn("⚠️  To persist data permanently, update MONGO_URI in .env with a valid MongoDB Atlas URI or start local MongoDB.");
        console.warn("--------------------------------------------------");
      } catch (memErr) {
        console.error("All MongoDB connection attempts failed:", memErr.message);
        process.exit(1);
      }
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use by an active server instance.`);
    } else {
      console.error("Server error:", err);
    }
  });
};

startServer();
