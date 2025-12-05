/**
 * Authentication Module
 * Handles MSAL authentication and token management
 */

/**
 * Initializes MSAL instance with configuration
 * @returns {Object} The MSAL instance
 */
function getMsalInstance() {
  if (typeof msal === 'undefined') {
    throw new Error('MSAL library not loaded. Please ensure msal-browser.min.js is loaded before auth.js');
  }
  
  if (typeof CONFIG === 'undefined') {
    throw new Error('CONFIG not loaded. Please ensure config.js is loaded before auth.js');
  }

  return new msal.PublicClientApplication({
    auth: {
      clientId: CONFIG.MSAL.CLIENT_ID,
      authority: CONFIG.MSAL.AUTHORITY,
      redirectUri: CONFIG.MSAL.REDIRECT_URI
    },
    system: {
      navigateToLoginRequestUrl: false
    }
  });
}

// Initialize MSAL instance
let msalInstance;
try {
  msalInstance = getMsalInstance();
} catch (error) {
  console.error('Failed to initialize MSAL instance:', error);
  // Will be retried when getAuth is called
}
/**
 * Retrieves an access token for the given account
 * @param {Object} account - The MSAL account object
 * @returns {Promise<Object>} The token object
 * @throws {Error} If no access token is available
 */
async function getAccessToken(account) {
  console.log("Retrieving Access Token for Account: ", account.name);
  if (!account) {
    throw new Error("No account provided");
  }

  const flowToken = await msalInstance.acquireTokenSilent({
    scopes: CONFIG.MSAL.FLOW_SCOPES,
    account: account,
  });

  if (!flowToken) {
    throw new Error("No access token available");
  }

  return flowToken;
}

/**
 * Handles authentication flow
 * @returns {Promise<Object>} The flow token object
 */
async function getAuth() {
  // Ensure MSAL instance is initialized
  if (!msalInstance) {
    try {
      msalInstance = getMsalInstance();
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      throw new Error('Authentication system not available. Please refresh the page.');
    }
  }

  // Step 1 — Check if this load is returning from redirect login
  const result = await msalInstance.handleRedirectPromise();

  if (result) {
    console.log("Redirect login detected for:", result.account.username);
    return getAccessToken(result.account);
  }

  // Step 2 — No redirect result → check if user already signed in
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length > 0) {
    console.log("User already logged in:", accounts[0].username);
    return getAccessToken(accounts[0]);
  }

  // Step 3 — No user signed in → start login
  console.log("No user logged in → redirecting…");
  const loginRequest = {
    scopes: CONFIG.MSAL.FLOW_SCOPES
  };
  await msalInstance.loginRedirect(loginRequest);
}

