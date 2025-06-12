# ZeroInput Extension

A Chrome extension that autofills forms using saved profiles with a single click. Works with both regular HTML forms and Google Forms.

## Features

- **Save Form Data**: Save your form inputs as profiles for later use
- **Auto-fill Forms**: Fill forms with saved data using a single click
- **Google Forms Support**: Specifically designed to work with Google Forms
- **Regular Forms Support**: Works with standard HTML forms
- **Profile Management**: Create, save, and delete multiple profiles

## Installation

1. **Download the Extension**:
   - Clone or download this repository
   - Extract the files to a folder on your computer

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the folder containing the extension files

3. **Verify Installation**:
   - You should see the ZeroInput extension icon in your Chrome toolbar
   - The extension is now ready to use!

## How to Use

### For Regular Forms

1. **Navigate to any form** on a website
2. **Fill out the form** with your information
3. **Click the ZeroInput extension icon**
4. **Enter a profile name** in the "Save Current Form" section
5. **Click "Save Form Data"**
6. **To fill the form later**:
   - Go to the same form (or any form with similar fields)
   - Click the extension icon
   - Select your saved profile
   - Click "Fill Form"

### For Google Forms

1. **Go to a Google Form** (docs.google.com/forms)
2. **Fill out the form** with your information
3. **Click the ZeroInput extension icon**
4. **Enter a profile name** and click "Save Form Data"
5. **To fill the form later**:
   - Go to the same Google Form
   - Click the extension icon
   - Select your saved profile
   - Click "Fill Form"

## Testing

Use the included `test-form.html` file to test the extension:

1. Open `test-form.html` in your browser
2. Fill out the form with test data
3. Save a profile using the extension
4. Refresh the page to clear the form
5. Use the extension to fill the form with your saved data

## Troubleshooting

### Extension Not Working on Google Forms

1. **Check Permissions**: Make sure the extension has permission to access Google Forms
2. **Refresh the Page**: Sometimes Google Forms need to be refreshed for the extension to work
3. **Check Console**: Open Developer Tools (F12) and check for any error messages
4. **Reinstall Extension**: Try removing and reinstalling the extension

### Form Fields Not Being Filled

1. **Field Names**: The extension uses question text to match fields. Make sure your saved profile has the correct question names
2. **Dynamic Content**: Some forms load content dynamically. Try waiting for the page to fully load
3. **Different Form Structure**: If the form structure has changed, you may need to save a new profile

### Extension Icon Not Appearing

1. **Check Installation**: Make sure the extension is properly installed
2. **Pin Extension**: Right-click the extension icon and select "Pin" to keep it visible
3. **Restart Chrome**: Sometimes a browser restart is needed

## Technical Details

### How It Works

- **Content Script**: Runs on web pages to interact with form elements
- **Google Forms Detection**: Automatically detects when you're on a Google Form
- **Element Matching**: Uses question text to match form fields
- **Event Dispatching**: Properly triggers form events to ensure the form recognizes changes

### Supported Form Elements

- Text inputs
- Email inputs
- Textareas
- Radio buttons
- Checkboxes
- Dropdown/select elements

### File Structure

```
ZeroInput/
├── manifest.json      # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── popup.css          # Popup styling
├── content.js         # Content script for form interaction
├── background.js      # Background service worker
├── icons/             # Extension icons
├── test-form.html     # Test form for debugging
└── README.md          # This file
```

## Privacy

- All form data is stored locally in your browser
- No data is sent to external servers
- You have full control over your saved profiles

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Try the test form to verify basic functionality
3. Make sure you're using the latest version of Chrome
4. Check that the extension has the necessary permissions

## Version History

- **v1.0**: Initial release with Google Forms support
- Added specialized Google Forms detection and handling
- Improved error handling and user feedback
- Enhanced form element matching for better compatibility 