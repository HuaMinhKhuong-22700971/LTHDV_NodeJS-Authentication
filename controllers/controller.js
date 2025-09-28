import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { transporter } from "../config/nodemailerConfig.js";
import dotenv from "dotenv";

dotenv.config();

export class UserGetController {
  getSignUpPage = (req, res) => {
    res.render("signup", { message: "" });
  };

  getSignInPage = (req, res) => {
    res.render("signin", { message: "" });
  };

  homePage = (req, res) => {
    if (!req.session.user) {
      return res.status(404).render("signin", { message: "Please sign in to view the homepage" });
    }
    res.render("homepage", { user: req.session.user });
  };

  getForgotPassword = (req, res) => {
    res.render("forgot-password", { message: "" });
  };

  getChangePassword = (req, res) => {
    if (!req.session.user) {
      return res.status(404).render("signin", { message: "Please sign in to change the password" });
    }
    res.render("change-password", { message: "" });
  };

  logoutUser = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error signing out:", err);
        res.status(500).send("Error signing out");
      } else {
        res.status(201).render("signin", { message: "User logout" });
      }
    });
  };
}

export class UserPostController {
  // Sign up
  createUser = async (req, res) => {
    const { username, email, password, cpassword } = req.body;
    if (password !== cpassword) {
      return res.status(400).render("signup", { message: "Passwords don't match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("signup", { message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    try {
      await newUser.save();
      res.status(201).render("signin", { message: "User created successfully" });
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  };

  // Sign in
  signInUser = async (req, res) => {
    const { email, password } = req.body;
    //const recaptcha = req.body["g-recaptcha-response"];

    //if (!recaptcha) {
      //return res.status(404).render("signin", { message: "Please select captcha" });
    //}

    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).render("signin", { message: "User doesn't exist" });
      }

      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordCorrect) {
        return res.status(400).render("signin", { message: "Invalid credentials || Incorrect Password" });
      }

      req.session.user = {
        username: existingUser.username,
        email: existingUser.email
      };

      res.redirect("/user/homepage");
    } catch (error) {
      res.status(500).render("signin", { message: error.message });
    }
  };

  // Forgot password (Fake email)
forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res
          .status(404)
          .render("forgot-password", { message: "User doesn't exist" });
      }
  
      // Tạo mật khẩu mới
      const newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Fake gửi mail: chỉ log ra console
      console.log(`📩 New password for ${email}: ${newPassword}`);
  
      // Lưu mật khẩu mới vào DB
      existingUser.password = hashedPassword;
      await existingUser.save();
  
      // Trả về giao diện Sign In kèm thông báo
      return res
        .status(201)
        .render("signin", { message: "New Password sent to your email" });
    } catch (error) {
      return res
        .status(500)
        .render("forgot-password", { message: error.message });
    }
  };
  
  // Change password
changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
      if (!req.session.user) {
        return res.render("signin", { message: "Please sign in to change the password" });
      }
  
      if (newPassword !== confirmPassword) {
        return res.render("change-password", { message: "New passwords do not match" });
      }
  
      const user = await User.findOne({ email: req.session.user.email });
      if (!user) {
        return res.status(404).render("change-password", { message: "User doesn't exist" });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.render("change-password", { message: "Old password is incorrect" });
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      // Xóa session để đăng nhập lại
      req.session.destroy(() => {
        res.render("signin", { message: "Password changed successfully, please sign in again" });
      });
    } catch (error) {
      res.render("change-password", { message: error.message });
    }
  };

  
}
