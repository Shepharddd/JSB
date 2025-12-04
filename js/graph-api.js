/**
 * Microsoft Graph API Module
 * Handles all interactions with Microsoft Graph API
 */

const GRAPH_API = {
  ONEDRIVE_ROOT: `https://graph.microsoft.com/v1.0/users('${CONFIG.GRAPH_API.USER_ID}')/drive/root:/JSB`
};

/**
 * Fetches users from a Microsoft 365 group
 * @param {string} token - The access token
 * @returns {Promise<Array>} Array of user display names
 */
async function getUsersFromGroup(token) {
  const url = `https://graph.microsoft.com/v1.0/groups/${CONFIG.GRAPH_API.GROUP_ID}/members?$select=displayName`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  const data = await response.json();
  console.log("Users data:", data);
  const rows = data.value.flat()
    .map(item => item.displayName);
  console.log("Users rows:", rows);
  return rows;
}

/**
 * Fetches sites from the company data Excel file
 * @param {string} token - The access token
 * @returns {Promise<Array>} Array of site names
 */
async function getSitesFromExcel(token) {
  const url = `${GRAPH_API.ONEDRIVE_ROOT}/Company/CompanyData.xlsx:/workbook/tables/Sites/columns/Name`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch sites: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  const data = await response.json();
  const rows = data.values.flat().slice(1);
  return rows;
}

/**
 * Fetches employees from the company data Excel file
 * @param {string} token - The access token
 * @returns {Promise<Array>} Array of employee names
 */
async function getEmployeesFromExcel(token) {
  const url = `${GRAPH_API.ONEDRIVE_ROOT}/Company/CompanyData.xlsx:/workbook/tables/Emp_Table/columns/Name`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  const data = await response.json();
  const rows = data.values.flat().slice(1);
  return rows;
}

/**
 * Fetches plant/equipment from the company data Excel file
 * @param {string} token - The access token
 * @returns {Promise<Array>} Array of plant names
 */
async function getPlantFromExcel(token) {
  const url = `${GRAPH_API.ONEDRIVE_ROOT}/Company/CompanyData.xlsx:/workbook/tables/Plant_Table/columns/Name`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch plant: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  const data = await response.json();
  const rows = data.values.flat().slice(1);
  return rows;
}

/**
 * Fetches all company data (users, employees, plant, sites)
 * @param {string} token - The access token
 * @returns {Promise<Array>} Array containing [users, employees, plant, sites]
 */
async function getCompanyData(token) {
  try {
    const [users, employees, plant, sites] = await Promise.all([
      getUsersFromGroup(token),
      getEmployeesFromExcel(token),
      getPlantFromExcel(token),
      getSitesFromExcel(token)
    ]);
    
    return [users, employees, plant, sites];
  } catch (err) {
    console.error("Error reading company data:", err);
    throw new Error(`Failed to load company data: ${err.message}`);
  }
}

/**
 * Posts details to the timesheet
 * @param {string} token - The access token
 * @param {string} url - The timesheet URL
 * @param {Array} details - Array of detail values
 * @returns {Promise<Response>} The fetch response
 */
async function postDetails(token, url, details) {
  const details_url = `${url}/tables/Details/rows/add`;
  const response = await fetch(details_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [["API", ...details]] })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to post details: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  return response;
}

/**
 * Posts employees to the timesheet
 * @param {string} token - The access token
 * @param {string} url - The timesheet URL
 * @param {Array} employees - Array of employee rows
 * @returns {Promise<Response>} The fetch response
 */
async function postEmplyees(token, url, employees) {
  const employees_url = `${url}/tables/Employees/rows/add`;
  const response = await fetch(employees_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: employees })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to post employees: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  return response;
}

/**
 * Posts subcontractors to the timesheet
 * @param {string} token - The access token
 * @param {string} url - The timesheet URL
 * @param {Array} subs - Array of subcontractor rows
 * @returns {Promise<Response>} The fetch response
 */
async function postSubs(token, url, subs) {
  const subs_url = `${url}/tables/Subcontractors/rows/add`;
  const response = await fetch(subs_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: subs })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to post subcontractors: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  return response;
}

/**
 * Posts plant/equipment to the timesheet
 * @param {string} token - The access token
 * @param {string} url - The timesheet URL
 * @param {Array} plant - Array of plant rows
 * @returns {Promise<Response>} The fetch response
 */
async function postPlant(token, url, plant) {
  const plant_url = `${url}/tables/Plant/rows/add`;
  const response = await fetch(plant_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: plant })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to post plant: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
  }
  
  return response;
}

/**
 * Posts form data to the timesheet
 * @param {string} project - The project/site name
 * @param {string} token - The access token
 * @param {Array} details - Array of detail values
 * @param {Array} subs - Array of subcontractor rows
 * @param {Array} emps - Array of employee rows
 * @param {Array} plant - Array of plant rows
 * @returns {Promise<void>}
 */
async function postForm(project, token, details, subs, emps, plant) {
  try {
    const timesheet_url = `${GRAPH_API.ONEDRIVE_ROOT}/Data/TimeSheets.xlsx:/workbook`;
    
    // Post all data in parallel where possible
    const promises = [postDetails(token, timesheet_url, details)];
    
    if (subs.length > 0) {
      promises.push(postSubs(token, timesheet_url, subs));
    }
    if (emps.length > 0) {
      promises.push(postEmplyees(token, timesheet_url, emps));
    }
    if (plant.length > 0) {
      promises.push(postPlant(token, timesheet_url, plant));
    }
    
    await Promise.all(promises);
  } catch (err) {
    console.error("Error posting form data:", err);
    throw new Error(`Failed to submit form: ${err.message}`);
  }
}

