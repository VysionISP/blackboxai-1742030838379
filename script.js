let currentStep = 1;
const totalSteps = 4;

// Share selectedAddress between modules
window.selectedAddress = '';

function updateProgressBar() {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function updateStepIndicators() {
    for (let i = 1; i <= totalSteps; i++) {
        const indicator = document.getElementById(`indicator-${getStepName(i)}`);
        if (i < currentStep) {
            indicator.classList.remove('border-gray-300', 'text-gray-700');
            indicator.classList.add('bg-primary', 'text-white', 'border-primary');
        } else if (i === currentStep) {
            indicator.classList.remove('border-gray-300', 'text-gray-700');
            indicator.classList.add('border-primary', 'text-primary');
        } else {
            indicator.classList.remove('bg-primary', 'text-white', 'border-primary');
            indicator.classList.add('border-gray-300', 'text-gray-700');
        }
    }
}

function getStepName(step) {
    const steps = ['address', 'plans', 'details', 'confirm'];
    return steps[step - 1];
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('[id^="step-"]').forEach(el => el.classList.add('hidden'));
    
    // Show current step
    const nextStep = document.getElementById(`step-${getStepName(step)}`);
    nextStep.classList.remove('hidden');
    
    // Update progress
    updateProgressBar();
    updateStepIndicators();

    // Handle specific step transitions
    if (step === 2) {
        // Reset plan selection state
        const continueBtn = document.querySelector('#step-plans button:last-child');
        if (continueBtn) {
            continueBtn.disabled = true;
            continueBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

function validateStep() {
    switch(currentStep) {
        case 1:
            const addressInput = document.getElementById('address-input');
            if (!addressInput || !addressInput.value.trim()) {
                showError('Please enter a valid address');
                return false;
            }
            window.selectedAddress = addressInput.value.trim();
            return true;
        case 2:
            const selectedPlan = document.querySelector('.plan-card.selected');
            if (!selectedPlan) {
                showError('Please select a plan to continue');
                return false;
            }
            return true;
        case 3:
            const name = document.getElementById('user-name').value;
            const email = document.getElementById('user-email').value;
            const phone = document.getElementById('user-phone').value;
            
            if (!name || !email || !phone) {
                showError('Please fill in all fields');
                return false;
            }
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return false;
            }
            if (!isValidPhone(phone)) {
                showError('Please enter a valid phone number');
                return false;
            }
            return true;
        default:
            return true;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[\d\s-]{8,}$/.test(phone);
}

function showError(message) {
    // Create a temporary error message element
    const tempError = document.createElement('div');
    tempError.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded animate-fade-in';
    tempError.textContent = message;
    
    // Find the current step
    const currentStepElement = document.getElementById(`step-${getStepName(currentStep)}`);
    
    // Remove any existing error messages
    const existingError = currentStepElement.querySelector('.bg-red-100');
    if (existingError) {
        existingError.remove();
    }
    
    // Insert error at the top of the current step
    currentStepElement.insertBefore(tempError, currentStepElement.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (tempError.parentNode) {
            tempError.classList.add('animate-fade-out');
            setTimeout(() => tempError.remove(), 300);
        }
    }, 5000);
}

function nextStep() {
    if (validateStep()) {
        if (currentStep < totalSteps) {
            // Update summary before moving to next step
            if (currentStep === 1) {
                const addressElement = document.getElementById('selected-address');
                if (addressElement) {
                    addressElement.textContent = window.selectedAddress;
                }
            }
            
            currentStep++;
            showStep(currentStep);
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize address input
    const addressInput = document.getElementById('address-input');
    const searchButton = document.getElementById('search-btn');

    // Initially disable search button
    if (searchButton) {
        searchButton.disabled = true;
        searchButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    // Basic validation on input
    if (addressInput) {
        addressInput.addEventListener('input', () => {
            const address = addressInput.value.trim();
            const isValid = address.length >= 5 && 
                          address.includes(' ') && 
                          /\d/.test(address);
            
            if (isValid) {
                window.selectedAddress = address;
                addressInput.classList.remove('border-red-500');
                addressInput.classList.add('border-primary');
                if (searchButton) {
                    searchButton.disabled = false;
                    searchButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            } else {
                addressInput.classList.remove('border-primary');
                addressInput.classList.add('border-red-500');
                window.selectedAddress = '';
                if (searchButton) {
                    searchButton.disabled = true;
                    searchButton.classList.add('opacity-50', 'cursor-not-allowed');
                }
            }
        });
    }
    
    // Handle plan selection
    const planCards = document.querySelectorAll('.plan-card');
    
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from other cards
            planCards.forEach(c => {
                c.classList.remove('selected', 'border-primary');
                c.style.transform = 'none';
            });
            
            // Add selection to clicked card
            card.classList.add('selected', 'border-primary');
            card.style.transform = 'translateY(-10px)';
            
            // Update summary
            const planName = card.getAttribute('data-plan');
            const planCost = card.getAttribute('data-cost');
            
            const selectedPlanElement = document.getElementById('selected-plan');
            const selectedCostElement = document.getElementById('selected-cost');
            
            if (selectedPlanElement) selectedPlanElement.textContent = planName;
            if (selectedCostElement) selectedCostElement.textContent = planCost;
            
            // Enable continue button if it exists
            const continueBtn = document.querySelector('#step-plans button:last-child');
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    });
    
    // Show initial step
    showStep(currentStep);
});

function submitOrder() {
    // Here you would typically send the data to your backend
    alert('Order submitted successfully!');
}
