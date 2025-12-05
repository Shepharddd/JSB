/**
 * Date Navigation Module
 * Handles date navigation within a fortnight period (Thursday to Thursday)
 */

// Date navigation state
const DateNavigation = {
  currentDate: null,
  fortnightStart: null,
  fortnightEnd: null
};

/**
 * Finds the most recent Thursday (or today if it's Thursday)
 * @param {Date} date - The reference date
 * @returns {Date} The most recent Thursday
 */
function getMostRecentThursday(date = new Date()) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 4 = Thursday
  const daysSinceThursday = (dayOfWeek + 3) % 7; // Days since last Thursday
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - daysSinceThursday);
  thursday.setHours(0, 0, 0, 0);
  return thursday;
}

/**
 * Initializes the date navigation with a fortnight period
 * @param {Date} initialDate - The initial date to display (defaults to today)
 */
function initializeDateNavigation(initialDate = new Date()) {
  // Find the most recent Thursday
  const thursday = getMostRecentThursday(initialDate);
  
  // Set fortnight period: Thursday to Thursday (14 days)
  DateNavigation.fortnightStart = new Date(thursday);
  DateNavigation.fortnightEnd = new Date(thursday);
  DateNavigation.fortnightEnd.setDate(thursday.getDate() + 13); // 14 days total (0-13)
  DateNavigation.fortnightEnd.setHours(23, 59, 59, 999);
  
  // Set current date (clamp to fortnight period)
  const dateToSet = new Date(initialDate);
  if (dateToSet < DateNavigation.fortnightStart) {
    DateNavigation.currentDate = new Date(DateNavigation.fortnightStart);
  } else if (dateToSet > DateNavigation.fortnightEnd) {
    DateNavigation.currentDate = new Date(DateNavigation.fortnightEnd);
  } else {
    DateNavigation.currentDate = new Date(dateToSet);
  }
  DateNavigation.currentDate.setHours(0, 0, 0, 0);
  
  updateDateDisplay();
  updateNavigationButtons();
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
  
  if (!DateNavigation.currentDate || !DateNavigation.fortnightStart || !DateNavigation.fortnightEnd) {
    return;
  }
  
  // Disable previous button if at start of fortnight
  if (prevBtn) {
    const isAtStart = DateNavigation.currentDate.getTime() <= DateNavigation.fortnightStart.getTime();
    prevBtn.disabled = isAtStart;
    prevBtn.classList.toggle('disabled', isAtStart);
  }
  
  // Disable next button if at end of fortnight
  if (nextBtn) {
    const isAtEnd = DateNavigation.currentDate.getTime() >= DateNavigation.fortnightEnd.getTime();
    nextBtn.disabled = isAtEnd;
    nextBtn.classList.toggle('disabled', isAtEnd);
  }
}

/**
 * Navigates to the previous day
 */
function navigateToPreviousDay() {
  if (!DateNavigation.currentDate || !DateNavigation.fortnightStart) {
    return;
  }
  
  const previousDate = new Date(DateNavigation.currentDate);
  previousDate.setDate(previousDate.getDate() - 1);
  
  // Don't go before the fortnight start
  if (previousDate >= DateNavigation.fortnightStart) {
    DateNavigation.currentDate = previousDate;
    updateDateDisplay();
    updateNavigationButtons();
  }
}

/**
 * Navigates to the next day
 */
function navigateToNextDay() {
  if (!DateNavigation.currentDate || !DateNavigation.fortnightEnd) {
    return;
  }
  
  const nextDate = new Date(DateNavigation.currentDate);
  nextDate.setDate(nextDate.getDate() + 1);
  
  // Don't go after the fortnight end
  if (nextDate <= DateNavigation.fortnightEnd) {
    DateNavigation.currentDate = nextDate;
    updateDateDisplay();
    updateNavigationButtons();
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

