/**
 * Weather API Module
 * Handles weather data fetching and display
 */

/**
 * Site coordinates mapping for weather lookup
 */
const SITE_COORDINATES = {
  "Sydenham": { latitude: -37.8167, longitude: 145.0000 }, // Melbourne area
  // Add more sites as needed
};

/**
 * Weather condition code descriptions
 */
const WEATHER_DESCRIPTIONS = {
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

/**
 * Fetches weather data by coordinates
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @returns {Promise<void>}
 */
async function fetchWeatherByCoordinates(latitude, longitude) {
  const weatherInput = getElementById("weatherInput");
  if (!weatherInput) return;
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Weather API request failed");
    }
    
    const data = await response.json();
    
    if (data.current) {
      const temperature = Math.round(data.current.temperature_2m);
      const weatherCode = data.current.weather_code;
      const description = WEATHER_DESCRIPTIONS[weatherCode] || "Unknown";
      
      weatherInput.value = `${description} · ${temperature}°C`;
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherInput.value = "Unable to fetch weather";
  }
}

/**
 * Gets weather description for default location
 * @returns {Promise<void>}
 */
async function getWeatherDescription() {
  const weatherInput = getElementById("weatherInput");
  if (!weatherInput) return;
  
  const lat = CONFIG.DEFAULTS.DEFAULT_LATITUDE;
  const lon = CONFIG.DEFAULTS.DEFAULT_LONGITUDE;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Weather API request failed");
    }
    
    const data = await res.json();
    
    if (data.current) {
      const code = data.current.weather_code;
      const temp = data.current.temperature_2m;
      const description = WEATHER_DESCRIPTIONS[Number(code)] || "Unknown weather";
      weatherInput.value = `${description} · ${temp}°C`;
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherInput.value = "Unable to fetch weather";
  }
}

/**
 * Updates weather based on selected site
 * @returns {Promise<void>}
 */
async function updateWeather() {
  const siteInput = getElementById("siteInput");
  const weatherInput = getElementById("weatherInput");
  
  if (!siteInput || !weatherInput) return;
  
  const site = siteInput.value;
  
  // If no site selected, try geolocation or use default
  if (!site) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
        },
        async () => {
          // Fallback to default location
          await fetchWeatherByCoordinates(
            CONFIG.DEFAULTS.DEFAULT_LATITUDE, 
            CONFIG.DEFAULTS.DEFAULT_LONGITUDE
          );
        }
      );
    } else {
      // Fallback to default location
      await fetchWeatherByCoordinates(
        CONFIG.DEFAULTS.DEFAULT_LATITUDE, 
        CONFIG.DEFAULTS.DEFAULT_LONGITUDE
      );
    }
    return;
  }
  
  // Use site coordinates if available
  const coordinates = SITE_COORDINATES[site];
  if (coordinates) {
    await fetchWeatherByCoordinates(coordinates.latitude, coordinates.longitude);
  } else {
    // If site not in mapping, try geolocation or use default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
        },
        async () => {
          await fetchWeatherByCoordinates(
            CONFIG.DEFAULTS.DEFAULT_LATITUDE, 
            CONFIG.DEFAULTS.DEFAULT_LONGITUDE
          );
        }
      );
    } else {
      await fetchWeatherByCoordinates(
        CONFIG.DEFAULTS.DEFAULT_LATITUDE, 
        CONFIG.DEFAULTS.DEFAULT_LONGITUDE
      );
    }
  }
}

