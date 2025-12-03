// REGISTER FORM VALIDATION

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const successAlert = document.getElementById("successAlert");

  const usernameError = document.getElementById("usernameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  // Get backend error message element
  const backendError = document.querySelector(".message.error");

  // DISABLE BROWSER DEFAULT VALIDATION
  form.setAttribute("novalidate", "novalidate");
  form.noValidate = true;

  // CLEAR ANY EXISTING ERROR MESSAGES ON PAGE LOAD
  clearAllErrors();

  // Form submission validation
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // Clear all previous errors
    clearAllErrors();

    // Run all validations
    if (!validateUsername()) isValid = false;
    if (!validateEmail()) isValid = false;
    if (!validatePassword()) isValid = false;
    if (!validateConfirmPassword()) isValid = false;

    // If all validations pass, show success and submit
    if (isValid) {
      showSuccessAndSubmit();
    }
  });

  // Real-time validation on blur (not on input to avoid annoying users)
  usernameInput.addEventListener("blur", validateUsername);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", function () {
    validatePassword();
    // Also revalidate confirm password if it has a value
    if (confirmPasswordInput.value !== "") {
      validateConfirmPassword();
    }
  });
  confirmPasswordInput.addEventListener("blur", validateConfirmPassword);

  // Clear error when user starts typing
  usernameInput.addEventListener("input", function () {
    // Hide backend error message
    if (backendError) backendError.style.display = "none";

    if (usernameError.textContent !== "") {
      clearError(usernameInput, usernameError);
    }
  });

  emailInput.addEventListener("input", function () {
    // Hide backend error message
    if (backendError) backendError.style.display = "none";

    if (emailError.textContent !== "") {
      clearError(emailInput, emailError);
    }
  });

  passwordInput.addEventListener("input", function () {
    // Hide backend error message
    if (backendError) backendError.style.display = "none";

    if (passwordError.textContent !== "") {
      clearError(passwordInput, passwordError);
    }
    // Also clear confirm password error if passwords now match
    if (
      confirmPasswordError.textContent !== "" &&
      confirmPasswordInput.value !== ""
    ) {
      if (passwordInput.value === confirmPasswordInput.value) {
        clearError(confirmPasswordInput, confirmPasswordError);
      }
    }
  });

  confirmPasswordInput.addEventListener("input", function () {
    // Hide backend error message
    if (backendError) backendError.style.display = "none";

    if (confirmPasswordError.textContent !== "") {
      clearError(confirmPasswordInput, confirmPasswordError);
    }
  });

  // ===== VALIDATION FUNCTIONS =====

  function validateUsername() {
    const value = usernameInput.value.trim();

    if (value === "") {
      showError(usernameInput, usernameError, "Username is required");
      return false;
    }

    if (value.length < 3) {
      showError(
        usernameInput,
        usernameError,
        "Username must be at least 3 characters"
      );
      return false;
    }

    if (value.length > 20) {
      showError(
        usernameInput,
        usernameError,
        "Username must be less than 20 characters"
      );
      return false;
    }

    // Check for valid characters (letters, numbers, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(value)) {
      showError(
        usernameInput,
        usernameError,
        "Username can only contain letters, numbers, _ and -"
      );
      return false;
    }

    showValidInput(usernameInput, usernameError);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();

    if (value === "") {
      showError(emailInput, emailError, "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showError(emailInput, emailError, "Please enter a valid email address");
      return false;
    }

    showValidInput(emailInput, emailError);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;

    if (value === "") {
      showError(passwordInput, passwordError, "Password is required");
      return false;
    }

    if (value.length < 6) {
      showError(
        passwordInput,
        passwordError,
        "Password must be at least 6 characters"
      );
      return false;
    }

    if (value.length > 50) {
      showError(
        passwordInput,
        passwordError,
        "Password must be less than 50 characters"
      );
      return false;
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      showError(
        passwordInput,
        passwordError,
        "Password must contain uppercase, lowercase, and numbers"
      );
      return false;
    }

    showValidInput(passwordInput, passwordError);
    return true;
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    const passwordValue = passwordInput.value;

    if (value === "") {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Please confirm your password"
      );
      return false;
    }

    if (value !== passwordValue) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Passwords do not match"
      );
      return false;
    }

    showValidInput(confirmPasswordInput, confirmPasswordError);
    return true;
  }

  // ===== HELPER FUNCTIONS =====

  function showError(inputElement, errorElement, message) {
    inputElement.classList.add("error");
    inputElement.classList.remove("success");
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  function showValidInput(inputElement, errorElement) {
    // Don't add 'success' class, just clear the error
    inputElement.classList.remove("error");
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  function clearError(inputElement, errorElement) {
    inputElement.classList.remove("error");
    inputElement.classList.remove("success");
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  function clearAllErrors() {
    [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
      (input) => {
        input.classList.remove("error", "success");
      }
    );

    [usernameError, emailError, passwordError, confirmPasswordError].forEach(
      (error) => {
        error.textContent = "";
        error.style.display = "none";
      }
    );
  }

  function showSuccessAndSubmit() {
    successAlert.style.display = "block";

    // Change button text and disable
    const submitBtn = form.querySelector(".btn-primary");
    submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';
    submitBtn.disabled = true;

    // Make inputs readonly instead of disabled so values are sent
    [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
      (input) => {
        input.readOnly = true;
      }
    );

    // Submit after short delay
    setTimeout(function () {
      form.submit();
    }, 800);
  }
});
