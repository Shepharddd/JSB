
/**
 * Fetches all company data (users, employees, plant, sites)
 * @param {string} token - The access token
 * @returns {Promise<Array>} Array containing [users, employees, plant, sites]
 */
async function getCompanyData(token) {
  try {

    const url = `https://default68237f8abf3c425bb92b9518c6d4bf.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/309d786d9292408bad9e028106830362/triggers/manual/paths/invoke?api-version=1`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.accessToken}`,
        "Content-Type": "application/json"
      }
    });
    data = await response.json()
    
    return [[...data.Managers, ...data.Admins], data.Plants, data.Projects];
  } catch (err) {
    console.error("Error reading company data:", err);
    throw new Error(`Failed to load company data: ${err.message}`);
  }
}

/**
 * Posts form data to the timesheet
 * @param {string} token - The access token
 * @param {string} json - The project/site name
 * @returns {Promise<void>}
 */
async function postForm(json, token) {
  try {
    const url = `https://default68237f8abf3c425bb92b9518c6d4bf.18.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/79ae499d08c640178282b660cd060fd6/triggers/manual/paths/invoke?api-version=1`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: json
    });
  } catch (err) {
    console.error("Error posting form data:", err);
    throw new Error(`Failed to submit form: ${err.message}`);
  }
}

