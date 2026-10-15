import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  seedProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.post("/seed", seedProducts);
router.get("/:id", getProductById);

export default router;
