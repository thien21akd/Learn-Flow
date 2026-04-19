const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Thiếu thông tin!" });
    }

    const existed = await User.findOne({ email });
    if (existed) {
      return res.status(400).json({ msg: "Email đã tồn tại!" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed
    });

    res.json({
      msg: "Đăng ký thành công!",
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server", err: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Thiếu email hoặc password!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Sai email hoặc mật khẩu!" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ msg: "Sai email hoặc mật khẩu!" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Đăng nhập thành công!",
      token,
      username: user.username,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi server", err: err.message });
  }
});

module.exports = router;