import express from "express";
const router = express.Router();
import {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getTopProducts
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/")
    .get(getProducts)
    .post(protect, admin, createProduct);
router.route("/top")
    .get(getTopProducts);
router.route("/:id/reviews")
    .post(protect, createProductReview);
router.route("/:id")
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;