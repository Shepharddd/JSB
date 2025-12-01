// MSAL Login
const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "911b26da-32a3-4e6f-b3a7-6ec57e5063a2",
    authority: "https://login.microsoftonline.com/common",
    // redirectUri: window.location.origin,
    redirectUri: "https://timesheets.jamessamuelsbuilder.com.au/"
  },
  system: {
    navigateToLoginRequestUrl: false
  }
});

function setToday() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dateInput").value = today;
}

let ACCOUNT = null;

function setAccount(account) {
  ACCOUNT = account;
  console.log(ACCOUNT)
  getCompanyData();
}

async function getAccessToken() {
  console.log("Account: ", ACCOUNT)
  if (!ACCOUNT) return;

  const token = await msalInstance.acquireTokenSilent({
    scopes: ["User.Read"],
    account: ACCOUNT,
  });

  console.log(token.accessToken)
  return token.access_token;
}

async function login() {
  const loginRequest = {
    scopes: ["User.Read"] // permissions you need
  };

  await msalInstance.loginPopup(loginRequest)
    .then((loginResponse) => {
      console.log("Logged in user:", loginResponse.account.username);
      // hide your popup here if login succeeds
      closePopup();
    })
    .catch((error) => {
      console.error(error);
    });
}


async function getAccount() {
  try {
    const result = await msalInstance.handleRedirectPromise();
  
    if (result) {
      console.log("Logged in:", result.account.username);

      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0])
        // getCompanyData();
          // // User is logged in
          // const activeAccount = accounts[0]; // You can pick the first one or manage multiple accounts
          // console.log("User is logged in:", activeAccount.username);
      } else {
          // No user is logged in
          console.log("No user is logged in");
          msalInstance.loginRedirect({
            scopes: ["User.Read"]
          });
      }
      return;
    }
  
  } catch (error) {
    console.log(error)
  }
}

async function getCompanyData(){
  const token = await getAccessToken();
  const url = 'https://default68237f8abf3c425bb92b9518c6d4bf.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1d22896883294970a2ca02e4d4ce2a8b/triggers/manual/paths/invoke?api-version=1';
  try {
    const response = await fetch(url, {
      method: 'POST', // Power Automate manual trigger usually expects POST
      headers: {
        'Content-Type': 'application/json',
        ...({ 'Authorization': `Bearer ${token}` })
      },
      // Optional: only include if your flow expects input JSON
      body: JSON.stringify({
        filter: 'optionalFilterValue'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    console.log(data)
    
  } catch (error) {
    console.log(error)
    // document.getElementById('output').textContent = 'Error: ' + error;
  }

}

async function init() {
  setToday();
  getWeatherDescription();
  // login();
  await getAccount();

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
  row.innerHTML = `
    <td><select><option value="">Select...</option></select></td>
    <td><span class="time-display">07:00</span><input type="time" value="07:00" style="display: none;" /></td>
    <td><span class="time-display">15:30</span><input type="time" value="15:30" style="display: none;" /></td>
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
  row.innerHTML = `
    <td><select><option value="">Select...</option></select></td>
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

// async function submitForm() {

//   try {
//     const result = await msalInstance.loginPopup({ scopes: ["Files.ReadWrite"] });
//     console.log(result);
//     document.getElementById("loginStatus").innerText = `Logged in as ${result.account.username}`;
//   } catch (err) {
//     console.error("[Sign In Error]: ",err);
//   }

  
//   const payload = {
//     name: document.getElementById("nameInput").value,
//     site: document.getElementById("siteInput").value,
//     weather: document.getElementById("weatherInput").value,
//     date: document.getElementById("dateInput").value,
//     notes: document.getElementById("notesInput").value,
//     employees: [...document.querySelectorAll("#employeeTable tr")] .slice(1).map(row => ({
//     name: row.children[0].querySelector("input").value,
//     timeIn: row.children[1].querySelector("input").value,
//     timeOut: row.children[2].querySelector("input").value,
//     works: row.children[3].querySelector("input").value,
//   })),
//     subcontractors: [...document.querySelectorAll("#subTable tr")] .slice(1).map(row => ({
//       name: row.children[0].querySelector("input").value,
//       timeIn: row.children[1].querySelector("input").value,
//       timeOut: row.children[2].querySelector("input").value,
//       works: row.children[3].querySelector("input").value,
//     })),
//   };

//   fetch("YOUR_POWER_AUTOMATE_WEBHOOK_URL", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload)
//   })
//   .then(res => alert("Submitted!"))
//   .catch(err => alert("Error submitting"));
// }

function submitForm() {
  // Get basic info
  const name = document.getElementById("nameInput").value;
  const site = document.getElementById("siteInput").value;
  const weather = document.getElementById("weatherInput").value;
  const date = new Date(document.getElementById("dateInput").value).getTime() / (1000*60*60*24); // Excel date number
  const notes = document.getElementById("notesInput").value;

  // Flatten employees
  const employees = [...document.querySelectorAll("#employeeTable tr")].slice(1)
    .flatMap(row => {
      const cells = row.children;
      const nameInput = cells[0].querySelector("input") || cells[0].querySelector("select");
      return [
        nameInput ? nameInput.value : "",                          // Name
        timeToExcelFraction(cells[1].querySelector("input").value), // Time In fraction
        timeToExcelFraction(cells[2].querySelector("input").value), // Time Out fraction
        cells[3].querySelector("input").value                      // Work description
      ];
    });

  // Flatten subcontractors
  const subcontractors = [...document.querySelectorAll("#subTable tr")].slice(1)
    .flatMap(row => {
      const cells = row.children;
      return [
        cells[0].querySelector("input").value,
        timeToExcelFraction(cells[1].querySelector("input").value),
        timeToExcelFraction(cells[2].querySelector("input").value),
        cells[3].querySelector("input").value
      ];
    });
  
  // Note: Plant/Equipment data is not currently included in the submission
  // Add it here if needed in the future

  // Merge all into a single array (following your example)
  const resultArray = [
    [name, date, site, weather, notes, ...employees, ...subcontractors]
  ];

  // Send as string under "result"
  const payload = {
    result: JSON.stringify(resultArray)
  };

  fetch("https://default68237f8abf3c425bb92b9518c6d4bf.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/95a3332058cc435ba3dc09ec8454ab2e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uQZO00H7wt1z8RHqtiLH5mhVO30CboF2_wSHvH9uB-U", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => alert("Submitted!"))
  .catch(err => alert("Error submitting"));
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

