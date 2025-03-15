// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    initializeAutocomplete();
});

// API Configuration
const API_CONFIG = {
    url: 'https://mars.as24516.net:443/api/v1/locations',
    authToken: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InhnemFlQXNxdzN6dllCZ3RYVm9KWiJ9.eyJpc3MiOiJodHRwczovL3ZpcnR1dGVsLmF1LmF1dGgwLmNvbS8iLCJzdWIiOiJZamlvUHZYQWZsNFBldWdIMXRTYThBU2RGTk9uTEZqUkBjbGllbnRzIiwiYXVkIjoibWFycy5hczI0NTE2Lm5ldCIsImlhdCI6MTc0MjA0MDIwMywiZXhwIjoxNzQ0NjMyMjAzLCJzY29wZSI6InJlYWQ6c2VydmljZS1xdWFsaWZpY2F0aW9ucyBhcGk6cHJvZHVjdGlvbiByZWFkOmxvY2F0aW9ucyByZWFkOmRlbW9ncmFwaGljcyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyIsImF6cCI6IllqaW9QdlhBZmw0UGV1Z0gxdFNhOEFTZEZOT25MRmpSIn0.SXPJqAw3I0n3AGnuWQRE0uqsHNjsdZFtmmmIUa_KBYhU7X3E3LdJ8LWrqYrFOzNGOxf_JqLZL8aFbTdIuXw48yfPZ-rxhNpM1OQLTS5JJ9alnDIm2OU5oU-C1LypbEZqIlo6EdXQ4xdExaEoZYpCkEcw_B-DC4PtcwmR7C-VW_QlpQkIfhsE2Zr_feAAA-JwPgKmNaqP0d5VW3cxUsee17lClnZLJcQOLhHqvtligi8lpx3YBBqXIE8AK8x9IZxq0-wySgqw3lsGjKCZ_VqfNyDBinFQ0rWCxlPuU3srFkvaOzrGlUbVDlMRWLhw5bYJSk7WTB1AUTxHvzNKEMUdxg'
};

// Initialize the autocomplete
function initializeAutocomplete() {
    console.log('Initializing autocomplete');
    
    const input = document.getElementById('address-input');
    const searchButton = document.getElementById('search-btn');
    const suggestionsContainer = document.getElementById('address-suggestions');

    if (!input || !searchButton || !suggestionsContainer) {
        console.error('Required elements not found');
        return;
    }

    // Create the session token for better performance
    const sessionToken = new google.maps.places.AutocompleteSessionToken();

    // Create the autocomplete service
    const service = new google.maps.places.AutocompleteService();

    // Handle input changes
    let timeoutId = null;
    input.addEventListener('input', () => {
        const query = input.value.trim();

        // Clear previous timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Hide suggestions if input is too short
        if (query.length < 3) {
            suggestionsContainer.classList.add('hidden');
            searchButton.disabled = true;
            searchButton.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        // Show loading state
        suggestionsContainer.innerHTML = `
            <div class="p-3 text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i>Loading suggestions...
            </div>
        `;
        suggestionsContainer.classList.remove('hidden');

        // Debounce the API call
        timeoutId = setTimeout(() => {
            service.getPlacePredictions({
                input: query,
                componentRestrictions: { country: 'au' },
                sessionToken,
                types: ['address']
            }, (predictions, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
                    suggestionsContainer.innerHTML = `
                        <div class="p-3 text-gray-500">
                            <i class="fas fa-exclamation-circle mr-2"></i>No suggestions found
                        </div>
                    `;
                    searchButton.disabled = true;
                    searchButton.classList.add('opacity-50', 'cursor-not-allowed');
                    return;
                }

                // Create suggestions HTML
                const suggestionsHtml = predictions
                    .map(prediction => {
                        const parts = prediction.description.split(',');
                        const mainText = parts[0];
                        const secondaryText = parts.slice(1).join(',').trim();
                        
                        return `
                            <div class="suggestion-item p-3 hover:bg-gray-100 cursor-pointer flex items-start border-b border-gray-200 last:border-0" data-address="${prediction.description}">
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">${mainText}</div>
                                    ${secondaryText ? `<div class="text-sm text-gray-500">${secondaryText}</div>` : ''}
                                </div>
                                <i class="fas fa-map-marker-alt text-primary mt-1 ml-2"></i>
                            </div>
                        `;
                    })
                    .join('');

                // Update suggestions container
                suggestionsContainer.innerHTML = `
                    <div class="max-h-60 overflow-y-auto">
                        ${suggestionsHtml}
                    </div>
                `;

                // Add click handlers to suggestions
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const address = item.dataset.address;
                        input.value = address;
                        window.selectedAddress = address;
                        suggestionsContainer.classList.add('hidden');
                        
                        // Enable search button
                        searchButton.disabled = false;
                        searchButton.classList.remove('opacity-50', 'cursor-not-allowed');
                        
                        // Update input styling
                        input.classList.remove('border-red-500');
                        input.classList.add('border-primary');
                    });
                });
            });
        }, 300);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.classList.add('hidden');
        }
    });

    // Handle search button click
    searchButton.addEventListener('click', async () => {
        if (window.selectedAddress) {
            try {
                const errorMessage = document.getElementById('error-message');
                errorMessage.classList.remove('hidden');
                errorMessage.innerHTML = `
                    <div class="p-4">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            <span>Searching for address...</span>
                        </div>
                    </div>
                `;

                // First API call to get location ID
                const response = await fetch(API_CONFIG.url, {
                    method: 'POST',
                    headers: {
                        'Authorization': API_CONFIG.authToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address: window.selectedAddress
                    })
                });

                const data = await response.json();
                console.log('API Response:', data);

                // Display raw API response
                errorMessage.innerHTML = `
                    <div class="p-4">
                        <h3 class="text-lg font-bold mb-4">API Response:</h3>
                        <pre class="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (!data.responseData || data.responseData.length === 0) {
                    throw new Error('No addresses found');
                }

                // Store the first location ID and address if found
                if (data.responseData[0]) {
                    window.selectedLocationId = data.responseData[0].id;
                    document.getElementById('selected-address').textContent = data.responseData[0].formattedAddress;
                    nextStep();
                }

            } catch (error) {
                console.error('Error fetching addresses:', error);
                const errorMessage = document.getElementById('error-message');
                errorMessage.classList.remove('hidden');
                errorMessage.innerHTML = `
                    <div class="p-4">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            <span>Error: ${error.message || 'Failed to fetch addresses. Please try again.'}</span>
                        </div>
                        <pre class="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">${error.stack || ''}</pre>
                    </div>
                `;
            }
        } else {
            input.classList.add('border-red-500');
        }
    });

    // Prevent form submission on enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (window.selectedAddress) {
                searchButton.click();
            }
        }
    });

    console.log('Autocomplete initialized successfully');
}
