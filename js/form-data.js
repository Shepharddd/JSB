/**
 * Form Data Management
 * Handles form data state and initialization
 */

// Application state
const AppState = {
  token: null,
  employees: [],
  plant: [],
  sites: [],
  foremen: []
};

/**
 * Sets the employees data
 * @param {Array} data - Array of employee names
 */
function setEmployees(data) {
  AppState.employees = data;
}

/**
 * Gets the employees data
 * @returns {Array} Array of employee names
 */
function getEmployees() {
  return AppState.employees;
}

/**
 * Sets the plant data
 * @param {Array} data - Array of plant names
 */
function setPlant(data) {
  AppState.plant = data;
}

/**
 * Gets the plant data
 * @returns {Array} Array of plant names
 */
function getPlant() {
  return AppState.plant;
}

/**
 * Sets the sites data
 * @param {Array} data - Array of site names
 */
function setSites(data) {
  AppState.sites = data;
}

/**
 * Gets the sites data
 * @returns {Array} Array of site names
 */
function getSites() {
  return AppState.sites;
}

/**
 * Sets the authentication token
 * @param {Object} tokenData - The token object
 */
function setToken(tokenData) {
  AppState.token = tokenData;
}

/**
 * Gets the authentication token
 * @returns {Object|null} The token object or null
 */
function getToken() {
  return AppState.token;
}

/**
 * Populates the users dropdown
 * @param {string} thisUser - The current user's name
 * @param {Array} users - Array of user names
 */
function populateUsers(thisUser, users) {
  const nameSelect = getElementById("nameInput");
  if (!nameSelect) return;

  // Clear existing options except the first one
  while (nameSelect.options.length > 1) {
    nameSelect.remove(1);
  }

  // Add each user as an option
  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = user;
    nameSelect.appendChild(option);
  });
  
  nameSelect.value = thisUser;
}

/**
 * Populates the sites dropdown
 * @param {string} thisSite - The current site name
 * @param {Array} sites - Array of site names
 */
function populateSites(thisSite, sites) {
  const siteSelect = getElementById("siteInput");
  if (!siteSelect) return;

  // Validate and set default site if needed
  if (!sites.includes(thisSite)) {
    thisSite = sites[0] || CONFIG.DEFAULTS.SITE;
  }

  // Clear existing options except the first one
  while (siteSelect.options.length > 1) {
    siteSelect.remove(1);
  }

  // Add each site as an option
  sites.forEach(site => {
    const option = document.createElement("option");
    option.value = site;
    option.textContent = site;
    siteSelect.appendChild(option);
  });
  
  siteSelect.value = thisSite;
}

