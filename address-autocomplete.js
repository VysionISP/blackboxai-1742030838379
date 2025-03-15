// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    initializeAutocomplete();
});

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
        validateAndUpdateUI(query, input, searchButton);

        // Clear previous timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Hide suggestions if input is too short
        if (query.length < 3) {
            suggestionsContainer.classList.add('hidden');
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
                        validateAndUpdateUI(address, input, searchButton);
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

    // Prevent form submission on enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });

    console.log('Autocomplete initialized successfully');
}

// Basic validation function
function validateAndUpdateUI(address, input, searchButton) {
    console.log('Validating address:', address);
    
    if (!address || address.length < 5) {
        input.classList.remove('border-red-500', 'border-gray-300');
        input.classList.add('border-primary');
        window.selectedAddress = '';
        searchButton.disabled = true;
        searchButton.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    const isValid = address.includes(' ') && /\d/.test(address);
    
    if (isValid) {
        window.selectedAddress = address;
        input.classList.remove('border-red-500', 'border-gray-300');
        input.classList.add('border-primary');
        searchButton.disabled = false;
        searchButton.classList.remove('opacity-50', 'cursor-not-allowed');
        updateSummary();
    } else {
        input.classList.remove('border-primary', 'border-gray-300');
        input.classList.add('border-red-500');
        window.selectedAddress = '';
        searchButton.disabled = true;
        searchButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Update summary in the confirmation step
function updateSummary() {
    const summaryAddress = document.getElementById('selected-address');
    if (summaryAddress && window.selectedAddress) {
        summaryAddress.textContent = window.selectedAddress;
    }
}
