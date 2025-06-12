console.log('ZeroInput content script loaded.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'autofill') {
    const data = message.payload;
    for (const key in data) {
      const el = document.querySelector(`[name="${key}"], #${key}`);
      if (el) el.value = data[key];
    }
    sendResponse({ success: true });
  }
});
