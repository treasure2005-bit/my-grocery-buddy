const express = require("express");
const router = express.Router();
const GroceryItem = require("../models/groceryModel");

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

// Apply auth middleware to all grocery routes
router.use(requireAuth);

// GET all items for logged-in user
router.get("/", async (req, res) => {
  try {
    const items = await GroceryItem.find({ userId: req.session.userId }).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST - Add new item
router.post("/", async (req, res) => {
  try {
    const { name, category, quantity } = req.body;

    // Validation
    if (!name || !category || !quantity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    // Create new item
    const newItem = new GroceryItem({
      name,
      category,
      quantity,
      userId: req.session.userId,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// PUT - Update item
router.put("/:id", async (req, res) => {
  try {
    const { name, category, quantity } = req.body;
    const itemId = req.params.id;

    // Find item and verify ownership
    const item = await GroceryItem.findOne({
      _id: itemId,
      userId: req.session.userId,
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    // Update fields
    if (name) item.name = name;
    if (category) item.category = category;
    if (quantity) item.quantity = quantity;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// PATCH - Toggle completion status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const itemId = req.params.id;

    // Find item and verify ownership
    const item = await GroceryItem.findOne({
      _id: itemId,
      userId: req.session.userId,
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    // Toggle completion
    item.completed = !item.completed;
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("Error toggling item:", err);
    res.status(500).json({ error: "Failed to toggle item" });
  }
});

// DELETE - Delete single item
router.delete("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;

    // Find and delete item (verify ownership)
    const item = await GroceryItem.findOneAndDelete({
      _id: itemId,
      userId: req.session.userId,
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    res.json({ message: "Item deleted successfully", item });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// DELETE - Clear completed items
router.delete("/bulk/completed", async (req, res) => {
  try {
    const result = await GroceryItem.deleteMany({
      userId: req.session.userId,
      completed: true,
    });

    res.json({
      message: `Deleted ${result.deletedCount} completed items`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error clearing completed items:", err);
    res.status(500).json({ error: "Failed to clear completed items" });
  }
});

// DELETE - Clear all items
router.delete("/bulk/all", async (req, res) => {
  try {
    const result = await GroceryItem.deleteMany({
      userId: req.session.userId,
    });

    res.json({
      message: `Deleted ${result.deletedCount} items`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error clearing all items:", err);
    res.status(500).json({ error: "Failed to clear all items" });
  }
});

module.exports = router;
