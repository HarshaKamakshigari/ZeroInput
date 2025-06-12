document.addEventListener('DOMContentLoaded', async () => {
  const profileSelect = document.getElementById('profileSelect');
  const manageSelect = document.getElementById('manageProfileSelect');
  const status = document.getElementById('status');

  const showStatus = (msg) => {
    status.textContent = msg;
    status.classList.remove('hidden');
    setTimeout(() => status.classList.add('hidden'), 2000);
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
    if (!profileName) return showStatus("Please enter a profile name");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const data = {};
        document.querySelectorAll('input, select, textarea').forEach(el => {
          const key = el.name || el.id;
          if (key) data[key] = el.value;
        });
        return data;
      }
    }, async (results) => {
      const formData = results[0].result;
      const { profiles = {} } = await chrome.storage.local.get('profiles');
      profiles[profileName] = formData;
      await chrome.storage.local.set({ profiles });
      showStatus(`Saved profile: ${profileName}`);
      await loadProfiles();
    });
  });

  document.getElementById('fillForm').addEventListener('click', async () => {
    const profileName = profileSelect.value;
    if (!profileName) return showStatus("Select a profile");

    const { profiles = {} } = await chrome.storage.local.get('profiles');
    const formData = profiles[profileName];
    if (!formData) return showStatus("Profile not found");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [formData],
      func: (data) => {
        for (const key in data) {
          const el = document.querySelector(`[name="${key}"], #${key}`);
          if (el) el.value = data[key];
        }
      }
    });
  });

  document.getElementById('deleteProfile').addEventListener('click', async () => {
    const profileName = manageSelect.value;
    if (!profileName) return showStatus("Select a profile to delete");

    const { profiles = {} } = await chrome.storage.local.get('profiles');
    delete profiles[profileName];
    await chrome.storage.local.set({ profiles });
    showStatus(`Deleted profile: ${profileName}`);
    await loadProfiles();
  });
});
