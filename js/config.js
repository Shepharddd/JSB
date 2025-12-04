/**
 * Application Configuration
 * Centralized configuration constants
 */

const CONFIG = {
  // MSAL Authentication
  MSAL: {
    CLIENT_ID: "911b26da-32a3-4e6f-b3a7-6ec57e5063a2",
    AUTHORITY: "https://login.microsoftonline.com/68237f8a-bf3c-425b-b92b-9518c6d4bf18/",
    REDIRECT_URI: window.location.hostname === 'localhost' 
      ? "http://localhost:8000/" 
      : "https://timesheets.jamessamuelsbuilder.com.au/",
    SCOPES: ["Files.ReadWrite.All", "Sites.ReadWrite.All", "User.ReadBasic.All", "Directory.Read.All"]
  },

  // Graph API
  GRAPH_API: {
    USER_ID: "admin@jamessamuelsbuilder.com.au",
    GROUP_ID: "7c4662df-4656-40cb-b3da-3b2538066622",
    ONEDRIVE_ROOT: `https://graph.microsoft.com/v1.0/users('admin@jamessamuelsbuilder.com.au')/drive/root:/JSB`
  },

  // Default values
  DEFAULTS: {
    SITE: 'JSBHQ',
    DEFAULT_LATITUDE: -37.8167,
    DEFAULT_LONGITUDE: 145.0000,
    DEFAULT_TIME_IN: '07:00',
    DEFAULT_TIME_OUT: '15:30'
  },

  // Toast settings
  TOAST: {
    DURATION: 3000,
    SUCCESS_MESSAGE: "Form submitted successfully!",
    ERROR_MESSAGES: {
      NO_NOTES: "Please enter notes describing the works completed today.",
      NO_EMPLOYEES: "Please add at least one employee with a name selected to the form.",
      SUBMIT_ERROR: "Error submitting form. Please try again.",
      LOAD_ERROR: "Failed to load form data. Please refresh the page."
    }
  },

  // Display settings
  DISPLAY: {
    WORK_DESC_MAX_LENGTH: 50,
    WORK_DESC_TRUNCATE_SUFFIX: '...'
  }
};

