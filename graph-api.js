const user_id = "admin@jamessamuelsbuilder.com.au";
// const user_id = "f4a20bd0-3ffe-4dc5-976e-236a111d4e52";
const onedrive_root = `https://graph.microsoft.com/v1.0/users('${user_id}')/drive/root:/JSB`

// https://graph.microsoft.com/v1.0/users('${user_id}')/drive/root:/JSB/Company/CompanyData.xlsx:/workbook/tables(Emp_Table)/rows

async function getUsers(token) {
  const my_url = 'https://graph.microsoft.com/v1.0/users?$select=displayName'
  const response =  await fetch(my_url, {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      }
  });
  const data = await response.json();
  const rows = data.value.flat()
    .map(item => item.displayName);
  return rows;
}

async function getSites(token) {
  const url = `${onedrive_root}/Company/CompanyData.xlsx:/workbook/tables/Sites/columns/Name`;
  const response =  await fetch(url, {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      }
  });
  const data = await response.json();
  const rows = data.values.flat().slice(1)
  return rows;
}


async function getEmployees(token) {
  const url = `${onedrive_root}/Company/CompanyData.xlsx:/workbook/tables/Emp_Table/columns/Name`;
  const response =  await fetch(url, {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      }
  });
  const data = await response.json();
  const rows = data.values.flat().slice(1)
  return rows;
}

async function getPlant(token) {
  const url = `${onedrive_root}/Company/CompanyData.xlsx:/workbook/tables/Plant_Table/columns/Name`;
  const response =  await fetch(url, {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      }
  });
  const data = await response.json();
  const rows = data.values.flat().slice(1)
  return rows;
}

// Auth functions (getAccount, getAccessToken, setAccount) are now in auth.js
async function getCompanyData(token){
  try {

    const me = await getUsers(token)

    const employees = await getEmployees(token);

    const plant = await getPlant(token);

    const sites = await getSites(token);    
    
    return [me, employees, plant, sites];

  } catch (err) {
      console.error(err);
      alert("Error reading table: " + err.message);
  }

}

async function postDetails(token, url, details) {
  const details_url = `${url}/tables/Details/rows/add`;
  return await fetch(details_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [["API", ...details]] })
  });
}

async function postEmplyees(token, url, employees) {
  const employees_url = `${url}/tables/Employees/rows/add`;
  return await fetch(employees_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values:  employees })
  });
}

async function postSubs(token, url, subs) {
  const subs_url = `${url}/tables/Subcontractors/rows/add`;
  return await fetch(subs_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values:  subs })
  });
}

async function postPlant(token, url, plant) {
  const plant_url = `${url}/tables/Plant/rows/add`;
  return await fetch(plant_url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values:  plant })
  });
}

// --- Function to add rows to a table ---
async function postForm(project, token, details, subs, emps, plant) {

  const timesheet_url = `${onedrive_root}/Projects/${project}/TimeSheets/TimeSheets.xlsx:/workbook` //`/tables('${tableName}')/rows/add`;
  postDetails(token, timesheet_url, details)
  if (subs.length > 0) postSubs(token, timesheet_url, subs)
  if (emps.length > 0) postEmplyees(token, timesheet_url, emps)
  if (plant.length > 0) postPlant(token, timesheet_url, plant)

}