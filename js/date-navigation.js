/**
 * Date Navigation Module
 * Handles date navigation within the current week (Monday to Sunday)
 */

// Date navigation state
const DateNavigation = {
  currentDate: null,
  weekStart: null,
  weekEnd: null
};

/**
 * Gets today's date normalized to midnight
 * @returns {Date} Today's date at 00:00:00
 */
function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Finds the start of the current week (Monday)
 * @param {Date} date - The reference date
 * @returns {Date} The Monday of the current week
 */
function getWeekStart(date = new Date()) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since last Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Initializes the date navigation with the current week period
 * @param {Date} initialDate - The initial date to display (defaults to today)
 */
function initializeDateNavigation(initialDate = new Date()) {
  const today = getToday();
  
  // Find the start of the current week (Monday)
  const monday = getWeekStart(initialDate);
  
  // Set week period: Monday to Sunday (7 days)
  DateNavigation.weekStart = new Date(monday);
  DateNavigation.weekEnd = new Date(monday);
  DateNavigation.weekEnd.setDate(monday.getDate() + 6); // 7 days total (0-6)
  DateNavigation.weekEnd.setHours(23, 59, 59, 999);
  
  // Don't allow week end to be in the future
  if (DateNavigation.weekEnd > today) {
    DateNavigation.weekEnd = new Date(today);
    DateNavigation.weekEnd.setHours(23, 59, 59, 999);
  }
  
  // Set current date (clamp to week period and today)
  const dateToSet = new Date(initialDate);
  dateToSet.setHours(0, 0, 0, 0);
  
  if (dateToSet < DateNavigation.weekStart) {
    DateNavigation.currentDate = new Date(DateNavigation.weekStart);
  } else if (dateToSet > today) {
    DateNavigation.currentDate = new Date(today);
  } else if (dateToSet > DateNavigation.weekEnd) {
    DateNavigation.currentDate = new Date(DateNavigation.weekEnd);
  } else {
    DateNavigation.currentDate = new Date(dateToSet);
  }
  DateNavigation.currentDate.setHours(0, 0, 0, 0);
  
  updateDateDisplay();
  updateNavigationButtons();
  
  // Load form data for the initial date
  const dateString = getCurrentDateString();
  if (dateString) {
    loadFormData(dateString);
  }
}

/**
 * Formats a date for display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Thursday, 15 Feb 2024")
 */
function formatDateDisplay(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-AU', options);
}

/**
 * Updates the date display in the UI
 */
function updateDateDisplay() {
  const dateDisplay = getElementById("dateDisplay");
  const dateInput = getElementById("dateInput");
  
  if (dateDisplay && DateNavigation.currentDate) {
    dateDisplay.textContent = formatDateDisplay(DateNavigation.currentDate);
  }
  
  if (dateInput && DateNavigation.currentDate) {
    // Set the hidden input value in YYYY-MM-DD format
    const year = DateNavigation.currentDate.getFullYear();
    const month = String(DateNavigation.currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(DateNavigation.currentDate.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
  
  // Re-initialize Lucide icons for the navigation buttons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Updates the navigation buttons (enable/disable based on date bounds)
 */
function updateNavigationButtons() {
  const prevBtn = getElementById("datePrevBtn");
  const nextBtn = getElementById("dateNextBtn");
  
  if (!DateNavigation.currentDate || !DateNavigation.weekStart || !DateNavigation.weekEnd) {
    return;
  }
  
  const today = getToday();
  
  // Disable previous button if at start of week
  if (prevBtn) {
    const isAtStart = DateNavigation.currentDate.getTime() <= DateNavigation.weekStart.getTime();
    prevBtn.disabled = isAtStart;
    prevBtn.classList.toggle('disabled', isAtStart);
  }
  
  // Disable next button if at end of week OR if at today (can't go to future)
  if (nextBtn) {
    const isAtEnd = DateNavigation.currentDate.getTime() >= DateNavigation.weekEnd.getTime();
    const isAtToday = DateNavigation.currentDate.getTime() >= today.getTime();
    const shouldDisable = isAtEnd || isAtToday;
    nextBtn.disabled = shouldDisable;
    nextBtn.classList.toggle('disabled', shouldDisable);
  }
}

/**
 * Navigates to the previous day
 */
function navigateToPreviousDay() {
  if (!DateNavigation.currentDate || !DateNavigation.weekStart) {
    return;
  }
  
  // Save current form data before navigating
  const currentDateString = getCurrentDateString();
  if (currentDateString) {
    saveFormData(currentDateString);
  }
  
  const previousDate = new Date(DateNavigation.currentDate);
  previousDate.setDate(previousDate.getDate() - 1);
  
  // Don't go before the week start
  if (previousDate >= DateNavigation.weekStart) {
    DateNavigation.currentDate = previousDate;
    updateDateDisplay();
    updateNavigationButtons();
    
    // Load form data for the new date
    const newDateString = getCurrentDateString();
    if (newDateString) {
      loadFormData(newDateString);
    }
    
    // Log TimesheetStorage when date changes
    console.log('TimesheetStorage:', TimesheetStorage);
  }
}

/**
 * Navigates to the next day
 */
function navigateToNextDay() {
  if (!DateNavigation.currentDate || !DateNavigation.weekEnd) {
    return;
  }
  
  const today = getToday();
  
  // Save current form data before navigating
  const currentDateString = getCurrentDateString();
  if (currentDateString) {
    saveFormData(currentDateString);
  }
  
  const nextDate = new Date(DateNavigation.currentDate);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDate.setHours(0, 0, 0, 0);
  
  // Don't go after the week end or into the future
  if (nextDate <= DateNavigation.weekEnd && nextDate <= today) {
    DateNavigation.currentDate = nextDate;
    updateDateDisplay();
    updateNavigationButtons();
    
    // Load form data for the new date
    const newDateString = getCurrentDateString();
    if (newDateString) {
      loadFormData(newDateString);
    }
    
    // Log TimesheetStorage when date changes
    console.log('TimesheetStorage:', TimesheetStorage);
  }
}

/**
 * Initializes date navigation event handlers
 */
function initDateNavigation() {
  const prevBtn = getElementById("datePrevBtn");
  const nextBtn = getElementById("dateNextBtn");
  
  if (prevBtn) {
    prevBtn.addEventListener('click', navigateToPreviousDay);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', navigateToNextDay);
  }
  
  // Initialize with today's date
  initializeDateNavigation();
}

