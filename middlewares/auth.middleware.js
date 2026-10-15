import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};
