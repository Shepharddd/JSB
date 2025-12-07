/**
 * Form Handler
 * Manages form submission, validation, and data collection
 */

/**
 * Converts time string (HH:MM) to Excel fraction
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} Excel time fraction
 */
function timeToExcelFraction(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h + m / 60) / 24;
}

/**
 * Collects employee row data from the table
 * @param {string} date - The date value
 * @returns {Array} Array of employee row data
 */
function collectEmployeeRows(date) {
  const employeeRows = [...document.querySelectorAll("#employeeTable tr")].slice(1)
    .map(row => {
      const cells = row.children;
      const nameInput = cells[0].querySelector("input") || cells[0].querySelector("select");
      const timeInInput = cells[1].querySelector(".time-input");
      const timeOutInput = cells[2].querySelector(".time-input");
      const timeIn = timeInInput ? timeToExcelFraction(timeInInput.value) : "";
      const timeOut = timeOutInput ? timeToExcelFraction(timeOutInput.value) : "";
      const descInput = cells[3].querySelector(".work-desc-input");
      const desc = descInput ? descInput.value : "";
      return {
        name: nameInput ? nameInput.value : "",
        timeIn: timeIn,
        timeOut: timeOut,
        desc: desc,
      };
    });
  return employeeRows;
}

/**
 * Collects subcontractor row data from the table
 * @param {string} date - The date value
 * @returns {Array} Array of subcontractor row data
 */
function collectSubcontractorRows(date) {
  const subRows = [...document.querySelectorAll("#subTable tr")].slice(1)
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
      return {
        name: name,
        timeIn: timeIn,
        timeOut: timeOut,
        desc: desc,
      };
    });
  return subRows;
}

/**
 * Collects plant/equipment row data from the table
 * @param {string} date - The date value
 * @returns {Array} Array of plant row data
 */
function collectPlantRows(date) {
  const plantRows = [...document.querySelectorAll("#plantTable tr")].slice(1)
    .map(row => {
      const cells = row.children;
      const nameSelect = cells[0].querySelector("select");
      const name = nameSelect ? nameSelect.value : "";
      const descInput = cells[1].querySelector(".work-desc-input");
      const desc = descInput ? descInput.value : "";
      return {
        name: name,
        desc: desc,
      };
    })
    .filter(row => row.name); // Only include rows where plant name is selected
  
  return plantRows;
}

/**
 * Clears all form data except name, site, weather, and date
 */
function clearFormData() {
  // Clear notes fields
  const tasksCompletedInput = getElementById("tasksCompletedInput");
  const setbacksInput = getElementById("setbacksInput");
  const rfiInput = getElementById("rfiInput");
  if (tasksCompletedInput) {
    tasksCompletedInput.value = "";
  }
  if (setbacksInput) {
    setbacksInput.value = "";
  }
  if (rfiInput) {
    rfiInput.value = "";
  }
  
  // Clear user time inputs
  const userStartTimeInput = getElementById("userStartTimeInput");
  const userEndTimeInput = getElementById("userEndTimeInput");
  const userStartTimeDisplay = document.querySelector("#userStartTimeCell .time-display");
  const userEndTimeDisplay = document.querySelector("#userEndTimeCell .time-display");
  
  const defaultStartTime = CONFIG.DEFAULTS.DEFAULT_TIME_IN;
  const defaultEndTime = CONFIG.DEFAULTS.DEFAULT_TIME_OUT;
  
  if (userStartTimeInput) {
    userStartTimeInput.value = defaultStartTime;
  }
  if (userEndTimeInput) {
    userEndTimeInput.value = defaultEndTime;
  }
  if (userStartTimeDisplay) {
    userStartTimeDisplay.textContent = defaultStartTime;
  }
  if (userEndTimeDisplay) {
    userEndTimeDisplay.textContent = defaultEndTime;
  }
  
  // Clear employee rows (keep header row)
  clearTableRows("employeeTable");
  
  // Clear subcontractor rows (keep header row)
  clearTableRows("subTable");
  
  // Clear plant rows (keep header row)
  clearTableRows("plantTable");
}

/**
 * Clears all rows from a table except the header row
 * @param {string} tableId - The table element ID
 */
function clearTableRows(tableId) {
  const table = getElementById(tableId);
  if (!table) return;
  
  const rows = table.querySelectorAll("tr");
  for (let i = rows.length - 1; i > 0; i--) {
    rows[i].remove();
  }
}

/**
 * Validates the form data
 * @param {string} tasksCompleted - Tasks completed text
 * @param {string} setbacks - Setbacks text
 * @param {string} rfi - RFI text
 * @param {Array} employeeRows - Array of employee rows
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateForm(tasksCompleted, setbacks, rfi, employeeRows) {
  const hasTasksCompleted = tasksCompleted.trim().length > 0;
  const hasSetbacks = setbacks.trim().length > 0;
  const hasRfi = rfi.trim().length > 0;
  const hasNotes = hasTasksCompleted || hasSetbacks || hasRfi;

  if (!hasNotes) {
    return {
      isValid: false,
      error: CONFIG.TOAST.ERROR_MESSAGES.NO_NOTES
    };
  }

  return { isValid: true };
}

/**
 * Submits the form data
 */
async function submitForm() {
  setLoading(true);

  try {
    // Collect main form data
    const nameInput = getElementById("nameInput");
    const siteInput = getElementById("siteInput");
    const weatherInput = getElementById("weatherInput");
    const dateInput = getElementById("dateInput");
    const tasksCompletedInput = getElementById("tasksCompletedInput");
    const setbacksInput = getElementById("setbacksInput");
    const rfiInput = getElementById("rfiInput");
    const userStartTimeInput = getElementById("userStartTimeInput");
    const userEndTimeInput = getElementById("userEndTimeInput");

    if (!nameInput || !siteInput || !weatherInput || !dateInput || !tasksCompletedInput || !setbacksInput || !rfiInput) {
      throw new Error("Required form elements not found");
    }

    const name = nameInput.value || "";
    const site = siteInput.value || "";
    const weather = weatherInput.value || "";
    const dateValue = dateInput.value;
    const date = dateValue ? new Date(dateValue).getTime() / (1000 * 60 * 60 * 24) : "";
    const tasksCompleted = tasksCompletedInput.value || "";
    const setbacks = setbacksInput.value || "";
    const rfi = rfiInput.value || "";
    const userStartTime = userStartTimeInput ? userStartTimeInput.value : "";
    const userEndTime = userEndTimeInput ? userEndTimeInput.value : "";

    // Collect table data
    const employeeRows = collectEmployeeRows(date);
    const subRows = collectSubcontractorRows(date);
    const plantRows = collectPlantRows(date);

    // Validate form
    const validation = validateForm(tasksCompleted, setbacks, rfi, employeeRows);
    if (!validation.isValid) {
      showToast(validation.error, "error");
      setLoading(false);
      return;
    }

    // Combine notes fields for backward compatibility with log field
    const log = [tasksCompleted, setbacks, rfi].filter(n => n.trim()).join("\n\n");

    // Transform into a single JSON object
    const resultJSON = {
        name: name,
        site: site,
        weather: weather,
        date: date,
        log: log,
        tasksCompleted: tasksCompleted,
        setbacks: setbacks,
        rfi: rfi,
        startTime: userStartTime ? timeToExcelFraction(userStartTime) : "",
        endTime: userEndTime ? timeToExcelFraction(userEndTime) : "",
        employees: employeeRows,
        subcontractors: subRows,
        plants: plantRows
    };

    // If you need a JSON string:
    const resultJSONString = JSON.stringify(resultJSON);



    const details = [name, date, site, weather, log];
    const token = getFlowToken();

    if (!token || !token.accessToken) {
      throw new Error("Authentication token not available");
    }

    // Submit form
    await postForm(resultJSONString, token.accessToken);
    
    // Save form data to localStorage before clearing
    const currentDateString = dateValue;
    if (currentDateString) {
      saveFormData(currentDateString);
    }
    
    // Clear form after successful submission (but keep saved data)
    clearFormData();
    
    // Show success toast
    showToast(CONFIG.TOAST.SUCCESS_MESSAGE);
    
  } catch (error) {
    console.error("Error submitting form:", error);
    const errorMessage = error.message || CONFIG.TOAST.ERROR_MESSAGES.SUBMIT_ERROR;
    showToast(errorMessage, "error");
  } finally {
    setLoading(false);
  }
}

/**
 * Initializes form submission handler
 */
function initFormHandler() {
  const submitBtn = getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener('click', submitForm);
  }
}

