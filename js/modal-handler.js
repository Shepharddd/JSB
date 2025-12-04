/**
 * Modal Handler
 * Manages all modal interactions (time, work description, subcontractor name)
 */

// Modal state
const ModalState = {
  currentTimeCell: null,
  currentWorkDescCell: null,
  currentSubNameCell: null
};

/**
 * Opens the time input modal
 * @param {HTMLElement} cell - The cell element that triggered the modal
 * @param {string} title - The modal title ('Time In' or 'Time Out')
 */
function openTimeModal(cell, title) {
  ModalState.currentTimeCell = cell;
  const modal = getElementById("timeModal");
  const timeInput = getElementById("timeInput");
  const modalTitle = getElementById("timeModalTitle");
  
  if (!modal || !timeInput || !modalTitle) return;
  
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

/**
 * Closes the time input modal
 */
function closeTimeModal() {
  const modal = getElementById("timeModal");
  if (modal) {
    modal.style.display = 'none';
  }
  ModalState.currentTimeCell = null;
}

/**
 * Saves the time value from the modal
 */
function saveTime() {
  if (!ModalState.currentTimeCell) return;
  
  const timeInput = getElementById("timeInput");
  const hiddenInput = ModalState.currentTimeCell.querySelector('.time-input');
  const display = ModalState.currentTimeCell.querySelector('.time-display');
  
  if (!timeInput) return;
  
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

/**
 * Opens the subcontractor name input modal
 * @param {HTMLElement} cell - The cell element that triggered the modal
 */
function openSubNameModal(cell) {
  ModalState.currentSubNameCell = cell;
  const modal = getElementById("subNameModal");
  const textInput = getElementById("subNameInput");
  
  if (!modal || !textInput) return;
  
  const hiddenInput = cell.querySelector('.sub-name-input');
  const display = cell.querySelector('.sub-name-display');
  
  // Load existing value
  textInput.value = hiddenInput ? hiddenInput.value : '';
  
  // Show modal
  modal.style.display = 'flex';
  textInput.focus();
}

/**
 * Closes the subcontractor name input modal
 */
function closeSubNameModal() {
  const modal = getElementById("subNameModal");
  if (modal) {
    modal.style.display = 'none';
  }
  ModalState.currentSubNameCell = null;
}

/**
 * Saves the subcontractor name from the modal
 */
function saveSubName() {
  if (!ModalState.currentSubNameCell) return;
  
  const textInput = getElementById("subNameInput");
  const hiddenInput = ModalState.currentSubNameCell.querySelector('.sub-name-input');
  const display = ModalState.currentSubNameCell.querySelector('.sub-name-display');
  
  if (!textInput) return;
  
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

/**
 * Opens the work description modal
 * @param {HTMLElement} cell - The cell element that triggered the modal
 */
function openWorkDescModal(cell) {
  ModalState.currentWorkDescCell = cell;
  const modal = getElementById("workDescModal");
  const textarea = getElementById("workDescTextarea");
  
  if (!modal || !textarea) return;
  
  const hiddenInput = cell.querySelector('.work-desc-input');
  const display = cell.querySelector('.work-desc-display');
  
  // Load existing value
  textarea.value = hiddenInput ? hiddenInput.value : '';
  
  // Show modal
  modal.style.display = 'flex';
  textarea.focus();
}

/**
 * Closes the work description modal
 */
function closeWorkDescModal() {
  const modal = getElementById("workDescModal");
  if (modal) {
    modal.style.display = 'none';
  }
  ModalState.currentWorkDescCell = null;
}

/**
 * Saves the work description from the modal
 */
function saveWorkDescription() {
  if (!ModalState.currentWorkDescCell) return;
  
  const textarea = getElementById("workDescTextarea");
  const hiddenInput = ModalState.currentWorkDescCell.querySelector('.work-desc-input');
  const display = ModalState.currentWorkDescCell.querySelector('.work-desc-display');
  
  if (!textarea) return;
  
  const value = textarea.value.trim();
  
  // Save to hidden input
  if (hiddenInput) {
    hiddenInput.value = value;
  }
  
  // Update display
  if (display) {
    if (value) {
      const maxLength = CONFIG.DISPLAY.WORK_DESC_MAX_LENGTH;
      const suffix = CONFIG.DISPLAY.WORK_DESC_TRUNCATE_SUFFIX;
      display.textContent = value.length > maxLength 
        ? value.substring(0, maxLength) + suffix 
        : value;
      display.classList.remove('empty');
    } else {
      display.textContent = 'Click to add description';
      display.classList.add('empty');
    }
  }
  
  closeWorkDescModal();
}

/**
 * Initializes modal click-outside handlers and button handlers
 */
function initModalHandlers() {
  // Handle click outside modals
  window.addEventListener('click', (event) => {
    const workDescModal = getElementById("workDescModal");
    const timeModal = getElementById("timeModal");
    const subNameModal = getElementById("subNameModal");
    
    if (event.target === workDescModal) {
      closeWorkDescModal();
    }
    if (event.target === timeModal) {
      closeTimeModal();
    }
    if (event.target === subNameModal) {
      closeSubNameModal();
    }
  });

  // Handle modal button clicks
  document.addEventListener('click', (event) => {
    const action = event.target.getAttribute('data-action');
    if (!action) return;

    switch (action) {
      case 'save-time':
        saveTime();
        break;
      case 'close-time':
        closeTimeModal();
        break;
      case 'save-work-desc':
        saveWorkDescription();
        break;
      case 'close-work-desc':
        closeWorkDescModal();
        break;
      case 'save-sub-name':
        saveSubName();
        break;
      case 'close-sub-name':
        closeSubNameModal();
        break;
    }
  });
}

