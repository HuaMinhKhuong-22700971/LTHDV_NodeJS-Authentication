import User from "../models/userModel.js";

export class GoogleSignInController {
  // Xử lý đăng nhập thành công
  signInSuccess = async (req, res) => {
    if (!req.user) {
      return res.status(403).json({ error: true, message: "Not Authorized" });
    }

    const { email, name, sub } = req.user._json;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        // Tạo user mới nếu chưa có
        user = new User({
          username: name,
          email: email,
          password: sub, // chỉ tạm, bạn nên hash hoặc bỏ vì Google login ko cần password
        });
        await user.save();
      }

      req.session.userEmail = email; // lưu email vào session
      return res.status(200).render("homepage", { user }); // truyền user vào view
    } catch (err) {
      console.error("Sign-in error:", err);
      return res.status(500).json({ error: true, message: "Server error" });
    }
  };

  // Xử lý đăng nhập thất bại
  signInFailed = (req, res) => {
    res.status(401).json({
      error: true,
      message: "Log in failure",
    });
  };
}
