import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const customer = req.user;
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    let newQuantity = 1;
    if (itemIndex > -1) {
      newQuantity = customer.cart[itemIndex].quantity + 1;
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more. Only ${product.stock} items available in stock.`,
      });
    }

    if (itemIndex > -1) {
      customer.cart[itemIndex].quantity = newQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "_id name price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating cart",
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const customer = await req.user.populate({
      path: "cart.product",
      select: "_id name price category image stock",
    });

    const cart = (customer.cart || []).filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching cart",
    });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number greater than or equal to 1",
      });
    }

    const customer = req.user;
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
      });
    }

    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock})`,
      });
    }

    customer.cart[itemIndex].quantity = numQuantity;
    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "_id name price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating cart item",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = req.user;
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    customer.cart.splice(itemIndex, 1);
    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "_id name price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error removing cart item",
    });
  }
};
