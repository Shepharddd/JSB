/**
 * Table Handler
 * Manages table row operations (add, delete) for employees, subcontractors, and plant
 */

/**
 * Creates an employee row in the employee table
 */
function addEmployeeRow() {
  const table = getElementById("employeeTable");
  if (!table) return;

  const row = table.insertRow();
  const employees = getEmployees();

  console.log("Employees:", employees);

  // Build the options HTML dynamically
  let optionsHtml = `<option value="">Select...</option>`;
  employees.forEach(emp => {
    optionsHtml += `<option value="${escapeHtml(emp)}">${escapeHtml(emp)}</option>`;
  });

  const defaultTimeIn = CONFIG.DEFAULTS.DEFAULT_TIME_IN;
  const defaultTimeOut = CONFIG.DEFAULTS.DEFAULT_TIME_OUT;

  row.innerHTML = `
    <td>
      <select>${optionsHtml}</select>
    </td>
    <td class="time-cell" data-action="time" data-title="Time In">
      <span class="time-display">${defaultTimeIn}</span>
      <input type="hidden" class="time-input" value="${defaultTimeIn}" />
    </td>
    <td class="time-cell" data-action="time" data-title="Time Out">
      <span class="time-display">${defaultTimeOut}</span>
      <input type="hidden" class="time-input" value="${defaultTimeOut}" />
    </td>
    <td class="work-desc-cell" data-action="work-desc">
      <span class="work-desc-display empty">Click to add description</span>
      <input type="hidden" class="work-desc-input" value="" />
    </td>
    <td><button class="delete-btn" data-action="delete">Delete</button></td>
  `;
}

/**
 * Creates a subcontractor row in the subcontractor table
 */
function addSubRow() {
  const table = getElementById("subTable");
  if (!table) return;

  const row = table.insertRow();
  const defaultTimeIn = CONFIG.DEFAULTS.DEFAULT_TIME_IN;
  const defaultTimeOut = CONFIG.DEFAULTS.DEFAULT_TIME_OUT;

  row.innerHTML = `
    <td class="sub-name-cell" data-action="sub-name">
      <span class="sub-name-display empty">Click to add name</span>
      <input type="hidden" class="sub-name-input" value="" />
    </td>
    <td class="time-cell" data-action="time" data-title="Time In">
      <span class="time-display">${defaultTimeIn}</span>
      <input type="hidden" class="time-input" value="${defaultTimeIn}" />
    </td>
    <td class="time-cell" data-action="time" data-title="Time Out">
      <span class="time-display">${defaultTimeOut}</span>
      <input type="hidden" class="time-input" value="${defaultTimeOut}" />
    </td>
    <td class="work-desc-cell" data-action="work-desc">
      <span class="work-desc-display empty">Click to add description</span>
      <input type="hidden" class="work-desc-input" value="" />
    </td>
    <td><button class="delete-btn" data-action="delete">Delete</button></td>
  `;
}

/**
 * Creates a plant/equipment row in the plant table
 */
function addPlantRow() {
  const table = getElementById("plantTable");
  if (!table) return;

  const row = table.insertRow();
  const plant = getPlant();

  // Build the options HTML dynamically
  let optionsHtml = `<option value="">Select...</option>`;
  plant.forEach(item => {
    optionsHtml += `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`;
  });

  row.innerHTML = `
    <td>
      <select>${optionsHtml}</select>
    </td>
    <td class="work-desc-cell" data-action="work-desc">
      <span class="work-desc-display empty">Click to add description</span>
      <input type="hidden" class="work-desc-input" value="" />
    </td>
    <td><button class="delete-btn" data-action="delete">Delete</button></td>
  `;
}

/**
 * Deletes a table row
 * @param {HTMLElement} button - The delete button element
 */
function deleteRow(button) {
  const row = button.closest("tr");
  if (row) {
    row.remove();
  }
}

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initializes table event handlers using event delegation
 */
function initTableHandlers() {
  // Handle clicks on table cells with data-action attributes
  document.addEventListener('click', (event) => {
    const cell = event.target.closest('[data-action]');
    if (!cell) return;

    const action = cell.getAttribute('data-action');
    
    switch (action) {
      case 'time':
        const title = cell.getAttribute('data-title') || 'Time';
        openTimeModal(cell, title);
        break;
      case 'work-desc':
        openWorkDescModal(cell);
        break;
      case 'sub-name':
        openSubNameModal(cell);
        break;
      case 'delete':
        deleteRow(event.target);
        break;
    }
  });

  // Add button handlers
  const addEmployeeBtn = getElementById("addEmployeeBtn");
  const addSubBtn = getElementById("addSubBtn");
  const addPlantBtn = getElementById("addPlantBtn");

  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener('click', addEmployeeRow);
  }
  if (addSubBtn) {
    addSubBtn.addEventListener('click', addSubRow);
  }
  if (addPlantBtn) {
    addPlantBtn.addEventListener('click', addPlantRow);
  }
}

