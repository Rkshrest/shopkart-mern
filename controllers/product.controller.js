import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, category, image, stock) are required",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than 0",
      });
    }

    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a number greater than or equal to 0",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numericStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating product",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (category && category.trim() !== "" && category !== "All") {
      query.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching product details",
    });
  }
};

export const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    const defaultProducts = [
      {
        name: "Mechanical Gaming Keyboard",
        description: "RGB backlit mechanical keyboard with tactile blue switches and aluminum frame.",
        price: 2499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        stock: 25,
      },
      {
        name: "Wireless Ergonomic Mouse",
        description: "Precision wireless mouse with adjustable DPI and silent click technology.",
        price: 1299,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
        stock: 40,
      },
      {
        name: "Noise Cancelling Headphones",
        description: "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        stock: 15,
      },
      {
        name: "Classic Denim Jacket",
        description: "Timeless indigo denim jacket crafted from 100% premium cotton.",
        price: 1999,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
        stock: 20,
      },
      {
        name: "Minimalist Leather Watch",
        description: "Sleek analog wristwatch featuring genuine leather strap and minimalist dial.",
        price: 3499,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        stock: 10,
      },
      {
        name: "The Art of Clean Code",
        description: "A comprehensive guide to software craftmanship, design patterns, and clean architecture.",
        price: 799,
        category: "Books",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        stock: 50,
      },
      {
        name: "Ceramic Coffee Pour-Over Kit",
        description: "Artisanal ceramic dripper set with heat-resistant glass carafe.",
        price: 1499,
        category: "Home",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        stock: 18,
      },
      {
        name: "Smart LED Desk Lamp",
        description: "Adjustable color temperature lamp with built-in wireless phone charger.",
        price: 1899,
        category: "Home",
        image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=600&q=80",
        stock: 30,
      },
    ];

    if (count === 0) {
      const seeded = await Product.insertMany(defaultProducts);
      return res.status(201).json({
        success: true,
        message: `Seeded ${seeded.length} sample products`,
        products: seeded,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Database already has ${count} products`,
    });
  } catch (error) {
    console.error("Seed products error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error seeding products",
    });
  }
};
