/**
 * Main Application Initialization
 * Coordinates application startup and initialization
 */

/**
 * Initializes the application
 */
async function init() {
  setLoading(true);

  try {
    // Get site from URL parameters
    const params = new URLSearchParams(window.location.search);
    const siteParam = params.get('site');
    const thisSite = siteParam || CONFIG.DEFAULTS.SITE;
    const hasSiteParam = !!siteParam;

    // Authenticate
    const flowToken = await getAuth();
    setToken(flowToken);

    // Clear all timesheet data from localStorage when fetching fresh data
    if (typeof clearAllTimesheetData === 'function') {
      clearAllTimesheetData();
    }
    
    // Load company data
    const [users, plant, sites, admins] = await getCompanyData(flowToken);
    
    // Update application state
    setEmployees(users);
    setPlant(plant);
    setSites(sites);

    // Check if current user is an admin
    const currentUserName = flowToken.account.name;
    const isAdmin = admins && admins.includes(currentUserName);

    // Populate form fields
    populateSites(thisSite, sites, hasSiteParam);
    populateUsers(currentUserName, users, isAdmin);
    // Date navigation is initialized separately in initializeApp()

    // Load weather
    await getWeatherDescription();

  } catch (error) {
    console.error("Error initializing application:", error);
    const errorMessage = error.message || CONFIG.TOAST.ERROR_MESSAGES.LOAD_ERROR;
    showToast(errorMessage, "error");
    throw error;
  } finally {
    setLoading(false);
  }
}

/**
 * Initializes all event handlers and sets up the application
 */
function initializeApp() {
  // Initialize modal handlers
  initModalHandlers();
  
  // Initialize table handlers
  initTableHandlers();
  
  // Initialize form handler
  initFormHandler();
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Initialize date navigation
  initDateNavigation();
  
  // Initialize auto-save
  if (typeof initAutoSave === 'function') {
    initAutoSave();
  }
  
  // Initialize application
  init();
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

