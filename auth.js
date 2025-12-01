// MSAL Authentication Configuration
const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "911b26da-32a3-4e6f-b3a7-6ec57e5063a2",
    authority: "https://login.microsoftonline.com/68237f8a-bf3c-425b-b92b-9518c6d4bf18/",
    redirectUri: "https://timesheets.jamessamuelsbuilder.com.au/"
  },
  system: {
    navigateToLoginRequestUrl: false
  }
});

const tokenRequest = { scopes: ["Files.ReadWrite", "Sites.ReadWrite.All"] };

let ACCOUNT = null;

function setAccount(account) {
  ACCOUNT = account;
  console.log("Got Account: ", ACCOUNT);
  if (typeof getCompanyData === 'function') {
    getCompanyData();
  }
}

async function getAccessToken() {
  console.log("Retrieving Access Token for Account: ", ACCOUNT);
  if (!ACCOUNT) return;

  const token = await msalInstance.acquireTokenSilent({
    scopes: ["Files.ReadWrite", "Sites.ReadWrite.All"],
    account: ACCOUNT,
  });

  console.log("Got Token: ", token);
  return token.accessToken;
}

async function getAccount() {
  console.log("Getting User Account");

  try {
    // Step 1 — see if this load is returning from redirect login
    const result = await msalInstance.handleRedirectPromise();

    if (result) {
      console.log("Redirect login detected for:", result.account.username);
      setAccount(result.account);
      return;
    }

    // Step 2 — no redirect result → check if user already signed in
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
      console.log("User already logged in:", accounts[0].username);
      setAccount(accounts[0]);
      return;
    }

    // Step 3 — no user signed in → start login
    console.log("No user logged in → redirecting…");
    msalInstance.loginRedirect(tokenRequest);

  } catch (error) {
    console.error("getAccount Error:", error);
  }
}

// Login button handler
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.onclick = async () => {
      try {
        const result = await msalInstance.loginPopup({ scopes: ["Files.ReadWrite"] });
        console.log(result);
        const loginStatus = document.getElementById("loginStatus");
        if (loginStatus) {
          loginStatus.innerText = `Logged in as ${result.account.username}`;
        }
      } catch (err) {
        console.error("[Sign In Error]: ", err);
      }
    };
  }
});

