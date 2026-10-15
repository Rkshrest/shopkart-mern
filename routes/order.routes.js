import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

export default router;
