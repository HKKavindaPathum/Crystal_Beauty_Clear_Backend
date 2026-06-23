import Review from "../models/review.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "./userController.js";

export async function createReview(req, res) {

  if (req.user == null) {
      res.status(403).json({
          message: "Please login and try again",
      });
      return;
  }

  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating and comment
    if (rating < 1 || rating > 5) {
      res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
      return;
    }
    if (!comment || !comment.trim()) {
      res.status(400).json({ 
        message: "Comment cannot be empty" 
      });
      return;
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      res.status(404).json({
        message: "Product not found" 
      });
      return;
    }

    const hasBought = await Order.findOne({
      email: req.user.email,
      "products.productInfo.productId": productId,
      status: { $in: ["delivered", "completed"] },
    });

    if (!hasBought) {
      res.status(403).json({
        message: "You must purchase this product before reviewing",
      });
      return;
    }

    const alreadyReviewed = await Review.findOne({
      productId,
      email: req.user.email,
    });

    if (alreadyReviewed) {
      res.status(400).json({ 
        message: "You have already reviewed this product" 
      });
      return;
    }

    const review = new Review({
      reviewId: uuidv4(),// generate unique ID
      productId,
      email:req.user.email,
      rating: Number(rating),
      comment: comment?.trim(),
    });

    const createdReview = await review.save();

    res.status(201).json({
      message: "Review submitted successfully"
    });
  } catch (e) {
    console.error("Failed to create review:", e);
    res.status(500).json({
      message: "Failed to create review",
      error: e,
    });
  }
}

export async function getProductReviews(req, res) {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId }).sort({ date: -1 });// sorted by newest first
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
}

export async function getAllReviews(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
}

export async function deleteReview(req, res) {
  const { reviewId } = req.params;
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const deleted = await Review.findOneAndDelete({ reviewId });
    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Failed to delete review:", err);
    res.status(500).json({
      message: "Failed to delete review",
      error: err.message,
    });
  }
}

