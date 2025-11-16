let groceryItems = [];
let currentFilter = "all";
let editingId = null;

// Initialize dashboard
async function init() {
  await loadItems();
  renderItems();
}

// Load items from backend
async function loadItems() {
  try {
    const response = await fetch("/api/groceries");
    if (response.ok) {
      groceryItems = await response.json();
    }
  } catch (error) {
    console.error("Error loading items:", error);
  }
}

// Form submission
document
  .getElementById("itemForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("itemName").value;
    const category = document.getElementById("category").value;
    const quantity = parseInt(document.getElementById("quantity").value);

    try {
      if (editingId) {
        // Update existing item
        const response = await fetch(`/api/groceries/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, quantity }),
        });

        if (response.ok) {
          const updatedItem = await response.json();
          const index = groceryItems.findIndex((i) => i._id === editingId);
          groceryItems[index] = updatedItem;
        }
        editingId = null;
      } else {
        // Add new item
        const response = await fetch("/api/groceries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, quantity }),
        });

        if (response.ok) {
          const newItem = await response.json();
          groceryItems.unshift(newItem);
        }
      }

      renderItems();
      resetForm();
      showSuccess();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item. Please try again.");
    }
  });

// Render items
function renderItems() {
  const grid = document.getElementById("itemsGrid");
  const emptyState = document.getElementById("emptyState");

  let filteredItems = groceryItems;

  if (currentFilter === "active") {
    filteredItems = groceryItems.filter((item) => !item.completed);
  } else if (currentFilter === "completed") {
    filteredItems = groceryItems.filter((item) => item.completed);
  }

  if (filteredItems.length === 0) {
    grid.innerHTML = "";
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    grid.innerHTML = filteredItems
      .map(
        (item) => `
      <div class="item-card ${item.completed ? "completed" : ""}">
        <input type="checkbox" class="item-checkbox" 
          ${item.completed ? "checked" : ""} 
          onchange="toggleComplete('${item._id}')">
        <div class="item-id">#${item._id.slice(-6)}</div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <span class="category-tag">${item.category}</span>
        </div>
        <div class="item-quantity">Qty: ${item.quantity}</div>
        <button class="action-btn btn-edit" onclick="editItem('${
          item._id
        }')">Edit</button>
        <button class="action-btn btn-delete" onclick="deleteItem('${
          item._id
        }')">Delete</button>
      </div>
    `
      )
      .join("");
  }

  updateStatistics();
}

// Update statistics
function updateStatistics() {
  const total = groceryItems.length;
  const completed = groceryItems.filter((item) => item.completed).length;
  const active = total - completed;

  document.getElementById("totalItems").textContent = total;
  document.getElementById("activeItems").textContent = active;
  document.getElementById("completedItems").textContent = completed;
  document.getElementById("remainingItems").textContent = active;
}

// Toggle completion
async function toggleComplete(id) {
  try {
    const response = await fetch(`/api/groceries/${id}/toggle`, {
      method: "PATCH",
    });

    if (response.ok) {
      const updatedItem = await response.json();
      const index = groceryItems.findIndex((i) => i._id === id);
      groceryItems[index] = updatedItem;
      renderItems();
    }
  } catch (error) {
    console.error("Error toggling item:", error);
  }
}

// Edit item
function editItem(id) {
  const item = groceryItems.find((i) => i._id === id);
  if (item) {
    document.getElementById("itemName").value = item.name;
    document.getElementById("category").value = item.category;
    document.getElementById("quantity").value = item.quantity;
    editingId = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Delete item
async function deleteItem(id) {
  if (confirm("🗑️ Delete this item?")) {
    try {
      const response = await fetch(`/api/groceries/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        groceryItems = groceryItems.filter((item) => item._id !== id);
        renderItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
}

// Filter items
function filterItems(filter, event) {
  currentFilter = filter;

  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.classList.remove("active");
  });
  event.target.classList.add("active");

  renderItems();
}

// Clear completed
async function clearCompleted() {
  const count = groceryItems.filter((item) => item.completed).length;
  if (count === 0) {
    alert("No completed items!");
    return;
  }

  if (confirm(`Remove ${count} completed item(s)?`)) {
    try {
      const response = await fetch("/api/groceries/bulk/completed", {
        method: "DELETE",
      });

      if (response.ok) {
        groceryItems = groceryItems.filter((item) => !item.completed);
        renderItems();
      }
    } catch (error) {
      console.error("Error clearing completed:", error);
    }
  }
}

// Clear all
async function clearAll() {
  if (groceryItems.length === 0) {
    alert("List is empty!");
    return;
  }

  if (confirm("⚠️ Delete ALL items?")) {
    try {
      const response = await fetch("/api/groceries/bulk/all", {
        method: "DELETE",
      });

      if (response.ok) {
        groceryItems = [];
        renderItems();
      }
    } catch (error) {
      console.error("Error clearing all:", error);
    }
  }
}

// Reset form
function resetForm() {
  document.getElementById("itemForm").reset();
  editingId = null;
}

// Show success
function showSuccess() {
  const alert = document.getElementById("successAlert");
  alert.classList.add("show");
  setTimeout(() => alert.classList.remove("show"), 3000);
}

// Close alert
function closeAlert() {
  document.getElementById("successAlert").classList.remove("show");
}

// Initialize
init();
