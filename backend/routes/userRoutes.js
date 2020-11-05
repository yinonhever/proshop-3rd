import { Router } from "express";
const router = Router();
import {
    authUser,
    registerhUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUseById,
    updateUser
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/")
    .post(registerhUser)
    .get(protect, admin, getUsers);
router.post("/login", authUser);
router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.route("/:id")
    .get(protect, admin, getUseById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

export default router;