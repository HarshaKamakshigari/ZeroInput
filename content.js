console.log('ZeroInput content script loaded.');

// Detect Google Forms by URL and DOM elements
function isGoogleForm() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  const isGoogleFormURL = (hostname.includes('docs.google.com') && pathname.includes('/forms/')) ||
                         (hostname.includes('forms.google.com')) ||
                         (hostname.includes('docs.google.com') && pathname.includes('/d/'));
  
  const hasGoogleFormElements = document.querySelector('.freebirdFormviewerViewFormContentWrapper') ||
                               document.querySelector('.freebirdFormviewerViewItemsItemItem') ||
                               document.querySelector('.quantumWizTextinputPaperinputInput');
  
  return isGoogleFormURL || hasGoogleFormElements;
}

// Extract form elements from Google Forms
function getGoogleFormElements() {
  const elements = {};
  
  // Text inputs and textareas
  document.querySelectorAll('input[type="text"], input[type="email"], textarea, .quantumWizTextinputPaperinputInput').forEach((el, index) => {
    const questionText = el.closest('.freebirdFormviewerViewItemsItemItem')?.querySelector('.freebirdFormviewerViewItemsItemItemTitle')?.textContent?.trim();
    const key = questionText || `text_field_${index}`;
    elements[key] = el;
  });
  
  // Radio buttons and checkboxes
  document.querySelectorAll('.freebirdFormviewerViewItemsRadioOptionContainer, .freebirdFormviewerViewItemsCheckboxOptionContainer').forEach((container, index) => {
    const questionText = container.closest('.freebirdFormviewerViewItemsItemItem')?.querySelector('.freebirdFormviewerViewItemsItemItemTitle')?.textContent?.trim();
    const key = questionText || `choice_field_${index}`;
    elements[key] = container;
  });
  
  // Dropdown/select elements
  document.querySelectorAll('.quantumWizMenuPaperselectOptionList, .freebirdFormviewerViewItemsSelectSelect').forEach((el, index) => {
    const questionText = el.closest('.freebirdFormviewerViewItemsItemItem')?.querySelector('.freebirdFormviewerViewItemsItemItemTitle')?.textContent?.trim();
    const key = questionText || `dropdown_${index}`;
    elements[key] = el;
  });
  
  return elements;
}

// Fill Google Forms with provided data
function fillGoogleForm(data) {
  const elements = getGoogleFormElements();
  let filledCount = 0;
  
  for (const [question, value] of Object.entries(data)) {
    let element = elements[question];
    
    if (!element) {
      // Partial match fallback
      for (const [key, el] of Object.entries(elements)) {
        if (key.toLowerCase().includes(question.toLowerCase()) || 
            question.toLowerCase().includes(key.toLowerCase())) {
          element = el;
          break;
        }
      }
    }
    
    if (element) {
      try {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (element.classList.contains('freebirdFormviewerViewItemsRadioOptionContainer')) {
          const radioInput = element.querySelector('input[type="radio"]');
          if (radioInput) {
            radioInput.checked = true;
            radioInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else if (element.classList.contains('freebirdFormviewerViewItemsCheckboxOptionContainer')) {
          const checkboxInput = element.querySelector('input[type="checkbox"]');
          if (checkboxInput) {
            checkboxInput.checked = true;
            checkboxInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        filledCount++;
      } catch (error) {
        console.error(`Error filling element for question "${question}":`, error);
      }
    }
  }
  
  return filledCount;
}

// Extract data from Google Forms
function extractGoogleFormData() {
  const data = {};
  const elements = getGoogleFormElements();
  
  for (const [question, element] of Object.entries(elements)) {
    try {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        data[question] = element.value;
      } else if (element.classList.contains('freebirdFormviewerViewItemsRadioOptionContainer')) {
        const radioInput = element.querySelector('input[type="radio"]:checked');
        if (radioInput) {
          const label = element.querySelector('.docssharedWizToggleLabeledContainer')?.textContent?.trim();
          data[question] = label || 'Selected';
        }
      } else if (element.classList.contains('freebirdFormviewerViewItemsCheckboxOptionContainer')) {
        const checkboxInput = element.querySelector('input[type="checkbox"]:checked');
        if (checkboxInput) {
          const label = element.querySelector('.docssharedWizToggleLabeledContainer')?.textContent?.trim();
          data[question] = label || 'Selected';
        }
      }
    } catch (error) {
      console.error(`Error extracting data for question "${question}":`, error);
    }
  }
  
  return data;
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'autofill') {
    const data = message.payload;
    
    if (isGoogleForm()) {
      const filledCount = fillGoogleForm(data);
      sendResponse({ success: true, filledCount, isGoogleForm: true });
    } else {
      // Regular HTML forms
      for (const key in data) {
        const el = document.querySelector(`[name="${key}"], #${key}`);
        if (el) el.value = data[key];
      }
      sendResponse({ success: true, isGoogleForm: false });
    }
  } else if (message.type === 'extractFormData') {
    if (isGoogleForm()) {
      const data = extractGoogleFormData();
      sendResponse({ success: true, data, isGoogleForm: true });
    } else {
      // Regular HTML forms
      const data = {};
      document.querySelectorAll('input, select, textarea').forEach(el => {
        const key = el.name || el.id;
        if (key) data[key] = el.value;
      });
      sendResponse({ success: true, data, isGoogleForm: false });
    }
  } else if (message.type === 'ping') {
    sendResponse({ success: true, isGoogleForm: isGoogleForm() });
  }
  
  return true;
});
