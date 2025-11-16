const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// Render register page
router.get("/register", (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("register", { message: null });
});

// Render login page
router.get("/login", (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("login", { message: null });
});

// Handle registration
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    return res.render("register", { message: "All fields are required!" });
  }

  if (password !== confirmPassword) {
    return res.render("register", { message: "Passwords do not match!" });
  }

  if (password.length < 6) {
    return res.render("register", {
      message: "Password must be at least 6 characters!",
    });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.render("register", {
        message: "Username or email already exists!",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Auto-login: Create session
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    req.session.email = newUser.email;

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Registration error:", err);
    res.render("register", { message: "Something went wrong. Try again." });
  }
});

// Handle login
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.render("login", { message: "All fields are required!" });
  }

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.render("login", { message: "Invalid credentials!" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", { message: "Invalid credentials!" });
    }

    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", { message: "Login failed. Try again." });
  }
});

// Handle logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
