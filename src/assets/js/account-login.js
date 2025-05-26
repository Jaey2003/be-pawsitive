/**
 * Be Pawsitive Login Page JavaScript
 * This file handles all login page functionality including form submission, validation, and UI interactions
 */

// DOM elements
const passwordField = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginForm = document.getElementById('loginForm');
const createAccountBtn = document.getElementById('create-account-btn');
const inputFields = document.querySelectorAll('.form-box input');

// Configuration
const loginEndpoint = '../backends/account_login.php';
const redirectDelay = 500;
const alertAutoHideDelay = 5000;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Password toggle functionality
  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      const isPassword = passwordField.type === 'password';
      passwordField.type = isPassword ? 'text' : 'password';

      const icon = togglePassword.querySelector('i');
      if (isPassword) {
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  }
  
  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = new FormData(loginForm);
      const username = formData.get('username').trim();
      const password = formData.get('password');
      
      // Validate form
      if (username === '' || password === '') {
        removeAlerts();
        createAlert('danger', 'Please fill in all fields', true);
        return;
      }
      
      // Update button state
      const loginBtn = loginForm.querySelector('.login-btn');
      const originalBtnText = loginBtn.textContent;
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
      
      // Submit form using XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open('POST', loginEndpoint, true);
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const responseText = xhr.responseText.trim();
            try {
              const data = JSON.parse(responseText);
              if (data.success) {
                removeAlerts();
                createAlert('success', data.message || 'Login successful!');
                // Redirect after success
                setTimeout(function() {
                  window.location.href = data.redirect || 'home.php';
                }, redirectDelay);
              } else {
                removeAlerts();
                createAlert('danger', data.message || 'Login failed', true);
                loginBtn.disabled = false;
                loginBtn.textContent = originalBtnText;
              }
            } catch (err) {
              console.error('Error parsing JSON:', err);
              removeAlerts();
              createAlert('danger', 'There was a problem with the server response. Please try again later.', true);
              loginBtn.disabled = false;
              loginBtn.textContent = originalBtnText;
            }
          } else {
            console.error('Request failed with status:', xhr.status);
            removeAlerts();
            createAlert('danger', 'Connection error. Please check your internet connection and try again.', true);
            loginBtn.disabled = false;
            loginBtn.textContent = originalBtnText;
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('Network error occurred');
        removeAlerts();
        createAlert('danger', 'Network error. Please check your connection and try again.', true);
        loginBtn.disabled = false;
        loginBtn.textContent = originalBtnText;
      };
      
      xhr.send(formData);
    });
  }
  
  // Input field animations
  inputFields.forEach(function(input) {
    input.addEventListener('focus', function() {
      this.closest('.input-group').classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (this.value === '') {
        this.closest('.input-group').classList.remove('focused');
      }
    });
  });
});

/**
 * Create alert element
 */
function createAlert(type, message, autoHide) {
  if (!loginForm) return;
  
  // Remove any existing alerts first
  removeAlerts();
  
  // Create alert container
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} mt-3`;
  alert.role = 'alert';
  
  // Add icon based on alert type
  let icon = '';
  if (type === 'danger') {
    icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
  } else if (type === 'success') {
    icon = '<i class="bi bi-check-circle-fill me-2"></i>';
  }
  
  // Set content with icon
  alert.innerHTML = icon + message;
  
  // Insert before the form for better visibility
  const formBox = loginForm.closest('.form-box');
  if (formBox) {
    formBox.insertBefore(alert, loginForm);
  } else {
    // Fallback to inserting after form
    loginForm.parentNode.insertBefore(alert, loginForm.nextSibling);
  }
  
  // Add animation
  setTimeout(function() {
    alert.style.opacity = '1';
  }, 10);
  
  if (autoHide) {
    setTimeout(function() {
      alert.style.opacity = '0';
      setTimeout(function() {
        alert.remove();
      }, 300);
    }, alertAutoHideDelay);
  }
}

/**
 * Remove all alerts
 */
function removeAlerts() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function(alert) {
    alert.remove();
  });
}