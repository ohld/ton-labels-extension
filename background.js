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

        // Get list of all JSON files in custom_labels directory
        const customLabelFiles = await new Promise((resolve) => {
            chrome.runtime.getPackageDirectoryEntry((root) => {
                root.getDirectory('custom_labels', {}, (dir) => {
                    const reader = dir.createReader();
                    const results = [];

                    function readEntries() {
                        reader.readEntries((entries) => {
                            if (entries.length) {
                                entries.forEach((entry) => {
                                    if (entry.isFile && entry.name.endsWith('.json')) {
                                        results.push(entry.name);
                                    }
                                });
                                readEntries(); // Continue reading if there are more entries
                            } else {
                                resolve(results);
                            }
                        });
                    }

                    readEntries();
                });
            });
        });

        // Load each custom labels file
        for (const filename of customLabelFiles) {
            try {
                const response = await fetch(chrome.runtime.getURL(`custom_labels/${filename}`));
                const customLabels = await response.json();

                // Merge labels, giving priority to later files
                mergedLabels = { ...mergedLabels, ...customLabels };
                console.log(`Loaded custom labels from ${filename}`);
            } catch (error) {
                console.error(`Error loading custom labels from ${filename}:`, error);
            }
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