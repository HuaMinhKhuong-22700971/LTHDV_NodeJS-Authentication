import passport from "passport";
import express from "express";
import { GoogleSignInController } from "../controllers/authController.js";
import dotenv from "dotenv";

dotenv.config();

const authRouter = express.Router();
const googleSignIn = new GoogleSignInController();

// B1: Chuyển đến Google login
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// B2: Callback từ Google -> nếu thành công thì chuyển sang /auth/login/success
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed",
  })
);

// B3: Xử lý khi login thành công/thất bại
authRouter.get("/login/success", googleSignIn.signInSuccess);
authRouter.get("/login/failed", googleSignIn.signInFailed);

export default authRouter;
