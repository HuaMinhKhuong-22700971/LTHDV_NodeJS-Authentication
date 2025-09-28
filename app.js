import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";        // ✅ thêm

import { UserGetController, UserPostController } from "./controllers/controller.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "mySecretKey",
  resave: false,
  saveUninitialized: false
}));

// Thư mục chứa file tĩnh (ảnh nền cn.png)
app.use(express.static("public"));

// ✅ Cấu hình layout EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout");          // dùng layout.ejs làm layout mặc định
// Nếu layout.ejs nằm trong thư mục views (mặc định), không cần set thêm views dir

// Middleware global inject StudentID & Fullname
app.use((req, res, next) => {
  res.locals.studentId = "22700971";
  res.locals.fullname = "Hứa Minh Khương";
  next();
});

// Kết nối MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/cookieApp")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// Controllers
const getController = new UserGetController();
const postController = new UserPostController();

// Routes
app.get("/user/signup", getController.getSignUpPage);
app.get("/user/signin", getController.getSignInPage);
app.get("/user/homepage", getController.homePage);
app.get("/user/forgot-password", getController.getForgotPassword);
app.get("/user/change-password", getController.getChangePassword);
app.get("/user/logout", getController.logoutUser);

app.post("/user/signup", postController.createUser);
app.post("/user/signin", postController.signInUser);
app.post("/user/forgot-password", postController.forgotPassword);
app.post("/user/change-password", postController.changePassword);

// Default route
app.get("/", (req, res) => {
  res.redirect("/user/signin"); // tự động chuyển đến trang Sign In
});

// Start server
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
