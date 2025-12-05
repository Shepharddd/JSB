/**
 * UI Utility Functions
 * Handles loading overlay, toast notifications, and other UI utilities
 */

/**
 * Shows or hides the loading overlay
 * @param {boolean} loading - Whether to show (true) or hide (false) the loading overlay
 */
function setLoading(loading) {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    if (loading) {
      loadingOverlay.classList.remove("hidden");
    } else {
      loadingOverlay.classList.add("hidden");
    }
  }
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success' or 'error')
 */
function showToast(message = CONFIG.TOAST.SUCCESS_MESSAGE, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    
    // Remove existing type classes
    toast.classList.remove("success", "error");
    
    // Add appropriate type class
    toast.classList.add(type);
    toast.classList.add("show");
    
    // Hide toast after configured duration
    setTimeout(() => {
      toast.classList.remove("show");
    }, CONFIG.TOAST.DURATION);
  }
}

/**
 * Sets the date to today's date
 */
function setToday() {
  // Date navigation is handled by date-navigation.js
  // This function is kept for compatibility but does nothing
  // as initializeDateNavigation() is called separately
}

/**
 * Gets an element by ID with error handling
 * @param {string} id - The element ID
 * @returns {HTMLElement|null} The element or null if not found
 */
function getElementById(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID "${id}" not found`);
  }
  return element;
}

