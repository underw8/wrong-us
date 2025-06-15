# URL Redirector & Text Replacer Chrome Extension

A Chrome extension that redirects URLs and replaces text on webpages with a beautiful Material Design 3 interface.

## Features

✨ **Modern Material Design 3 UI** - Beautiful, responsive interface following Google's latest design guidelines  
🔗 **URL Redirection** - Redirect any URL pattern using wildcards or regex  
📝 **Text Replacement** - Replace text on any webpage in real-time  
🌐 **UTF-8 Support** - Full Unicode support for international characters and emojis  
⚡ **Real-time Updates** - Changes apply immediately without page refresh  
🎯 **Pattern Matching** - Supports both simple wildcards (\*) and complex regex patterns

## Installation

1. **Build the extension:**

   ```bash
   yarn install
   yarn build
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the `dist` folder
   - The extension icon will appear in your toolbar

## Usage

### URL Redirection

- Click the extension icon to open the popup
- In the "URL Redirects" section, click "Add URL Rule"
- Enter a URL pattern in the first field:
  - **Wildcard**: `*avatar-management*.atl-paas.net*`
  - **Regex**: `^https://avatar-management.*/(48|128|256)$`
- Enter the redirect URL in the second field
- Rules are saved automatically and apply immediately

### Text Replacement

- In the "Text Replacements" section, click "Add Text Rule"
- Enter the text to find and the replacement text
- Text replacement works on all webpages in real-time
- Supports special characters and Unicode: `🔗 ➡️ 📝 ✨`

## Material Design Features

The extension features a modern Material Design 3 interface with:

- **Dynamic Color System** - Uses Material Design 3 color tokens
- **Roboto Typography** - Google's signature font family
- **Material Icons** - Consistent iconography throughout
- **Elevated Surfaces** - Cards and containers with proper elevation
- **Interactive States** - Hover and focus states for all interactive elements
- **Responsive Layout** - Adapts to different screen sizes
- **Accessibility** - Proper contrast ratios and keyboard navigation

## UTF-8 Support

The extension fully supports UTF-8 encoding:

- ✅ International characters (é, ñ, ü, etc.)
- ✅ Emojis and symbols (🔗, ➡️, 📝, ✨)
- ✅ Asian languages (中文, 日本語, 한국어)
- ✅ Mathematical symbols (∑, ∆, π)
- ✅ Special punctuation and diacritics

## Development

### Project Structure

```
src/
├── background/     # Service worker for URL redirection
├── content/        # Content script for text replacement
├── popup/          # Extension popup UI
├── types/          # Shared TypeScript interfaces
└── assets/         # Icons and static files
```

### Build System

- **TypeScript** - Type-safe development
- **ESLint v9** - Code linting with flat config
- **Material Design 3** - Modern UI components
- **Chrome Manifest V3** - Latest extension API

### Commands

```bash
yarn build          # Build the extension
yarn lint           # Run ESLint
yarn clean          # Clean build directory
```

## Examples

### Jira Avatar Redirection

```
From: *avatar-management*.atl-paas.net*
To: https://ca.slack-edge.com/T7Z35JWLQ-UR3LQQE0Y-e3a0fca501c8-512
```

### Text Replacement

```
From: "Hello World"
To: "¡Hola Mundo! 🌍"
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `declarativeNetRequest`, `storage`, `scripting`, `activeTab`
- **Architecture**: Service worker + content scripts
- **Storage**: Chrome sync storage for cross-device synchronization
- **Pattern Matching**: Automatic detection of wildcard vs regex patterns

## Troubleshooting

1. **Extension not loading**: Ensure you selected the `dist` folder, not the root folder
2. **Rules not working**: Check the browser console for any errors
3. **UTF-8 issues**: Verify your system supports UTF-8 encoding
4. **Pattern matching**: Test your regex patterns in a regex tester first

## License

MIT License - feel free to modify and distribute.

---

Built with ❤️ using Material Design 3 and modern web technologies.
