// Function to replace address text with labels
async function replaceAddressesWithLabels() {
    try {
        // Get labels from storage
        const data = await chrome.storage.local.get('tonLabels');
        const labels = data.tonLabels || {};
        console.log('Loaded TON labels:', Object.keys(labels).length);

        // Find all elements that might contain shortened addresses (not just spans)
        const elements = document.querySelectorAll('span, div, a');

        elements.forEach(element => {
            const text = element.textContent?.trim();
            if (!text) return;

            // Check if the element contains a shortened address pattern (EQ/UQ followed by valid characters)
            // Match both standard ellipsis (…) and three dots (...)
            const shortenedPattern = /^(EQ|UQ)[A-Za-z0-9_-]+(?:…|\.{3})[A-Za-z0-9_-]+$/;

            if (shortenedPattern.test(text)) {
                console.log('Found shortened address:', text);

                // Split by either ellipsis or three dots
                const parts = text.split(/(?:…|\.{3})/);
                if (parts.length !== 2) return;

                const [prefix, suffix] = parts;

                // Find matching address in our database
                const matchingAddress = Object.keys(labels).find(address => {
                    const matchResult = address.startsWith(prefix) && address.endsWith(suffix);
                    if (matchResult) {
                        console.log('Matched address:', address, 'for', text);
                    }
                    return matchResult;
                });

                if (matchingAddress && labels[matchingAddress]) {
                    // Create a new link element
                    const link = document.createElement('a');
                    link.href = '/' + matchingAddress;
                    link.textContent = '🏷️ ' + labels[matchingAddress];
                    link.title = matchingAddress;
                    link.style.textDecoration = 'none';

                    // Only replace the innermost element containing just the address
                    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                        // Replace the element with the link
                        element.parentNode.replaceChild(link, element);
                        console.log(`Address replaced: ${matchingAddress} → ${labels[matchingAddress]}`);
                    } else {
                        // Try to find and replace just the text node that contains the address
                        element.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim() === text) {
                                const span = document.createElement('span');
                                span.appendChild(link);
                                element.replaceChild(span, node);
                                console.log(`Address text node replaced: ${matchingAddress} → ${labels[matchingAddress]}`);
                            }
                        });
                    }
                }
            }

            // Also check for full addresses
            const fullAddressPattern = /^(EQ|UQ)[A-Za-z0-9_-]{48}$/;
            if (fullAddressPattern.test(text) && labels[text]) {
                console.log('Found full address:', text);

                // Create a new link element
                const link = document.createElement('a');
                link.href = '/' + text;
                link.textContent = '🏷️ ' + labels[text];
                link.title = text;
                link.style.textDecoration = 'none';

                // Only replace the innermost element containing just the address
                if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                    // Replace the element with the link
                    element.parentNode.replaceChild(link, element);
                    console.log(`Full address replaced: ${text} → ${labels[text]}`);
                } else {
                    // Try to find and replace just the text node that contains the address
                    element.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim() === text) {
                            const span = document.createElement('span');
                            span.appendChild(link);
                            element.replaceChild(span, node);
                            console.log(`Full address text node replaced: ${text} → ${labels[text]}`);
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.error('Error replacing addresses with labels:', error);
    }
}

// Function to remove suspicious and scam transaction rows
function removeSuspiciousTransactions() {
    try {
        // Find all elements that contain the text 'SUSPICIOUS'
        const elements = document.querySelectorAll('div, span');

        elements.forEach(element => {
            if (element.textContent === 'SUSPICIOUS' || element.classList.contains('scam')) {
                // Find the parent anchor tag and remove it
                const transactionRow = element.closest('a');
                if (transactionRow) {
                    transactionRow.remove();
                    console.log('Removed suspicious/scam transaction row');
                }
            }
        });
    } catch (error) {
        console.error('Error removing suspicious transactions:', error);
    }
}

// Initial execution of both functions
replaceAddressesWithLabels();
removeSuspiciousTransactions();

// Watch for DOM changes to handle dynamically loaded content
const observer = new MutationObserver(() => {
    replaceAddressesWithLabels();
    removeSuspiciousTransactions();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});