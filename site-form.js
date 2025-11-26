// MSAL Login
const msalConfig = {
  auth: {
    clientId: "911b26da-32a3-4e6f-b3a7-6ec57e5063a2",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

document.getElementById("loginBtn").onclick = async () => {
  try {
    const result = await msalInstance.loginPopup({ scopes: ["Files.ReadWrite"] });
    console.log(result)
    document.getElementById("loginStatus").innerText = `Logged in as ${result.account.username}`;
  } catch (err) {
    console.error("[Sign In Error]: ",err);
  }
};

function addEmployeeRow() {
  const table = document.getElementById("employeeTable");
  const row = table.insertRow();
  row.innerHTML = `
    <td><input type="text" /></td>
    <td><input type="time" /></td>
    <td><input type="time" /></td>
    <td><input type="text" /></td>
  `;
}

function addSubRow() {
  const table = document.getElementById("subTable");
  const row = table.insertRow();
  row.innerHTML = `
    <td><input type="text" /></td>
    <td><input type="time" /></td>
    <td><input type="time" /></td>
    <td><input type="text" /></td>
  `;
}

async function submitForm() {

  console.log("err");
  try {
    const result = await msalInstance.loginPopup({ scopes: ["Files.ReadWrite"] });
    document.getElementById("loginStatus").innerText = `Logged in as ${result.account.username}`;
  } catch (err) {
    console.error(err);
  }

  
  const payload = {
    name: document.getElementById("nameInput").value,
    site: document.getElementById("siteInput").value,
    weather: document.getElementById("weatherInput").value,
    date: document.getElementById("dateInput").value,
    notes: document.getElementById("notesInput").value,
    employees: [...document.querySelectorAll("#employeeTable tr")] .slice(1).map(row => ({
    name: row.children[0].querySelector("input").value,
    timeIn: row.children[1].querySelector("input").value,
    timeOut: row.children[2].querySelector("input").value,
    works: row.children[3].querySelector("input").value,
  })),
    subcontractors: [...document.querySelectorAll("#subTable tr")] .slice(1).map(row => ({
      name: row.children[0].querySelector("input").value,
      timeIn: row.children[1].querySelector("input").value,
      timeOut: row.children[2].querySelector("input").value,
      works: row.children[3].querySelector("input").value,
    })),
  };

  fetch("YOUR_POWER_AUTOMATE_WEBHOOK_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => alert("Submitted!"))
  .catch(err => alert("Error submitting"));
}