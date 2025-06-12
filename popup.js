document.addEventListener('DOMContentLoaded', async () => {
  const profileSelect = document.getElementById('profileSelect');
  const manageSelect = document.getElementById('manageProfileSelect');
  const status = document.getElementById('status');

  const showStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.remove('hidden');
    status.style.color = isError ? 'red' : 'green';
    setTimeout(() => status.classList.add('hidden'), 3000);
  };

  const loadProfiles = async () => {
    const { profiles = {} } = await chrome.storage.local.get('profiles');
    profileSelect.innerHTML = '<option value="">Select a profile...</option>';
    manageSelect.innerHTML = '<option value="">Select profile to manage...</option>';
    for (let name in profiles) {
      const option = new Option(name, name);
      profileSelect.add(option.cloneNode(true));
      manageSelect.add(option.cloneNode(true));
    }
  };

  await loadProfiles();

  document.getElementById('saveForm').addEventListener('click', async () => {
    const profileName = document.getElementById('profileName').value.trim();
    if (!profileName) return showStatus("Please enter a profile name", true);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { type: 'extractFormData' }, async (response) => {
      if (chrome.runtime.lastError) {
        showStatus(`Error: ${chrome.runtime.lastError.message}. Make sure you're on a form page and refresh if needed.`, true);
        return;
      }

      if (response && response.success) {
        const formData = response.data;
        const { profiles = {} } = await chrome.storage.local.get('profiles');
        profiles[profileName] = formData;
        await chrome.storage.local.set({ profiles });
        
        const formType = response.isGoogleForm ? 'Google Form' : 'regular form';
        showStatus(`Saved profile: ${profileName} (${formType})`);
        await loadProfiles();
      } else {
        showStatus("Failed to extract form data. Please refresh the page and try again.", true);
      }
    });
  });

  document.getElementById('fillForm').addEventListener('click', async () => {
    const profileName = profileSelect.value;
    if (!profileName) return showStatus("Select a profile", true);

    const { profiles = {} } = await chrome.storage.local.get('profiles');
    const formData = profiles[profileName];
    if (!formData) return showStatus("Profile not found", true);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { 
      type: 'autofill', 
      payload: formData 
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus(`Error: ${chrome.runtime.lastError.message}. Make sure you're on a form page and refresh if needed.`, true);
        return;
      }

      if (response && response.success) {
        if (response.isGoogleForm) {
          showStatus(`Filled ${response.filledCount || 0} fields in Google Form`);
        } else {
          showStatus("Form filled successfully");
        }
      } else {
        showStatus("Failed to fill form. Please refresh the page and try again.", true);
      }
    });
  });

  document.getElementById('deleteProfile').addEventListener('click', async () => {
    const profileName = manageSelect.value;
    if (!profileName) return showStatus("Select a profile to delete", true);

    const { profiles = {} } = await chrome.storage.local.get('profiles');
    delete profiles[profileName];
    await chrome.storage.local.set({ profiles });
    showStatus(`Deleted profile: ${profileName}`);
    await loadProfiles();
  });
});
