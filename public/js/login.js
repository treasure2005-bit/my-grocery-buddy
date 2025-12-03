//  LOGIN FORM VALIDATION 

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("emailOrUsername");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const successAlert = document.getElementById("successAlert");

  // Hide backend error messages when user starts typing
  const backendError = document.querySelector(".message.error");

  emailInput.addEventListener("input", function () {
    if (backendError) backendError.style.display = "none";
    clearError(emailInput, emailError);
  });

  passwordInput.addEventListener("input", function () {
    if (backendError) backendError.style.display = "none";
    clearError(passwordInput, passwordError);
  });

  // Form validation
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;
    clearErrors();

    // Validate email/username
    const emailValue = emailInput.value.trim();
    if (emailValue === "") {
      showError(emailInput, emailError, "Email or username is required");
      isValid = false;
    } else if (emailValue.length < 3) {
      showError(emailInput, emailError, " Must be at least 3 characters");
      isValid = false;
    }

    // Validate password
    const passwordValue = passwordInput.value.trim();
    if (passwordValue === "") {
      showError(passwordInput, passwordError, " Password is required");
      isValid = false;
    } else if (passwordValue.length < 6) {
      showError(
        passwordInput,
        passwordError,
        " Password must be at least 6 characters"
      );
      isValid = false;
    }

    // If valid, submit the form NATURALLY (no JavaScript)
    if (isValid) {
      successAlert.style.display = "block";
      const submitBtn = form.querySelector(".btn-primary");
      submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';
      submitBtn.disabled = true;

      // Submit form naturally - DON'T disable inputs!
      form.submit();
    }
  });

  function showError(inputElement, errorElement, message) {
    inputElement.classList.add("error");
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  function clearError(inputElement, errorElement) {
    inputElement.classList.remove("error");
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  function clearErrors() {
    clearError(emailInput, emailError);
    clearError(passwordInput, passwordError);
  }
});
