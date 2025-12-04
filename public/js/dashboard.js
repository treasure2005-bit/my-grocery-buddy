let groceryItems = [];
let currentFilter = "all";
let editingId = null;

// Initialize dashboard
async function init() {
  await loadItems();
  renderItems();
  initializeValidation();
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

//  FORM VALIDATION INITIALIZATION 
function initializeValidation() {
  const itemNameInput = document.getElementById("itemName");
  const categorySelect = document.getElementById("category");
  const quantityInput = document.getElementById("quantity");

  // Add error containers dynamically if they don't exist
  addErrorContainers();

  // Real-time validation on input
  itemNameInput.addEventListener("input", validateItemName);
  itemNameInput.addEventListener("blur", validateItemName);

  categorySelect.addEventListener("change", validateCategory);
  categorySelect.addEventListener("blur", validateCategory);

  quantityInput.addEventListener("input", validateQuantity);
  quantityInput.addEventListener("blur", validateQuantity);
}

// Add error containers for each input
function addErrorContainers() {
  const inputs = [
    { id: "itemName", errorId: "itemNameError" },
    { id: "category", errorId: "categoryError" },
    { id: "quantity", errorId: "quantityError" },
  ];

  inputs.forEach((input) => {
    const element = document.getElementById(input.id);
    if (element && !document.getElementById(input.errorId)) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-text";
      errorDiv.id = input.errorId;
      element.parentElement.appendChild(errorDiv);
    }
  });
}

//  VALIDATION FUNCTIONS 
function validateItemName() {
  const itemNameInput = document.getElementById("itemName");
  const value = itemNameInput.value.trim();
  const errorElement = document.getElementById("itemNameError");

  clearError(itemNameInput, errorElement);

  if (value === "") {
    showError(itemNameInput, errorElement, " Item name is required");
    return false;
  }

  if (value.length < 2) {
    showError(
      itemNameInput,
      errorElement,
      "Item name must be at least 2 characters"
    );
    return false;
  }

  if (value.length > 50) {
    showError(
      itemNameInput,
      errorElement,
      " Item name must be less than 50 characters"
    );
    return false;
  }

  // Check for invalid characters
  const invalidChars = /[<>{}[\]\\]/;
  if (invalidChars.test(value)) {
    showError(
      itemNameInput,
      errorElement,
      " Item name contains invalid characters"
    );
    return false;
  }

  showValidInput(itemNameInput, errorElement);
  return true;
}

function validateCategory() {
  const categorySelect = document.getElementById("category");
  const value = categorySelect.value;
  const errorElement = document.getElementById("categoryError");

  clearError(categorySelect, errorElement);

  if (value === "" || value === null) {
    showError(categorySelect, errorElement, "Please select a category");
    return false;
  }

  showValidInput(categorySelect, errorElement);
  return true;
}

function validateQuantity() {
  const quantityInput = document.getElementById("quantity");
  const value = quantityInput.value;
  const errorElement = document.getElementById("quantityError");

  clearError(quantityInput, errorElement);

  if (value === "" || value === null) {
    showError(quantityInput, errorElement, " Quantity is required");
    return false;
  }

  const numValue = parseInt(value);

  if (isNaN(numValue)) {
    showError(quantityInput, errorElement, " Quantity must be a number");
    return false;
  }

  if (numValue < 1) {
    showError(quantityInput, errorElement, " Quantity must be at least 1");
    return false;
  }

  if (numValue > 999) {
    showError(
      quantityInput,
      errorElement,
      " Quantity must be less than 1000"
    );
    return false;
  }

  showValidInput(quantityInput, errorElement);
  return true;
}

//  VALIDATION HELPER FUNCTIONS 
function showError(inputElement, errorElement, message) {
  inputElement.classList.add("error");
  inputElement.classList.remove("success");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function showValidInput(inputElement, errorElement) {
  // Don't add 'success' class, just clear the error
  inputElement.classList.remove("error");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

function clearError(inputElement, errorElement) {
  inputElement.classList.remove("error");
  inputElement.classList.remove("success");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

// Form submission with validation
document
  .getElementById("itemForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Run all validations
    const isNameValid = validateItemName();
    const isCategoryValid = validateCategory();
    const isQuantityValid = validateQuantity();

    // If any validation fails, stop submission
    if (!isNameValid || !isCategoryValid || !isQuantityValid) {
      return;
    }

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
      showSuccessAlert(); // ONLY show alert after successful save
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
        (item, index) => `
      <div class="item-card ${item.completed ? "completed" : ""}">
        <input type="checkbox" class="item-checkbox" 
          ${item.completed ? "checked" : ""} 
          onchange="toggleComplete('${item._id}')">

        <div class="item-id">${index + 1}</div>

        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <span class="category-tag">${item.category}</span>
        </div>

        <div class="item-quantity">Qty: ${item.quantity}</div>

        <button class="action-btn btn-edit" onclick="editItem('${item._id}')">
          Edit
        </button>
        <button class="action-btn btn-delete" onclick="deleteItem('${
          item._id
        }')">
          Delete
        </button>
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

    // Clear any validation states
    const itemNameInput = document.getElementById("itemName");
    const categorySelect = document.getElementById("category");
    const quantityInput = document.getElementById("quantity");

    itemNameInput.classList.remove("error", "success");
    categorySelect.classList.remove("error", "success");
    quantityInput.classList.remove("error", "success");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Delete item
async function deleteItem(id) {
  if (confirm(" Delete this item?")) {
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

  if (confirm(` Remove ${count} completed item(s)?`)) {
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

  if (confirm(" Delete ALL items?")) {
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
  const form = document.getElementById("itemForm");
  const inputs = form.querySelectorAll(".form-input, .form-select");

  // Reset all inputs
  form.reset();

  // Clear all error/success states
  inputs.forEach((input) => {
    input.classList.remove("error", "success");
  });

  // Clear all error messages
  const errorMessages = form.querySelectorAll(".error-text");
  errorMessages.forEach((error) => {
    error.textContent = "";
    error.style.display = "none";
  });

  editingId = null;
}

// Show success alert (GREEN NOTIFICATION)
function showSuccessAlert() {
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
