// MSAL Login
const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "911b26da-32a3-4e6f-b3a7-6ec57e5063a2",
    authority: "https://login.microsoftonline.com/68237f8a-bf3c-425b-b92b-9518c6d4bf18/",
    // redirectUri: window.location.origin,
    redirectUri: "https://timesheets.jamessamuelsbuilder.com.au/"
  },
  system: {
    navigateToLoginRequestUrl: false
  }
});
const tokenRequest = { scopes: ["Files.ReadWrite", "Sites.ReadWrite.All"] };

let sites = []
let foremen = []
let employees = []
let plant = []

function addForemen(data) {
  foremen = data
  // Get the select element
  const siteSelect = document.getElementById("nameInput");

  // Add each site as an option
  foremen.forEach(foreman => {
    const option = document.createElement("option");
    option.value = foreman;
    option.textContent = foreman;
    siteSelect.appendChild(option);
  });
}

function addSites(data) {
  sites = data
  // Get the select element
  const siteSelect = document.getElementById("siteInput");

  // Add each site as an option
  sites.forEach(site => {
    const option = document.createElement("option");
    option.value = site;
    option.textContent = site;
    siteSelect.appendChild(option);
  });
}

function addEmployees(data) {
  employees = data
}

function addPlant(data) {
  plant = data
}


function setToday() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dateInput").value = today;
}

let ACCOUNT = null;

function setAccount(account) {
  ACCOUNT = account;
  console.log("Got Account: ", ACCOUNT)
  getCompanyData();
}

async function getAccessToken() {
  console.log("Retreiving Access Token for Account: ", ACCOUNT)
  if (!ACCOUNT) return;

  const token = await msalInstance.acquireTokenSilent({
    scopes: ["Files.ReadWrite", "Sites.ReadWrite.All"],
    account: ACCOUNT,
  });

  console.log("Got Token: ", token)
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

async function getCompanyData(){
  try {
        // Get access token
        const token = await getAccessToken();
        if (!token) throw new Error("No access token available");


        // Path to your Excel file in OneDrive
        // const filePath = "/Data.xlsx"; // change if different path
        // const tableName = "Table13"

        const otherUser = "admin@jamessamuelsbuilder.com.au"; // or user ID
        const fileName = "Data.xlsx";
        const tableId = "Table13";

        const url = `https://graph.microsoft.com/v1.0/users('${otherUser}')/drive/root:/${fileName}:/workbook/tables('${tableId}')/rows`;

        // const url = `https://graph.microsoft.com/v1.0/me/drive/root:${filePath}:/workbook/tables/${tableName}/rows`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Error reading table: ${JSON.stringify(err)}`);
        }

        const data = await response.json();
        const [plant_items, employees, sites, foremen] = extractCategories(data)

        console.log("Table data:", plant_items); // data.value contains the rows
        addSites(sites)
        addForemen(foremen)
        addEmployees(employees)
        addPlant(plant_items)
        return data.value;
    } catch (err) {
        console.error(err);
        alert("Error reading table: " + err.message);
    }

}

function extractCategories(rawData) {
    const categories = {};

    rawData.value.forEach(row => {
        if (row.values && row.values[0] && row.values[0].length === 2) {
            const [key, value] = row.values[0];

            if (!categories[key]) {
                categories[key] = [];
            }
            categories[key].push(value);
        }
    });

    // Return arrays in a fixed order: [Plant Items, Employees]
    return [categories["Plant Items"] || [], categories["Employees"] || [], categories["Sites"] || [], categories["Foremen"] || [] ];
}

async function init() {
  getAccount();
  setToday();
  getWeatherDescription();
  // login();

}

init();

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

  // Build the options HTML dynamically
  let optionsHtml = `<option value="">Select...</option>`;
  employees.forEach(emp => {
    optionsHtml += `<option value="${emp}">${emp}</option>`;
  });

  row.innerHTML = `
    <td>
      <select>${optionsHtml}</select>
    </td>
    <td>
      <span class="time-display">07:00</span>
      <input type="time" value="07:00" style="display: none;" />
    </td>
    <td>
      <span class="time-display">15:30</span>
      <input type="time" value="15:30" style="display: none;" />
    </td>
    <td><input type="text" placeholder="Work description" /></td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;

  makeTimeCellsClickable(row);
}

function addSubRow() {
  const table = document.getElementById("subTable");
  const row = table.insertRow();
  row.innerHTML = `
    <td><input type="text" placeholder="Name" /></td>
    <td><span class="time-display">07:00</span><input type="time" value="07:00" style="display: none;" /></td>
    <td><span class="time-display">15:30</span><input type="time" value="15:30" style="display: none;" /></td>
    <td><input type="text" placeholder="Work description" /></td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;
  makeTimeCellsClickable(row);
}

function addPlantRow() {
  const table = document.getElementById("plantTable");
  const row = table.insertRow();

  // Build the options HTML dynamically
  let optionsHtml = `<option value="">Select...</option>`;
  plant.forEach(item => {
    optionsHtml += `<option value="${item}">${item}</option>`;
  });

  row.innerHTML = `
    <td>
      <select>${optionsHtml}</select>
    </td>
    <td><input type="text" placeholder="Work description" /></td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;
}


function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
}

// Make time cells clickable to open time input
function makeTimeCellsClickable(row) {
  const timeCells = [row.children[1], row.children[2]]; // Time In and Time Out columns
  timeCells.forEach(cell => {
    if (cell) {
      const timeInput = cell.querySelector('input[type="time"]');
      const timeDisplay = cell.querySelector('.time-display');
      if (timeInput && timeDisplay) {
        cell.style.cursor = 'pointer';
        
        // Update display when time changes
        timeInput.addEventListener('change', () => {
          timeDisplay.textContent = timeInput.value || '';
        });
        
        // Update display on input (for real-time updates)
        timeInput.addEventListener('input', () => {
          timeDisplay.textContent = timeInput.value || '';
        });
        
        cell.addEventListener('click', (e) => {
          // Don't trigger if clicking directly on the input
          if (e.target !== timeInput) {
            timeInput.showPicker ? timeInput.showPicker() : timeInput.focus();
          }
        });
      }
    }
  });
}



async function submitForm() {
    // --- Main info ---
    const name = document.getElementById("nameInput").value || "";
    const site = document.getElementById("siteInput").value || "";
    const weather = document.getElementById("weatherInput").value || "";
    const dateValue = document.getElementById("dateInput").value;
    const date = dateValue ? new Date(dateValue).getTime() / (1000*60*60*24) : "";
    const log = document.getElementById("notesInput").value || "";

    // --- Employees (max 5) ---
    const employeeRows = [...document.querySelectorAll("#employeeTable tr")].slice(1)
        .slice(0, 5) // only take first 5
        .map(row => {
            const cells = row.children;
            const nameInput = cells[0].querySelector("input") || cells[0].querySelector("select");
            const timeIn = cells[1].querySelector("input") ? timeToExcelFraction(cells[1].querySelector("input").value) : "";
            const timeOut = cells[2].querySelector("input") ? timeToExcelFraction(cells[2].querySelector("input").value) : "";
            const desc = cells[3].querySelector("input") ? cells[3].querySelector("input").value : "";
            return [nameInput ? nameInput.value : "", timeIn, timeOut, desc];
        });

    // Pad to 5 employees
    while (employeeRows.length < 5) {
        employeeRows.push(["", "", "", ""]);
    }

    // Flatten employees
    const flatEmployees = employeeRows.flat();

    // --- Subcontractors (max 5) ---
    const subRows = [...document.querySelectorAll("#subTable tr")].slice(1)
        .slice(0, 5)
        .map(row => {
            const cells = row.children;
            const name = cells[0].querySelector("input") ? cells[0].querySelector("input").value : "";
            const timeIn = cells[1].querySelector("input") ? timeToExcelFraction(cells[1].querySelector("input").value) : "";
            const timeOut = cells[2].querySelector("input") ? timeToExcelFraction(cells[2].querySelector("input").value) : "";
            const desc = cells[3].querySelector("input") ? cells[3].querySelector("input").value : "";
            return [name, timeIn, timeOut, desc];
        });

    // Pad to 5 subcontractors
    while (subRows.length < 5) {
        subRows.push(["", "", "", ""]);
    }

    // Flatten subcontractors
    const flatSubs = subRows.flat();

    // --- Combine everything into a single row ---
    const fullRow = [name, date, site, weather, log, ...flatEmployees, ...flatSubs];

    await addRowsToTable("Table1", [fullRow]);
}

// --- Helper: convert HH:MM to Excel fraction ---
function timeToExcelFraction(timeStr) {
    if(!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return (h + m/60) / 24;
}


// --- Function to add rows to a table ---
async function addRowsToTable(tableName, payload) {
    const filePath = '/Data.xlsx'
    const token = await getAccessToken();

    const otherUser = "admin@jamessamuelsbuilder.com.au"; // or user ID
    const fileName = "Data.xlsx";
    const tableId = "Table1";

    const url = `https://graph.microsoft.com/v1.0/users('${otherUser}')/drive/root:/${fileName}:/workbook/tables('${tableId}')/rows/add`;


    // if (!rows.length) return;
    // const url = `https://graph.microsoft.com/v1.0/me/drive/root:${filePath}:/workbook/tables/${tableName}/rows/add`;
    // const body = { values: rows };
    console.log("Posting Request With Data: ", payload)
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: payload })
    });
    console.log("Posting Done: ", res)
    if (!res.ok) {
        const err = await res.json();
        console.error(`Error adding to ${tableName}:`, err);
        alert(`Error adding to ${tableName}`);
    }
}

// Convert HH:MM to Excel fraction
function timeToExcelFraction(timeStr) {
  if(!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h + m/60) / 24;
}

// Weather API - Site coordinates mapping
const siteCoordinates = {
  "Sydenham": { latitude: -37.8167, longitude: 145.0000 }, // Melbourne area
  // Add more sites as needed
};

// Fetch and update weather
async function updateWeather() {
  const siteInput = document.getElementById("siteInput");
  const weatherInput = document.getElementById("weatherInput");
  
  if (!siteInput || !weatherInput) return;
  
  const site = siteInput.value;
  if (!site) {
    // If no site selected, try to get location from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
        },
        async () => {
          // Fallback to default location (Melbourne)
          await fetchWeatherByCoordinates(-37.8167, 145.0000);
        }
      );
    } else {
      // Fallback to default location
      await fetchWeatherByCoordinates(-37.8167, 145.0000);
    }
    return;
  }
  
  const coordinates = siteCoordinates[site];
  if (coordinates) {
    await fetchWeatherByCoordinates(coordinates.latitude, coordinates.longitude);
  } else {
    // If site not in mapping, try geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
        },
        async () => {
          await fetchWeatherByCoordinates(-37.8167, 145.0000);
        }
      );
    } else {
      await fetchWeatherByCoordinates(-37.8167, 145.0000);
    }
  }
}

async function getWeatherDescription() {
  const weatherInput = document.getElementById("weatherInput");
  if (!weatherInput) return;
  
  const lat = -37.8167;
  const lon = 145.0000;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  const code = data.current.weather_code;
  const temp = data.current.temperature_2m;

  // Weather condition descriptions
  const weatherDescriptions = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Heavy Hail"
  };
  
  const description = weatherDescriptions[Number(code)] || "Unknown weather";
  weatherInput.value = `${description} · ${temp}°C`;
}


async function fetchWeatherByCoordinates(latitude, longitude) {
  const weatherInput = document.getElementById("weatherInput");
  if (!weatherInput) return;
  
  try {
    // Using Open-Meteo API (free, no API key required)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
    );
    
    if (!response.ok) {
      throw new Error("Weather API request failed");
    }
    
    const data = await response.json();
    
    if (data.current) {
      const temperature = Math.round(data.current.temperature_2m);
      const weatherCode = data.current.weather_code;
      const description = weatherDescriptions[weatherCode] || "Unknown";
      
      weatherInput.value = `${description} · ${temperature}°C`;
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherInput.value = "Unable to fetch weather";
  }
}

// Update weather when page loads and when site changes
document.addEventListener("DOMContentLoaded", () => {
  // updateWeather();
  
  // const siteInput = document.getElementById("siteInput");
  // if (siteInput) {
  //   siteInput.addEventListener("change", updateWeather);
  // }
  
  // Make existing time cells clickable
  const employeeRows = document.querySelectorAll("#employeeTable tr");
  employeeRows.forEach(row => {
    if (row.children.length > 0) {
      makeTimeCellsClickable(row);
    }
  });
  
  const subRows = document.querySelectorAll("#subTable tr");
  subRows.forEach(row => {
    if (row.children.length > 0) {
      makeTimeCellsClickable(row);
    }
  });
});


