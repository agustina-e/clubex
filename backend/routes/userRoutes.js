import express from "express";
import {
    register,
    login,
    checkUsername,
    checkEmail
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-username", checkUsername);
router.get("/check-email", checkEmail);

export default router;
