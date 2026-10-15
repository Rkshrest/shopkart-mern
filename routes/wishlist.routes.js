import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/:productId", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
