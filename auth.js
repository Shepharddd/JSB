// MSAL Authentication Configuration
const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "911b26da-32a3-4e6f-b3a7-6ec57e5063a2",
    authority: "https://login.microsoftonline.com/68237f8a-bf3c-425b-b92b-9518c6d4bf18/",
    redirectUri: "https://timesheets.jamessamuelsbuilder.com.au/"
    // redirectUri: "http://localhost:8000/"
  },
  system: {
    navigateToLoginRequestUrl: false
  }
});

const scopes = ["Files.ReadWrite", "Sites.ReadWrite.All", "User.ReadBasic.All"]

const tokenRequest = { scopes: scopes };

// let ACCOUNT = null;

// async function setAccount(account) {
//   ACCOUNT = account;
//   console.log("Got Account: ", ACCOUNT);
//   if (typeof getCompanyData === 'function') {
//     getCompanyData();
//   }
// }

async function getAccessToken(account) {
  console.log("Retrieving Access Token for Account: ", account.name);
  if (!account) return;

  const token = await msalInstance.acquireTokenSilent({
    scopes: scopes,
    account: account,
  });

  if (!token) throw new Error("No access token available");

  return token;
}

async function getAuth() {

  // Step 1 — see if this load is returning from redirect login
  const result = await msalInstance.handleRedirectPromise();

  if (result) {
    console.log("Redirect login detected for:", result.account.username);
    return getAccessToken(result.account);
  }

  // Step 2 — no redirect result → check if user already signed in
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length > 0) {
    console.log("User already logged in:", accounts[0].username);
    return getAccessToken(accounts[0]);
  }

  // Step 3 — no user signed in → start login
  console.log("No user logged in → redirecting…");
  msalInstance.loginRedirect(tokenRequest);
  
}