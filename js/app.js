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
    const thisSite = params.get('site') || CONFIG.DEFAULTS.SITE;

    // Authenticate
    const [graphToken, flowToken] = await getAuth();
    setTokens(graphToken, flowToken);

    // Load company data
    const [users, plant, sites] = await getCompanyData(flowToken);
    
    // Update application state
    setEmployees(users);
    setPlant(plant);
    setSites(sites);

    // Populate form fields
    populateSites(thisSite, sites);
    populateUsers(graphToken.account.name, users);
    setToday();

    // Load weather
    await getWeatherDescription();

  } catch (error) {
    console.error("Error initializing application:", error);
    const errorMessage = error.message || CONFIG.TOAST.ERROR_MESSAGES.LOAD_ERROR;
    showToast(errorMessage, "error");
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
  
  // Initialize application
  init();
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

