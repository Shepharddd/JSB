/**
 * Form Storage Module
 * Handles saving and loading form data per date using in-memory storage
 */

// In-memory storage for timesheet data
const TimesheetStorage = {};

/**
 * Gets a storage key for a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Storage key
 */
function getStorageKey(dateString) {
  return `timesheet_${dateString}`;
}

/**
 * Collects all form data into an object
 * @returns {Object} Form data object
 */
function collectFormData() {
  const nameInput = getElementById("nameInput");
  const siteInput = getElementById("siteInput");
  const weatherInput = getElementById("weatherInput");
  const tasksCompletedInput = getElementById("tasksCompletedInput");
  const setbacksInput = getElementById("setbacksInput");
  const rfiInput = getElementById("rfiInput");
  const dateInput = getElementById("dateInput");

  // Collect table data
  const employeeRows = collectEmployeeRowsFromDOM();
  const subRows = collectSubcontractorRowsFromDOM();
  const plantRows = collectPlantRowsFromDOM();

  const userStartTimeInput = getElementById("userStartTimeInput");
  const userEndTimeInput = getElementById("userEndTimeInput");

  return {
    name: nameInput ? nameInput.value : "",
    site: siteInput ? siteInput.value : "",
    weather: weatherInput ? weatherInput.value : "",
    tasksCompleted: tasksCompletedInput ? tasksCompletedInput.value : "",
    setbacks: setbacksInput ? setbacksInput.value : "",
    rfi: rfiInput ? rfiInput.value : "",
    userStartTime: userStartTimeInput ? userStartTimeInput.value : "",
    userEndTime: userEndTimeInput ? userEndTimeInput.value : "",
    employees: employeeRows,
    subcontractors: subRows,
    plants: plantRows
  };
}

/**
 * Collects employee rows from the DOM
 * @returns {Array} Array of employee row data
 */
function collectEmployeeRowsFromDOM() {
  const rows = [...document.querySelectorAll("#employeeTable tr")].slice(1);
  return rows.map(row => {
    const cells = row.children;
    const nameSelect = cells[0].querySelector("select");
    const timeInInput = cells[1].querySelector(".time-input");
    const timeOutInput = cells[2].querySelector(".time-input");
    const descInput = cells[3].querySelector(".work-desc-input");
    
    return {
      name: nameSelect ? nameSelect.value : "",
      timeIn: timeInInput ? timeInInput.value : "",
      timeOut: timeOutInput ? timeOutInput.value : "",
      desc: descInput ? descInput.value : ""
    };
  });
}

/**
 * Collects subcontractor rows from the DOM
 * @returns {Array} Array of subcontractor row data
 */
function collectSubcontractorRowsFromDOM() {
  const rows = [...document.querySelectorAll("#subTable tr")].slice(1);
  return rows.map(row => {
    const cells = row.children;
    const nameInput = cells[0].querySelector(".sub-name-input");
    const timeInInput = cells[1].querySelector(".time-input");
    const timeOutInput = cells[2].querySelector(".time-input");
    const descInput = cells[3].querySelector(".work-desc-input");
    
    return {
      name: nameInput ? nameInput.value : "",
      timeIn: timeInInput ? timeInInput.value : "",
      timeOut: timeOutInput ? timeOutInput.value : "",
      desc: descInput ? descInput.value : ""
    };
  });
}

/**
 * Collects plant rows from the DOM
 * @returns {Array} Array of plant row data
 */
function collectPlantRowsFromDOM() {
  const rows = [...document.querySelectorAll("#plantTable tr")].slice(1);
  return rows.map(row => {
    const cells = row.children;
    const nameSelect = cells[0].querySelector("select");
    const descInput = cells[1].querySelector(".work-desc-input");
    
    return {
      name: nameSelect ? nameSelect.value : "",
      desc: descInput ? descInput.value : ""
    };
  });
}

/**
 * Checks if the form has any meaningful data
 * @param {Object} formData - Form data object
 * @returns {boolean} True if form has data, false otherwise
 */
function hasFormData(formData) {
  // Check if weather, notes fields, or user times have values
  if (formData.weather && formData.weather.trim() !== "") return true;
  if (formData.tasksCompleted && formData.tasksCompleted.trim() !== "") return true;
  if (formData.setbacks && formData.setbacks.trim() !== "") return true;
  if (formData.rfi && formData.rfi.trim() !== "") return true;
  // Backward compatibility: check old notes field
  if (formData.notes && formData.notes.trim() !== "") return true;
  if (formData.userStartTime && formData.userStartTime.trim() !== "") return true;
  if (formData.userEndTime && formData.userEndTime.trim() !== "") return true;
  
  // Check if any employee row has data
  if (formData.employees && formData.employees.length > 0) {
    for (const emp of formData.employees) {
      if ((emp.name && emp.name.trim() !== "") ||
          (emp.timeIn && emp.timeIn.trim() !== "") ||
          (emp.timeOut && emp.timeOut.trim() !== "") ||
          (emp.desc && emp.desc.trim() !== "")) {
        return true;
      }
    }
  }
  
  // Check if any subcontractor row has data
  if (formData.subcontractors && formData.subcontractors.length > 0) {
    for (const sub of formData.subcontractors) {
      if ((sub.name && sub.name.trim() !== "") ||
          (sub.timeIn && sub.timeIn.trim() !== "") ||
          (sub.timeOut && sub.timeOut.trim() !== "") ||
          (sub.desc && sub.desc.trim() !== "")) {
        return true;
      }
    }
  }
  
  // Check if any plant row has data
  if (formData.plants && formData.plants.length > 0) {
    for (const plant of formData.plants) {
      if ((plant.name && plant.name.trim() !== "") ||
          (plant.desc && plant.desc.trim() !== "")) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Saves form data for the current date
 * Only saves if there's actual data, otherwise removes the entry
 * @param {string} dateString - Date in YYYY-MM-DD format
 */
function saveFormData(dateString) {
  if (!dateString) return;
  
  const formData = collectFormData();
  const storageKey = getStorageKey(dateString);
  
  try {
    // Only store if there's actual data
    if (hasFormData(formData)) {
      // Store in memory instead of localStorage
      TimesheetStorage[storageKey] = JSON.parse(JSON.stringify(formData)); // Deep copy
    } else {
      // Remove entry if it exists and form is empty
      if (TimesheetStorage[storageKey]) {
        delete TimesheetStorage[storageKey];
      }
    }
  } catch (error) {
    console.error("Error saving form data:", error);
  }
}

/**
 * Loads form data for a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 */
function loadFormData(dateString) {
  if (!dateString) return;
  
  const storageKey = getStorageKey(dateString);
  
  try {
    const formData = TimesheetStorage[storageKey];
    if (!formData) {
      // No saved data, clear the form but set default times
      const weatherInput = getElementById("weatherInput");
      const tasksCompletedInput = getElementById("tasksCompletedInput");
      const setbacksInput = getElementById("setbacksInput");
      const rfiInput = getElementById("rfiInput");
      if (weatherInput) weatherInput.value = "";
      if (tasksCompletedInput) tasksCompletedInput.value = "";
      if (setbacksInput) setbacksInput.value = "";
      if (rfiInput) rfiInput.value = "";
      
      // Set default times
      const defaultStartTime = CONFIG.DEFAULTS.DEFAULT_TIME_IN;
      const defaultEndTime = CONFIG.DEFAULTS.DEFAULT_TIME_OUT;
      const userStartTimeInput = getElementById("userStartTimeInput");
      const userEndTimeInput = getElementById("userEndTimeInput");
      const userStartTimeDisplay = document.querySelector("#userStartTimeCell .time-display");
      const userEndTimeDisplay = document.querySelector("#userEndTimeCell .time-display");
      
      if (userStartTimeInput) userStartTimeInput.value = defaultStartTime;
      if (userEndTimeInput) userEndTimeInput.value = defaultEndTime;
      if (userStartTimeDisplay) userStartTimeDisplay.textContent = defaultStartTime;
      if (userEndTimeDisplay) userEndTimeDisplay.textContent = defaultEndTime;
      
      // Clear table rows
      clearTableRows("employeeTable");
      clearTableRows("subTable");
      clearTableRows("plantTable");
      return;
    }
    
    // Restore main form fields (but don't override name/site if they're disabled)
    const weatherInput = getElementById("weatherInput");
    const tasksCompletedInput = getElementById("tasksCompletedInput");
    const setbacksInput = getElementById("setbacksInput");
    const rfiInput = getElementById("rfiInput");
    const userStartTimeInput = getElementById("userStartTimeInput");
    const userEndTimeInput = getElementById("userEndTimeInput");
    const userStartTimeDisplay = document.querySelector("#userStartTimeCell .time-display");
    const userEndTimeDisplay = document.querySelector("#userEndTimeCell .time-display");
    
    if (weatherInput) {
      weatherInput.value = formData.weather || "";
    }
    // Restore new notes fields, with backward compatibility for old notes field
    if (tasksCompletedInput) {
      tasksCompletedInput.value = formData.tasksCompleted || (formData.notes || "");
    }
    if (setbacksInput) {
      setbacksInput.value = formData.setbacks || "";
    }
    if (rfiInput) {
      rfiInput.value = formData.rfi || "";
    }
    const defaultStartTime = CONFIG.DEFAULTS.DEFAULT_TIME_IN;
    const defaultEndTime = CONFIG.DEFAULTS.DEFAULT_TIME_OUT;
    
    if (userStartTimeInput) {
      userStartTimeInput.value = formData.userStartTime || defaultStartTime;
      if (userStartTimeDisplay) {
        userStartTimeDisplay.textContent = formData.userStartTime || defaultStartTime;
      }
    }
    if (userEndTimeInput) {
      userEndTimeInput.value = formData.userEndTime || defaultEndTime;
      if (userEndTimeDisplay) {
        userEndTimeDisplay.textContent = formData.userEndTime || defaultEndTime;
      }
    }
    
    // Restore table data
    restoreEmployeeRows(formData.employees || []);
    restoreSubcontractorRows(formData.subcontractors || []);
    restorePlantRows(formData.plants || []);
    
  } catch (error) {
    console.error("Error loading form data:", error);
    clearFormData();
  }
}

/**
 * Restores employee rows from saved data
 * @param {Array} employeeData - Array of employee row data
 */
function restoreEmployeeRows(employeeData) {
  // Clear existing rows
  clearTableRows("employeeTable");
  
  // Add rows from saved data
  employeeData.forEach(emp => {
    addEmployeeRow();
    const rows = document.querySelectorAll("#employeeTable tr");
    const lastRow = rows[rows.length - 1];
    
    if (lastRow) {
      const cells = lastRow.children;
      const nameSelect = cells[0].querySelector("select");
      const timeInInput = cells[1].querySelector(".time-input");
      const timeOutInput = cells[2].querySelector(".time-input");
      const timeInDisplay = cells[1].querySelector(".time-display");
      const timeOutDisplay = cells[2].querySelector(".time-display");
      const descInput = cells[3].querySelector(".work-desc-input");
      const descDisplay = cells[3].querySelector(".work-desc-display");
      
      if (nameSelect) nameSelect.value = emp.name || "";
      if (timeInInput) {
        timeInInput.value = emp.timeIn || "";
        if (timeInDisplay) timeInDisplay.textContent = emp.timeIn || CONFIG.DEFAULTS.DEFAULT_TIME_IN;
      }
      if (timeOutInput) {
        timeOutInput.value = emp.timeOut || "";
        if (timeOutDisplay) timeOutDisplay.textContent = emp.timeOut || CONFIG.DEFAULTS.DEFAULT_TIME_OUT;
      }
      if (descInput) {
        descInput.value = emp.desc || "";
        if (descDisplay) {
          if (emp.desc) {
            const maxLength = CONFIG.DISPLAY.WORK_DESC_MAX_LENGTH;
            const suffix = CONFIG.DISPLAY.WORK_DESC_TRUNCATE_SUFFIX;
            descDisplay.textContent = emp.desc.length > maxLength 
              ? emp.desc.substring(0, maxLength) + suffix 
              : emp.desc;
            descDisplay.classList.remove('empty');
          } else {
            descDisplay.textContent = 'Click to add description';
            descDisplay.classList.add('empty');
          }
        }
      }
    }
  });
}

/**
 * Restores subcontractor rows from saved data
 * @param {Array} subData - Array of subcontractor row data
 */
function restoreSubcontractorRows(subData) {
  // Clear existing rows
  clearTableRows("subTable");
  
  // Add rows from saved data
  subData.forEach(sub => {
    addSubRow();
    const rows = document.querySelectorAll("#subTable tr");
    const lastRow = rows[rows.length - 1];
    
    if (lastRow) {
      const cells = lastRow.children;
      const nameInput = cells[0].querySelector(".sub-name-input");
      const nameDisplay = cells[0].querySelector(".sub-name-display");
      const timeInInput = cells[1].querySelector(".time-input");
      const timeOutInput = cells[2].querySelector(".time-input");
      const timeInDisplay = cells[1].querySelector(".time-display");
      const timeOutDisplay = cells[2].querySelector(".time-display");
      const descInput = cells[3].querySelector(".work-desc-input");
      const descDisplay = cells[3].querySelector(".work-desc-display");
      
      if (nameInput) {
        nameInput.value = sub.name || "";
        if (nameDisplay) {
          if (sub.name) {
            nameDisplay.textContent = sub.name;
            nameDisplay.classList.remove('empty');
          } else {
            nameDisplay.textContent = 'Click to add name';
            nameDisplay.classList.add('empty');
          }
        }
      }
      if (timeInInput) {
        timeInInput.value = sub.timeIn || "";
        if (timeInDisplay) timeInDisplay.textContent = sub.timeIn || CONFIG.DEFAULTS.DEFAULT_TIME_IN;
      }
      if (timeOutInput) {
        timeOutInput.value = sub.timeOut || "";
        if (timeOutDisplay) timeOutDisplay.textContent = sub.timeOut || CONFIG.DEFAULTS.DEFAULT_TIME_OUT;
      }
      if (descInput) {
        descInput.value = sub.desc || "";
        if (descDisplay) {
          if (sub.desc) {
            const maxLength = CONFIG.DISPLAY.WORK_DESC_MAX_LENGTH;
            const suffix = CONFIG.DISPLAY.WORK_DESC_TRUNCATE_SUFFIX;
            descDisplay.textContent = sub.desc.length > maxLength 
              ? sub.desc.substring(0, maxLength) + suffix 
              : sub.desc;
            descDisplay.classList.remove('empty');
          } else {
            descDisplay.textContent = 'Click to add description';
            descDisplay.classList.add('empty');
          }
        }
      }
    }
  });
}

/**
 * Restores plant rows from saved data
 * @param {Array} plantData - Array of plant row data
 */
function restorePlantRows(plantData) {
  // Clear existing rows
  clearTableRows("plantTable");
  
  // Add rows from saved data
  plantData.forEach(plant => {
    addPlantRow();
    const rows = document.querySelectorAll("#plantTable tr");
    const lastRow = rows[rows.length - 1];
    
    if (lastRow) {
      const cells = lastRow.children;
      const nameSelect = cells[0].querySelector("select");
      const descInput = cells[1].querySelector(".work-desc-input");
      const descDisplay = cells[1].querySelector(".work-desc-display");
      
      if (nameSelect) nameSelect.value = plant.name || "";
      if (descInput) {
        descInput.value = plant.desc || "";
        if (descDisplay) {
          if (plant.desc) {
            const maxLength = CONFIG.DISPLAY.WORK_DESC_MAX_LENGTH;
            const suffix = CONFIG.DISPLAY.WORK_DESC_TRUNCATE_SUFFIX;
            descDisplay.textContent = plant.desc.length > maxLength 
              ? plant.desc.substring(0, maxLength) + suffix 
              : plant.desc;
            descDisplay.classList.remove('empty');
          } else {
            descDisplay.textContent = 'Click to add description';
            descDisplay.classList.add('empty');
          }
        }
      }
    }
  });
}

/**
 * Gets the current date string in YYYY-MM-DD format
 * @returns {string} Date string
 */
function getCurrentDateString() {
  const dateInput = getElementById("dateInput");
  return dateInput ? dateInput.value : "";
}

/**
 * Auto-saves form data for the current date
 * Called when form fields change
 */
function autoSaveFormData() {
  const dateString = getCurrentDateString();
  if (dateString) {
    saveFormData(dateString);
  }
}

/**
 * Clears all timesheet data from memory
 */
function clearAllTimesheetData() {
  try {
    const keyCount = Object.keys(TimesheetStorage).length;
    // Clear all keys from in-memory storage
    Object.keys(TimesheetStorage).forEach(key => {
      delete TimesheetStorage[key];
    });
    
    console.log(`Cleared ${keyCount} timesheet entries from memory`);
  } catch (error) {
    console.error("Error clearing timesheet data:", error);
  }
}

/**
 * Initializes auto-save listeners for form fields
 */
function initAutoSave() {
  // Auto-save on input changes
  const tasksCompletedInput = getElementById("tasksCompletedInput");
  const setbacksInput = getElementById("setbacksInput");
  const rfiInput = getElementById("rfiInput");
  const weatherInput = getElementById("weatherInput");
  
  if (tasksCompletedInput) {
    tasksCompletedInput.addEventListener('input', autoSaveFormData);
  }
  if (setbacksInput) {
    setbacksInput.addEventListener('input', autoSaveFormData);
  }
  if (rfiInput) {
    rfiInput.addEventListener('input', autoSaveFormData);
  }
  if (weatherInput) {
    weatherInput.addEventListener('input', autoSaveFormData);
  }
  
  // Auto-save when table rows are modified
  // This will be handled by the table handlers when rows are added/modified
  document.addEventListener('change', (e) => {
    // Auto-save when selects change in tables
    if (e.target.closest('#employeeTable, #subTable, #plantTable')) {
      autoSaveFormData();
    }
  });
}

