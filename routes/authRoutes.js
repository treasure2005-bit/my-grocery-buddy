// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// Render register page
router.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("register", { message: null });
});

// Render login page
router.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("login", { message: null });
});

// Handle registration - AUTO LOGIN on success
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  console.log("Registration attempt:", { username, email });

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    console.log("Missing fields");
    return res.render("register", { message: "All fields are required!" });
  }

  if (password !== confirmPassword) {
    console.log("Passwords don't match");
    return res.render("register", { message: "Passwords do not match!" });
  }

  if (password.length < 6) {
    console.log("Password too short");
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
      console.log("User already exists:", userExists.username);
      return res.render("register", {
        message: "Username or email already exists!",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log("User saved to database:", {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
    });

    // AUTO-LOGIN: create session and redirect to dashboard
    req.session.userId = savedUser._id;
    req.session.username = savedUser.username;
    req.session.email = savedUser.email;

    console.log("Session created on register, redirecting to dashboard");
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Registration error:", err);
    console.error("Error details:", err.message);
    // If request comes from API (json), respond JSON; otherwise render
    if (req.headers.accept && req.headers.accept.indexOf("application/json") !== -1) {
      return res.status(500).json({ message: "Something went wrong. Try again." });
    }
    res.render("register", { message: "Something went wrong. Try again." });
  }
});

// Handle login
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;
  console.log("Login attempt:", { emailOrUsername });

  if (!emailOrUsername || !password) {
    console.log("Missing login fields");
    return res.render("login", { message: "All fields are required!" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      console.log("User not found");
      return res.render("login", { message: "Invalid credentials!" });
    }

    console.log("User found:", user.username);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Password mismatch");
      return res.render("login", { message: "Invalid credentials!" });
    }

    console.log("Password matched");

    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;

    console.log("Session created, redirecting to dashboard");
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", { message: "Login failed. Try again." });
  }
});

// Handle logout
router.get("/logout", (req, res) => {
  console.log("User logging out");
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
