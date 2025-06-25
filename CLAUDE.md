# CLAUDE.md - Wrong Us Chrome Extension

## Project Overview

This is a Chrome browser extension called "Wrong Us - The Internet Imposter" that provides URL redirection and text replacement functionality. The extension allows users to redirect links matching patterns and replace text on webpages in real-time.

## Architecture

- **Manifest Version**: 3 (modern Chrome extension format)
- **Language**: TypeScript with ES2020 target
- **Build System**: Custom Node.js build script with TypeScript compilation
- **Package Manager**: Yarn

### Project Structure

```
src/
├── background/       # Service worker for URL redirection rules
│   └── index.ts     # Main background script handling declarativeNetRequest
├── content/         # Content scripts for text replacement
│   └── index.ts     # Text replacement logic with DOM monitoring
├── popup/           # Extension popup UI
│   ├── index.ts     # Popup functionality
│   └── popup.html   # Popup interface
├── types/           # TypeScript type definitions
│   └── index.ts     # Shared interfaces (UrlRule, TextRule, StorageData)
└── assets/          # Extension icons and resources
    └── icons/       # 16x16, 48x48, 128x128 PNG icons
```

## Key Features

1. **URL Redirection**: Uses Chrome's `declarativeNetRequest` API to intercept and redirect URLs
2. **Text Replacement**: Real-time text replacement on webpages using content scripts
3. **Pattern Support**: Both wildcard patterns and regex patterns for URL matching
4. **Data Migration**: Handles migration from legacy storage format
5. **Material Design 3**: Modern UI with Google's design system

## Build & Development

### Scripts Available

- `yarn build` - Build production extension
- `yarn build:dev` - Build development version
- `yarn build:release` - Version bump (patch) + build
- `yarn lint` - Run ESLint checks
- `yarn clean` - Clean dist directory
- `yarn release` - Lint + build release

### Build Process

The build system (`scripts/build.js`):
1. Cleans the `dist/` directory
2. Compiles TypeScript using `tsc`
3. Copies static files (manifest.json, popup.html, assets)
4. Creates a zip package for Chrome Web Store distribution

### TypeScript Configuration

- **Target**: ES2020
- **Modules**: ES2020 with Node resolution
- **Strict mode**: Enabled
- **Output**: `dist/` directory
- **Includes**: All files in `src/`

## Chrome Extension Permissions

- `declarativeNetRequest` - For URL redirection
- `storage` - For saving rules in Chrome sync storage
- `scripting` - For content script injection
- `activeTab` - For accessing current tab
- `<all_urls>` - Host permissions for all URLs

## Storage Schema

The extension uses Chrome's `storage.sync` API with the following data structure:

```typescript
interface StorageData {
  urlRules: UrlRule[];     // URL redirection rules
  textRules: TextRule[];   // Text replacement rules
}

interface UrlRule {
  from: string;  // Source URL pattern (wildcard or regex)
  to: string;    // Target URL
}

interface TextRule {
  from: string;  // Text to find
  to: string;    // Replacement text
}
```

## Code Quality & Testing

- **ESLint**: Configured with TypeScript rules and Chrome extension globals
- **Jest**: Test framework setup (currently tests are disabled)
- **TypeScript**: Strict type checking enabled

### Linting Configuration

- Uses ESLint v9 with TypeScript plugin
- Chrome extension globals pre-configured
- Ignores `dist/`, `node_modules/`, and test files

## Development Guidelines

### Adding New Features

1. Update types in `src/types/index.ts` if needed
2. Implement logic in appropriate module (background/content/popup)
3. Test manually with `yarn build` and loading in Chrome
4. Run `yarn lint` to ensure code quality

### URL Redirection Logic

- Background script handles URL patterns using `declarativeNetRequest`
- Automatically detects regex vs wildcard patterns
- Supports multiple resource types (images, frames, XHR)
- Rules are dynamically updated when user changes settings

### Text Replacement Logic

- Content script monitors DOM for text changes
- Uses `MutationObserver` for dynamic content
- Escapes special regex characters for literal matching
- Applies rules to all text nodes in the page

## Common Tasks

### Run Development Build
```bash
yarn build:dev
```

### Load Extension in Chrome
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder

### Version Management
```bash
yarn version:patch    # Bump patch version
yarn version:minor    # Bump minor version  
yarn version:major    # Bump major version
```

### Create Release Package
```bash
yarn release  # Lint + version bump + build + zip
```

## Technical Notes

- The extension migrates old storage format automatically on install
- URL rules support both simple wildcards (*) and complex regex patterns
- Text replacement is case-sensitive and uses global replacement
- All storage operations use Chrome's sync storage for cross-device sync
- Extension follows Manifest V3 security requirements

## Security Considerations

- Extension has broad permissions (`<all_urls>`) for functionality
- User-provided regex patterns are used in URL matching
- Text replacement operates on all webpage content
- Storage is synced across user's Chrome instances

## Troubleshooting

### Common Issues

1. **Rules not applying**: Check browser console for errors
2. **Build failures**: Ensure Node.js >= 20.0.0 and TypeScript installed
3. **Extension not loading**: Verify `dist/` folder was selected, not source
4. **Storage issues**: Check Chrome's storage quota and sync status

### Debug Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Lint without fixing
yarn lint

# Clean and rebuild
yarn clean && yarn build
```

### Logs & Debugging

- Background script logs: Chrome DevTools > Extensions > Service Worker
- Content script logs: Regular page console (F12)  
- Popup logs: Right-click extension icon > Inspect popup

This extension provides a framework for URL redirection and text manipulation with a clean TypeScript architecture and modern Chrome extension APIs.