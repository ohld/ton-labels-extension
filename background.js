// Fetch and store labels from GitHub and local files
async function fetchAndStoreTonLabels() {
    try {
        // Initialize empty labels object
        let mergedLabels = {};

        // Fetch labels from GitHub
        const response = await fetch('https://raw.githubusercontent.com/ton-studio/ton-labels/refs/heads/build/assets.json');
        const text = await response.text();

        // Parse JSONL format (each line is a JSON object)
        text.split('\n').forEach(line => {
            if (line.trim()) {
                try {
                    const data = JSON.parse(line);
                    // Store labels for both address formats (normal and non-bounceable)
                    if (data.address_uf) {
                        mergedLabels[data.address_uf] = data.label;
                    }
                    if (data.address_uf_nb) {
                        mergedLabels[data.address_uf_nb] = data.label;
                    }
                    console.log(`Added label for ${data.label}: ${data.address_uf || ''} / ${data.address_uf_nb || ''}`);
                } catch (err) {
                    console.error('Error parsing line:', line, err);
                }
            }
        });

        // Try to load custom labels file
        try {
            const customResponse = await fetch(chrome.runtime.getURL('custom_labels.json'));
            if (customResponse.ok) {
                const customLabels = await customResponse.json();
                // Merge labels, giving priority to custom labels
                mergedLabels = { ...mergedLabels, ...customLabels };
                console.log('Loaded custom labels file');
            }
        } catch (error) {
            // This is expected if the file doesn't exist, so we'll just log it at debug level
            console.debug('No custom labels file found (this is normal if you haven\'t created one)');
        }

        // Store in Chrome's storage
        await chrome.storage.local.set({ tonLabels: mergedLabels });

        // Log statistics about the labels database
        const labelsCount = Object.keys(mergedLabels).length;
        const databaseSize = new TextEncoder().encode(JSON.stringify(mergedLabels)).length;
        console.log(`TON labels updated successfully: loaded ${labelsCount} labels (${(databaseSize / 1024).toFixed(2)} KB)`);
    } catch (error) {
        console.error('Error fetching TON labels:', error);
    }
}

// Fetch labels when extension is installed or updated
chrome.runtime.onInstalled.addListener(fetchAndStoreTonLabels);

// Update labels periodically (every 24 hours)
setInterval(fetchAndStoreTonLabels, 24 * 60 * 60 * 1000);