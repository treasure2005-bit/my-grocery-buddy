const mongoose = require("mongoose");

const groceryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Produce",
        "Dairy",
        "Meat",
        "Bakery",
        "Pantry",
        "Frozen",
        "Beverages",
        "Snacks",
        "Other",
      ],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GroceryItem", groceryItemSchema);
