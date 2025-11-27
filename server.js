const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Import routes
const authRoutes = require("./routes/authRoutes");
const groceryRoutes = require("./routes/groceryRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Session middleware - MUST BE BEFORE ROUTES
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
  })
);

// View engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId
    ? {
        id: req.session.userId,
        username: req.session.username,
        email: req.session.email,
      }
    : null;
  next();
});

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/my-grocery-buddy"
  )
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Connection Error:", err));

// Routes
app.use("/", authRoutes);
app.use("/api/groceries", groceryRoutes);

// Dashboard Route (Protected)
app.get("/dashboard", (req, res) => {
  // Check if user is logged in
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  // Render dashboard with user data
  res.render("dashboard", {
    user: {
      username: req.session.username,
      email: req.session.email,
    },
  });
});

// Home route redirect
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Starting server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
