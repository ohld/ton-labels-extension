# TON Address Labels Chrome Extension

This Chrome extension enhances the browsing experience on tonviewer.com by displaying human-readable labels for TON blockchain addresses. It automatically fetches and updates a database of address labels from a public repository.

## Features

- Automatically replaces TON addresses with human-readable labels on tonviewer.com
- Periodically updates the labels database (every 24 hours)
- Works with dynamically loaded content
- Uses local storage for fast label lookups
- Supports custom labels through a local configuration file

## Installation

1. Clone this repository or download the source code
2. Open Chrome-based browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Custom Labels

To add your own custom labels:

1. Copy the example file: `cp custom_labels.example.json custom_labels.json`
2. Edit `custom_labels.json` and add your labels in the format:
```json
{
    "UQDSE2BHJi4Qowu4jgvqQ3_4-KFrR2x6DqPzFkMGczCgoLcK": "Label Name"
}
```
3. Reload the extension to apply your changes

Your custom labels will take precedence over the public labels database.

## Development

The extension consists of three main components:

- `manifest.json`: Extension configuration and permissions
- `background.js`: Handles fetching and storing the labels database
- `content.js`: Manages DOM manipulation and label replacement

## How it Works

1. When installed or updated, the extension fetches the latest labels from the TON Labels repository
2. Labels are stored in Chrome's local storage for quick access
3. When browsing tonviewer.com, the extension automatically replaces address text with corresponding labels
4. A MutationObserver ensures labels are applied to dynamically loaded content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Join TON Data hub comminuty: https://t.me/tondatahub.

## License

MIT

----