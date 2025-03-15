// Current step tracking
let currentStep = 1;
const totalSteps = 4;

// Step elements
const steps = {
    address: document.getElementById('step-address'),
    plans: document.getElementById('step-plans'),
    details: document.getElementById('step-details'),
    confirm: document.getElementById('step-confirm')
};

// Progress bar
const progressBar = document.getElementById('progress-bar');

// Step indicators
const indicators = {
    address: document.getElementById('indicator-address'),
    plans: document.getElementById('indicator-plans'),
    details: document.getElementById('indicator-details'),
    confirm: document.getElementById('indicator-confirm')
};

// Function to update progress bar with animation
function updateProgress() {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.transition = 'width 0.3s ease-in-out';
    progressBar.style.width = `${progress}%`;
}

// Function to update step indicators with animation
function updateIndicators() {
    Object.values(indicators).forEach((indicator, index) => {
        indicator.style.transition = 'all 0.3s ease-in-out';
        if (index + 1 < currentStep) {
            indicator.classList.remove('border-gray-300');
            indicator.classList.add('border-primary', 'bg-primary', 'text-white');
        } else if (index + 1 === currentStep) {
            indicator.classList.remove('border-gray-300', 'bg-primary', 'text-white');
            indicator.classList.add('border-primary');
        } else {
            indicator.classList.remove('border-primary', 'bg-primary', 'text-white');
            indicator.classList.add('border-gray-300');
        }
    });
}

// Function to show a step with animation
function showStep(stepElement) {
    stepElement.classList.remove('hidden');
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'translateX(20px)';
    
    requestAnimationFrame(() => {
        stepElement.style.transition = 'all 0.3s ease-in-out';
        stepElement.style.opacity = '1';
        stepElement.style.transform = 'translateX(0)';
    });
}

// Function to hide a step with animation
function hideStep(stepElement) {
    stepElement.style.transition = 'all 0.3s ease-in-out';
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        stepElement.classList.add('hidden');
        stepElement.style.transform = 'translateX(20px)';
    }, 300);
}

// Function to switch to a specific step
function switchToStep(step) {
    const stepNames = ['address', 'plans', 'details', 'confirm'];
    const currentStepName = stepNames[currentStep - 1];
    const nextStepName = stepNames[step - 1];

    // Don't proceed if address is not selected in step 1
    if (currentStep === 1 && step > currentStep && !window.selectedAddress) {
        const input = document.getElementById('address-input');
        input.classList.add('border-red-500');
        return;
    }

    // Don't proceed if plan is not selected in step 2
    if (currentStep === 2 && step > currentStep && !document.querySelector('.plan-card.border-primary')) {
        return;
    }

    // Don't proceed if details are not filled in step 3
    if (currentStep === 3 && step > currentStep) {
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const phone = document.getElementById('user-phone').value;
        if (!name || !email || !phone) {
            return;
        }
    }

    hideStep(steps[currentStepName]);
    setTimeout(() => {
        showStep(steps[nextStepName]);
    }, 300);

    currentStep = step;
    updateProgress();
    updateIndicators();
}

// Function to go to next step
function nextStep() {
    if (currentStep < totalSteps) {
        switchToStep(currentStep + 1);
    }
}

// Function to go to previous step
function previousStep() {
    if (currentStep > 1) {
        switchToStep(currentStep - 1);
    }
}

// Handle plan selection
document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => {
        // Remove selection from all cards
        document.querySelectorAll('.plan-card').forEach(c => {
            c.classList.remove('border-primary');
            c.style.transition = 'all 0.3s ease-in-out';
        });
        
        // Add selection to clicked card
        card.classList.add('border-primary');
        
        // Update summary
        const plan = card.dataset.plan;
        const cost = card.dataset.cost;
        document.getElementById('selected-plan').textContent = plan;
        document.getElementById('selected-cost').textContent = cost;
    });
});

// Function to submit order
function submitOrder() {
    // Add your order submission logic here
    alert('Order submitted successfully!');
}

// Initialize progress bar and indicators
updateProgress();
updateIndicators();

// Add input validation for details step
['user-name', 'user-email', 'user-phone'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
        input.style.transition = 'all 0.3s ease-in-out';
        if (input.value.trim()) {
            input.classList.remove('border-red-500');
            input.classList.add('border-primary');
        } else {
            input.classList.remove('border-primary');
            input.classList.add('border-red-500');
        }
    });
});
