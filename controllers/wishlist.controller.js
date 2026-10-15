import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
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

    const customer = req.user;
    const isWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product is already in wishlist",
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Added to wishlist successfully",
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating wishlist",
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const customer = await req.user.populate({
      path: "wishlist",
      select: "_id name price category image stock",
    });

    const wishlist = customer.wishlist || [];

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching wishlist",
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = req.user;
    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    customer.wishlist.splice(itemIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist successfully",
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating wishlist",
    });
  }
};
