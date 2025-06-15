# URL Redirector and Text Replacer Chrome Extension

A Chrome extension that allows you to:

- Redirect specific URLs to different destinations
- Replace specific text on webpages with custom text

## Features

- URL Redirection: Automatically redirect matching URLs to specified destinations
- Text Replacement: Replace specific text on any webpage with custom text
- Easy-to-use interface for managing rules
- Rules persist across browser sessions
- Real-time updates when rules are modified

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your browser toolbar
2. To add a URL redirect:
   - Click "Add URL Rule"
   - Enter the source URL pattern
   - Enter the target URL
3. To add a text replacement:
   - Click "Add Text Rule"
   - Enter the text to be replaced
   - Enter the replacement text

## Development

The extension is built using Chrome Extension Manifest V3 and includes:

- `manifest.json`: Extension configuration
- `background.js`: Handles URL redirections
- `content.js`: Handles text replacements
- `popup.html/js`: User interface for managing rules

## Permissions

The extension requires the following permissions:

- `declarativeNetRequest`: For URL redirections
- `storage`: For saving rules
- `scripting`: For content script injection
- `<all_urls>`: To work on all websites

## License

MIT
