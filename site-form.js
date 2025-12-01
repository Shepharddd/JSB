// Auth functions are now in auth.js

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

// Auth functions (getAccount, getAccessToken, setAccount) are now in auth.js
async function getCompanyData(){
  try {
        // Get access token
        const token = await getAccessToken();
        if (!token) throw new Error("No access token available");

        const otherUser = "admin@jamessamuelsbuilder.com.au"; // or user ID
        const fileName = "Data.xlsx";
        const tableId = "Table13";

        const url = `https://graph.microsoft.com/v1.0/users('${otherUser}')/drive/root:/${fileName}:/workbook/tables('${tableId}')/rows`;

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
        addEmployees([...employees, ...foremen])
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
}

init();

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
    <td class="time-cell" onclick="openTimeModal(this, 'Time In')">
      <span class="time-display">07:00</span>
      <input type="hidden" class="time-input" value="07:00" />
    </td>
    <td class="time-cell" onclick="openTimeModal(this, 'Time Out')">
      <span class="time-display">15:30</span>
      <input type="hidden" class="time-input" value="15:30" />
    </td>
    <td class="work-desc-cell" onclick="openWorkDescModal(this)">
      <span class="work-desc-display empty">Click to add description</span>
      <input type="hidden" class="work-desc-input" value="" />
    </td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;

}

function addSubRow() {
  const table = document.getElementById("subTable");
  const row = table.insertRow();
  row.innerHTML = `
    <td class="sub-name-cell" onclick="openSubNameModal(this)">
      <span class="sub-name-display empty">Click to add name</span>
      <input type="hidden" class="sub-name-input" value="" />
    </td>
    <td class="time-cell" onclick="openTimeModal(this, 'Time In')">
      <span class="time-display">07:00</span>
      <input type="hidden" class="time-input" value="07:00" />
    </td>
    <td class="time-cell" onclick="openTimeModal(this, 'Time Out')">
      <span class="time-display">15:30</span>
      <input type="hidden" class="time-input" value="15:30" />
    </td>
    <td class="work-desc-cell" onclick="openWorkDescModal(this)">
      <span class="work-desc-display empty">Click to add description</span>
      <input type="hidden" class="work-desc-input" value="" />
    </td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;
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
    <td class="work-desc-cell" onclick="openWorkDescModal(this)">
      <span class="work-desc-display empty">Click to add description</span>
      <input type="hidden" class="work-desc-input" value="" />
    </td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;
}


function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
}

// Time Modal Functions
let currentTimeCell = null;

function openTimeModal(cell, title) {
  currentTimeCell = cell;
  const modal = document.getElementById("timeModal");
  const timeInput = document.getElementById("timeInput");
  const modalTitle = document.getElementById("timeModalTitle");
  const hiddenInput = cell.querySelector('.time-input');
  const display = cell.querySelector('.time-display');
  
  // Set modal title
  modalTitle.textContent = title;
  
  // Load existing value
  timeInput.value = hiddenInput ? hiddenInput.value : '';
  
  // Show modal
  modal.style.display = 'flex';
  timeInput.focus();
}

function closeTimeModal() {
  const modal = document.getElementById("timeModal");
  modal.style.display = 'none';
  currentTimeCell = null;
}

function saveTime() {
  if (!currentTimeCell) return;
  
  const timeInput = document.getElementById("timeInput");
  const hiddenInput = currentTimeCell.querySelector('.time-input');
  const display = currentTimeCell.querySelector('.time-display');
  
  const value = timeInput.value;
  
  // Save to hidden input
  if (hiddenInput) {
    hiddenInput.value = value;
  }
  
  // Update display
  if (display) {
    display.textContent = value || '--:--';
  }
  
  closeTimeModal();
}

// Subcontractor Name Modal Functions
let currentSubNameCell = null;

function openSubNameModal(cell) {
  currentSubNameCell = cell;
  const modal = document.getElementById("subNameModal");
  const textInput = document.getElementById("subNameInput");
  const hiddenInput = cell.querySelector('.sub-name-input');
  const display = cell.querySelector('.sub-name-display');
  
  // Load existing value
  textInput.value = hiddenInput ? hiddenInput.value : '';
  
  // Show modal
  modal.style.display = 'flex';
  textInput.focus();
}

function closeSubNameModal() {
  const modal = document.getElementById("subNameModal");
  modal.style.display = 'none';
  currentSubNameCell = null;
}

function saveSubName() {
  if (!currentSubNameCell) return;
  
  const textInput = document.getElementById("subNameInput");
  const hiddenInput = currentSubNameCell.querySelector('.sub-name-input');
  const display = currentSubNameCell.querySelector('.sub-name-display');
  
  const value = textInput.value.trim();
  
  // Save to hidden input
  if (hiddenInput) {
    hiddenInput.value = value;
  }
  
  // Update display
  if (display) {
    if (value) {
      display.textContent = value;
      display.classList.remove('empty');
    } else {
      display.textContent = 'Click to add name';
      display.classList.add('empty');
    }
  }
  
  closeSubNameModal();
}

// Work Description Modal Functions
let currentWorkDescCell = null;

function openWorkDescModal(cell) {
  currentWorkDescCell = cell;
  const modal = document.getElementById("workDescModal");
  const textarea = document.getElementById("workDescTextarea");
  const hiddenInput = cell.querySelector('.work-desc-input');
  const display = cell.querySelector('.work-desc-display');
  
  // Load existing value
  textarea.value = hiddenInput ? hiddenInput.value : '';
  
  // Show modal
  modal.style.display = 'flex';
  textarea.focus();
}

function closeWorkDescModal() {
  const modal = document.getElementById("workDescModal");
  modal.style.display = 'none';
  currentWorkDescCell = null;
}

function saveWorkDescription() {
  if (!currentWorkDescCell) return;
  
  const textarea = document.getElementById("workDescTextarea");
  const hiddenInput = currentWorkDescCell.querySelector('.work-desc-input');
  const display = currentWorkDescCell.querySelector('.work-desc-display');
  
  const value = textarea.value.trim();
  
  // Save to hidden input
  if (hiddenInput) {
    hiddenInput.value = value;
  }
  
  // Update display
  if (display) {
    if (value) {
      display.textContent = value.length > 50 ? value.substring(0, 50) + '...' : value;
      display.classList.remove('empty');
    } else {
      display.textContent = 'Click to add description';
      display.classList.add('empty');
    }
  }
  
  closeWorkDescModal();
}

// Close modals when clicking outside
window.onclick = function(event) {
  const workDescModal = document.getElementById("workDescModal");
  const timeModal = document.getElementById("timeModal");
  const subNameModal = document.getElementById("subNameModal");
  if (event.target === workDescModal) {
    closeWorkDescModal();
  }
  if (event.target === timeModal) {
    closeTimeModal();
  }
  if (event.target === subNameModal) {
    closeSubNameModal();
  }
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
            const timeInInput = cells[1].querySelector(".time-input");
            const timeOutInput = cells[2].querySelector(".time-input");
            const timeIn = timeInInput ? timeToExcelFraction(timeInInput.value) : "";
            const timeOut = timeOutInput ? timeToExcelFraction(timeOutInput.value) : "";
            const descInput = cells[3].querySelector(".work-desc-input");
            const desc = descInput ? descInput.value : "";
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
            const nameInput = cells[0].querySelector(".sub-name-input");
            const name = nameInput ? nameInput.value : "";
            const timeInInput = cells[1].querySelector(".time-input");
            const timeOutInput = cells[2].querySelector(".time-input");
            const timeIn = timeInInput ? timeToExcelFraction(timeInInput.value) : "";
            const timeOut = timeOutInput ? timeToExcelFraction(timeOutInput.value) : "";
            const descInput = cells[3].querySelector(".work-desc-input");
            const desc = descInput ? descInput.value : "";
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
  // Time cells are now handled via onclick handlers in the HTML
});


