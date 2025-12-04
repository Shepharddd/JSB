/**
 * Authentication Module
 * Handles MSAL authentication and token management
 */

/**
 * Initializes MSAL instance with configuration
 */
const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: CONFIG.MSAL.CLIENT_ID,
    authority: CONFIG.MSAL.AUTHORITY,
    redirectUri: CONFIG.MSAL.REDIRECT_URI
  },
  system: {
    navigateToLoginRequestUrl: false
  }
});
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

  const token = await msalInstance.acquireTokenSilent({
    scopes: CONFIG.MSAL.SCOPES,
    account: account,
  });

  if (!token) {
    throw new Error("No access token available");
  }
  return token;
}

/**
 * Handles authentication flow
 * @returns {Promise<Object>} The token object
 */
async function getAuth() {
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
  msalInstance.loginRedirect();
}

