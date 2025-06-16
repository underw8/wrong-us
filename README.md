<div style="text-align: center; margin-bottom: 2rem;">
  <img src="src/assets/icons/icon128.png" alt="Internet Imposter" width="128" height="128" style="margin-bottom: 1rem; opacity: 0.9;">
  
  # The Internet Imposter
  
  Sneakily redirect links and replace text like a digital ninja. Your browser, your rules, your chaos!
</div>

## Features

✨ **Stealth Mode UI** - Beautiful Material Design 3 interface that looks totally innocent  
🔗 **Link Hijacking** - Redirect any URL pattern using wildcards or regex like a pro  
📝 **Text Infiltration** - Replace text on any webpage in real-time without anyone knowing  
🌐 **Global Operations** - Full UTF-8 support for international ninja missions  
⚡ **Instant Deployment** - Changes apply immediately without page refresh  
🎯 **Pattern Mastery** - Supports both simple wildcards (\*) and complex regex patterns

## Installation

1. **Prepare Your Arsenal:**

   ```bash
   yarn install
   yarn build
   ```

2. **Deploy the Agent:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the `dist` folder
   - The ninja extension icon will appear in your toolbar

## Mission Briefings

### 🎯 URL Hijacking Operations

- Click the extension icon to open your command center
- In the "URL Redirects" section, click "Add URL Rule"
- Enter your target pattern:
  - **Stealth Mode**: `*avatar-management*.atl-paas.net*`
  - **Ninja Regex**: `^https://avatar-management.*/(48|128|256)$`
- Enter the redirect destination
- Mission auto-saves and deploys immediately

### 📝 Text Infiltration Missions

- In the "Text Replacements" section, click "Add Text Rule"
- Enter the target text and replacement
- Text replacement works across all websites in real-time
- Supports international characters and emojis: `<img src="src/assets/icons/icon16.png" alt="icon" width="16" height="16" style="vertical-align: middle;"> ➡️ 🥷 ✨`

## Stealth Technology

The extension features cutting-edge ninja technology:

- **Invisible UI** - Material Design 3 color system that blends in perfectly
- **Silent Typography** - Google's Roboto font for maximum stealth
- **Coded Icons** - Material Icons that look completely innocent
- **Shadow Surfaces** - Cards and containers with proper ninja elevation
- **Ghost Interactions** - Hover and focus states that leave no trace
- **Adaptive Camouflage** - Responsive layout for any screen size
- **Accessibility Cloak** - Proper contrast ratios for undercover operations

## International Ninja Support

The extension operates globally with full UTF-8 encoding:

- ✅ European missions (é, ñ, ü, etc.)
- ✅ Emoji communications (<img src="src/assets/icons/icon16.png" alt="icon" width="16" height="16" style="vertical-align: middle;">, ➡️, 📝, ✨)
- ✅ Asian operations (中文, 日本語, 한국어)
- ✅ Mathematical codes (∑, ∆, π)
- ✅ Special symbols and diacritics

## Development

### Ninja Headquarters Structure

```
src/
├── background/     # Command center for URL operations
├── content/        # Field agents for text missions
├── popup/          # Mission control interface
├── types/          # Classified TypeScript intel
└── assets/         # Disguise materials and icons
```

### Ninja Tools

- **TypeScript** - Type-safe mission planning
- **ESLint v9** - Code quality surveillance
- **Material Design 3** - Perfect cover identity
- **Chrome Manifest V3** - Latest stealth protocols

### Command Operations

```bash
yarn build          # Compile ninja tools
yarn lint           # Security sweep
yarn clean          # Destroy evidence
```

## Mission Examples

### Operation Avatar Swap

```
Target: *avatar-management*.atl-paas.net*
Redirect: https://public.caidu.me/the-impostor.webp
```

### Operation Word Replacement

```
Target: "Hello World"
Replace: "Greetings Fellow Ninja! 🥷"
```

## Technical Specifications

- **Stealth Level**: Manifest V3 (maximum invisibility)
- **Clearance**: `declarativeNetRequest`, `storage`, `scripting`, `activeTab`
- **Architecture**: Service worker + field agents (content scripts)
- **Data Storage**: Chrome sync storage for multi-device operations
- **Pattern Recognition**: Automatic detection of wildcard vs regex patterns

## Troubleshooting

1. **Agent not deploying**: Ensure you selected the `dist` folder, not the source
2. **Mission failing**: Check browser console for error reports
3. **Encoding issues**: Verify UTF-8 support in your system
4. **Pattern problems**: Test regex patterns in a pattern analyzer first

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MIT License - Share the ninja knowledge freely.

See the [LICENSE](LICENSE) file for details.

## AI Generation Disclaimer

🤖 **This project was generated with AI assistance using Cursor and Claude.**

### Development Process

- **Code Generation**: 100% AI-generated using Cursor + Claude Sonnet
- **Human Oversight**: Reviewed, tested, and validated by human developer
- **Functionality**: All features have been manually verified to work as intended

### Important Notes

- This code is provided "as-is" with thorough testing but acknowledge AI generation
- Users should review and understand the code before use in production
- We encourage community review and contributions to improve the codebase
- No warranties are provided beyond standard MIT license terms

### For Contributors

If you'd like to contribute human-authored improvements or review AI-generated sections, pull requests are welcome! This helps strengthen the codebase with human insight and expertise.

---

Built with ❤️ by digital ninjas using [Cursor](https://cursor.sh/) and [Material Design 3](https://m3.material.io/) and modern stealth technologies. 🥷✨
