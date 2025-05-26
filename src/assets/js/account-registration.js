// Global alertTracker object to track shown alerts
window.alertTracker = {
    activeAlerts: {},
    
    // Add an alert to tracking
    add: function(type, message) {
        const key = `${type}:${message}`;
        if (this.activeAlerts[key]) {
            return false; // Already shown
        }
        
        this.activeAlerts[key] = true;
        
        // Auto-clear after timeout
        setTimeout(() => {
            delete this.activeAlerts[key];
        }, 5000); // Match toast timeout
        
        return true; // New alert
    },
    
    // Clear all alerts
    clear: function() {
        this.activeAlerts = {};
    }
};

// Global showCustomAlert function
window.showCustomAlert = function(title, message, type = "warning") {
    // Check if this exact alert is already being shown
    if (!window.alertTracker.add(type, message)) {
        return; // Skip if already showing this alert
    }
    
    // Check if toast is already being shown for this type
    if (window._toastShowing) {
        clearTimeout(window._toastTimer);
    }
    
    // Check if bootstrap toast is available
    if (typeof bootstrap !== 'undefined' && document.getElementById('toastAlert')) {
        // Use Bootstrap toast if available
        const toastEl = document.getElementById('toastAlert');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toastEl && toastTitle && toastMessage) {
            // Set toast content
            toastTitle.textContent = title || "Notification";
            toastMessage.textContent = message;
            
            // Reset all toast classes first
            toastEl.className = 'toast';
            
            // Add appropriate CSS class based on type
            switch(type) {
                case 'success':
                    toastEl.classList.add('toast-success');
                    break;
                case 'error':
                case 'danger':
                    toastEl.classList.add('toast-error');
                    break;
                case 'warning':
                    toastEl.classList.add('toast-warning');
                    break;
                case 'info':
                    toastEl.classList.add('toast-info');
                    break;
            }
            
            // Add appropriate icon based on type
            let iconHTML = '';
            switch(type) {
                case 'success':
                    iconHTML = '<i class="fas fa-check-circle me-2"></i>';
                    break;
                case 'error':
                case 'danger':
                    iconHTML = '<i class="fas fa-exclamation-circle me-2"></i>';
                    break;
                case 'warning':
                    iconHTML = '<i class="fas fa-exclamation-triangle me-2"></i>';
                    break;
                case 'info':
                    iconHTML = '<i class="fas fa-info-circle me-2"></i>';
                    break;
            }
            
            // Add icon if supported
            if (iconHTML && toastTitle.insertAdjacentHTML) {
                toastTitle.innerHTML = '';
                toastTitle.insertAdjacentHTML('afterbegin', iconHTML + title);
            }
            
            // Configure toast options
            const toastOptions = {
                animation: true,
                autohide: true,
                delay: 5000
            };
            
            // Show toast
            const toast = new bootstrap.Toast(toastEl, toastOptions);
            toast.show();
            
            // Set flag to prevent multiple toasts
            window._toastShowing = true;
            
            // Clear flag after toast is hidden
            window._toastTimer = setTimeout(() => {
                window._toastShowing = false;
            }, 5000);
            
            return;
        }
    }
    
    // Fallback to browser alert if toast is not available
    alert(message);
};

function upload_profile() {
    // Add CSS for animations
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .fade-out {
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Utility function to hide buttons
    function hideUploadAndSelfieButtons() {
        document.querySelector(".modal-body button:nth-child(1)").style.display = "none"; // Upload button
        document.querySelector(".modal-body button:nth-child(2)").style.display = "none"; // Selfie button
    }

    // Utility function to reset buttons
    function resetUploadAndSelfieButtons() {
        document.querySelector(".modal-body button:nth-child(1)").style.display = "block"; // Upload button
        document.querySelector(".modal-body button:nth-child(2)").style.display = "block"; // Selfie button
    }

    // Utility function to validate file
    function validateFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes

        if (!validTypes.includes(file.type)) {
            return { valid: false, message: "Please upload a valid image file (PNG, JPEG, JPG)." };
        }
        if (file.size > maxSize) {
            return { valid: false, message: "File size must be less than 5MB." };
        }
        return { valid: true };
    }

    // Add event listener to reset buttons when modal is opened
    document.getElementById('imageModal').addEventListener('shown.bs.modal', resetUploadAndSelfieButtons);

    // Image Preview and Upload
    function handleFileInput(event) {
        const file = event.target.files[0];
        switch (true) {
            case !!file: // If a file is selected
                const validation = validateFile(file);
                if (!validation.valid) {
                    alert(validation.message);
                    return; // Exit the function if the file is invalid
                }

                const reader = new FileReader();
                reader.onload = function () {
                    const imageData = reader.result;
                    // Set the preview image's source
                    document.getElementById('profile_pic-preview').src = imageData;
                    // Save the image data to the hidden input (Base64)
                    document.getElementById('profile_pic').value = imageData;
                    // Close the modal after preview is ready
                    const modal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
                    if (modal) modal.hide();
                };
                reader.readAsDataURL(file);
                break;

            default:
                alert("No file selected.");
                break;
        }
    }

    // Taking a Selfie
    let videoStream;

    function takeSelfie() {
        hideUploadAndSelfieButtons(); // Hide buttons when selfie option is clicked
        const video = document.getElementById('selfieVideo');
        const captureButton = document.getElementById('captureButton');

        // Access webcam
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    videoStream = stream;
                    video.srcObject = stream;
                    video.style.display = 'block';
                    video.play();
                    captureButton.style.display = 'inline-block';
                })
                .catch(function (error) {
                    alert("Error accessing webcam: " + error);
                });
        }
    }

    // Capture Selfie and Stop Camera
    function captureSelfie() {
        const video = document.getElementById('selfieVideo');
        const canvas = document.getElementById('selfieCanvas');
        const ctx = canvas.getContext('2d');

        // Capture the image from the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/png'); // Convert to Base64
        document.getElementById('profile_pic-preview').src = dataURL;
        document.getElementById('profile_pic').value = dataURL; // Store in hidden input

        stopCamera();

        const modal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
        modal.hide();
    }

    // Stop the camera stream
    function stopCamera() {
        const video = document.getElementById('selfieVideo');
        const captureButton = document.getElementById('captureButton');

        if (videoStream) {
            const tracks = videoStream.getTracks();
            tracks.forEach(track => track.stop());
        }

        video.style.display = 'none';
        captureButton.style.display = 'none';
    }

    // Event listeners
    document.getElementById('fileInput').addEventListener('change', handleFileInput);
    document.getElementById('selfieButton').addEventListener('click', takeSelfie);
    document.getElementById('captureButton').addEventListener('click', captureSelfie);
}

// Call the function to initialize everything
upload_profile();

function checkUsername() {
    let username = document.getElementById("owner-username").value; // Updated to match the correct input ID
    let feedback = document.getElementById("username-feedback");

    if (username.length < 4) {
        feedback.textContent = "Username must be at least 4 characters long.";
        return; // Exit if username is invalid
    }

    // Use the new registration.php endpoint with action parameter
    fetch(`../backends/account-registration.php?action=checkUsername&username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                feedback.textContent = "Username is already taken.";
                feedback.classList.remove("text-success");
                feedback.classList.add("text-danger");
            } else {
                feedback.textContent = "Username is available.";
                feedback.classList.remove("text-danger");
                feedback.classList.add("text-success");
            }
        })
        .catch(error => console.error("Error checking username:", error));
}

function validatePassword() {
    let password = document.getElementById("owner-password").value;
    let confirmPassword = document.getElementById("confirm-password").value;
    let passwordFeedback = document.getElementById("password-feedback");
    let confirmPasswordFeedback = document.getElementById("confirm-password-feedback");

    let passwordRequirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Clear feedback messages initially
    passwordFeedback.textContent = "";
    confirmPasswordFeedback.textContent = "";

    // Validate password requirements
    if (password.length < 8) {
        passwordFeedback.textContent = "Password must be at least 8 characters long.";
        return; // Exit if this condition fails
    }
    if (!password.match(/[A-Z]/)) {
        passwordFeedback.textContent = "Password must include at least one uppercase letter.";
        return; // Exit if this condition fails
    }
    if (!password.match(/[a-z]/)) {
        passwordFeedback.textContent = "Password must include at least one lowercase letter.";
        return; // Exit if this condition fails
    }
    if (!password.match(/\d/)) {
        passwordFeedback.textContent = "Password must include at least one number.";
        return; // Exit if this condition fails
    }
    if (!password.match(/[@$!%*?&]/)) {
        passwordFeedback.textContent = "Password must include at least one special character.";
        return; // Exit if this condition fails
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        confirmPasswordFeedback.textContent = "Passwords do not match.";
    } else {
        confirmPasswordFeedback.textContent = ""; // Clear feedback if they match
    }
}

function initialize() {
    checkUsername();
    validatePassword();
}

function credentials() {
    initialize();
}

// Contact management functionality consolidated into a single function
function createContactManager() {
    // Cache DOM elements to avoid repeated DOM queries
    let domCache = {};
    
    // Preload frequently used DOM elements
    function cacheElements() {
        domCache = {
            firstPhone: document.getElementById("first-phone"),
            firstEmail: document.getElementById("first-email"),
            firstPhoneButtons: document.getElementById("first-phone-buttons"),
            firstEmailButtons: document.getElementById("first-email-buttons"),
            additionalPhones: document.getElementById("additional-phones"),
            additionalEmails: document.getElementById("additional-emails")
        };
    }

    // Function to hide buttons - optimized with fewer DOM queries
function hideButtons(selector) {
        const buttons = document.querySelectorAll(`${selector} button`);
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
        btn.style.opacity = "0";
            // Use a single timeout instead of multiple
            if (i === buttons.length - 1) {
                setTimeout(() => {
                    for (let j = 0; j < buttons.length; j++) {
                        buttons[j].style.display = "none";
                    }
                }, 200);
            }
        }
    }

    // Function to show buttons - optimized with fewer DOM queries
function showButtons(selector) {
        const buttons = document.querySelectorAll(`${selector} button`);
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].style.display = "inline-block";
        }
        // Single timeout for all buttons
        setTimeout(() => {
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].style.opacity = "1";
            }
        }, 50);
    }

    // Function to update input layout - cached elements and reduced operations
function updateLayoutOnAdd(type) {
        const firstElement = domCache[`first${type.charAt(0).toUpperCase() + type.slice(1)}`];
        let firstWrapper = firstElement.closest(".col-md-12");
        let firstButtons = domCache[`first${type.charAt(0).toUpperCase() + type.slice(1)}Buttons`];

        if (!firstWrapper || !firstButtons) return;

        // Batch DOM operations
        requestAnimationFrame(() => {
    firstWrapper.classList.replace("col-md-12", "col-md-9");
            firstWrapper.style.display = "flex";
            firstWrapper.style.flexGrow = "1";
    firstButtons.style.display = "flex";
            firstButtons.style.opacity = "1";
        });
}

    // Function to reset layout - cached elements and reduced operations
function resetLayout(type) {
        const firstElement = domCache[`first${type.charAt(0).toUpperCase() + type.slice(1)}`];
        let firstWrapper = firstElement.closest(".col-md-9, .col-md-12"); // Match either class
        let firstButtons = domCache[`first${type.charAt(0).toUpperCase() + type.slice(1)}Buttons`];
        
        if (!firstWrapper || !firstButtons) return;
        
        const typeInputs = document.querySelectorAll(`#additional-${type}s .${type}-input`);
        if (typeInputs.length === 0) {
            // Batch DOM operations
            requestAnimationFrame(() => {
                // Ensure we're going back to the original layout
                if (firstWrapper.classList.contains('col-md-9')) {
        firstWrapper.classList.replace("col-md-9", "col-md-12");
                }
                
                // Remove any flex styling added
                firstWrapper.style.display = "";
                firstWrapper.style.flexGrow = "";
                
                // Ensure buttons are properly hidden
        firstButtons.style.opacity = "0";
                firstButtons.style.display = "none";
                
                // Also reset the parent container if needed
                const parentWrapper = document.getElementById(`first-${type}-wrapper`);
                if (parentWrapper) {
                    parentWrapper.className = "col-md-12 flex-grow-1";
                }
            });
        }
    }

    // Optimized function to check buttons visibility
function checkAndShowButtons() {
        // Get values only once and cache
        const phoneValue = domCache.firstPhone.value.trim();
        const emailValue = domCache.firstEmail.value.trim();
        
        const phoneValid = /^09\d{9}$/.test(phoneValue);
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
        
        // Cache DOM query results
        const phoneInputs = document.querySelectorAll("#additional-phones .phone-input");
        const emailInputs = document.querySelectorAll("#additional-emails .email-input");

    // Check phone field independently
        if (phoneValid && phoneInputs.length > 0) {
        showButtons("#first-phone-buttons");
    }
        
    // Check email field independently
        if (emailValid && emailInputs.length > 0) {
        showButtons("#first-email-buttons");
    } 
}

    // Simple function to toggle readonly attribute
function makeReadOnly(fieldId) {
        const element = document.getElementById(fieldId);
        if (element) element.setAttribute("readonly", true);
}

    // Simple function to make element editable
function alwaysEditable(fieldId) {
        const inputField = document.getElementById(fieldId);
        if (!inputField) return;
        
    inputField.removeAttribute("readonly");
    inputField.focus();
}

    // Optimized check for duplicate values
function isDuplicate(value, selector) {
        const inputs = document.querySelectorAll(selector);
        let count = 0;
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value === value) count++;
            if (count > 1) return true;
        }
        return false;
    }

    // Debounce function to limit execution frequency
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Validate and Add Phone - with debounce for low-end devices
    const validateAndAddPhone = debounce(function(options = {}) {
        const phoneValue = domCache.firstPhone.value.trim();
        const config = {
            formatError: "Please enter a valid Philippine phone number (must start with 09 and be 11 digits long) before adding another.",
            duplicateError: "Phone number already exists. Please enter a unique number.",
            ...options
        };

        // Check if there are any empty additional phone fields
        const additionalPhoneFields = document.querySelectorAll('#additional-phones input[type="tel"]');
        for (let i = 0; i < additionalPhoneFields.length; i++) {
            if (!additionalPhoneFields[i].value.trim()) {
                showCustomAlert("Validation Error", "Please fill in all existing phone fields before adding a new one.", "warning");
                additionalPhoneFields[i].focus();
                return;
            }
            
            // Also validate format
            if (!/^09\d{9}$/.test(additionalPhoneFields[i].value.trim())) {
                showCustomAlert("Format Error", config.formatError, "warning");
                additionalPhoneFields[i].focus();
                return;
            }
        }

        // Validate first phone field
    if (!/^09\d{9}$/.test(phoneValue)) {
            showCustomAlert("Format Error", config.formatError, "warning");
            domCache.firstPhone.focus();
        return;
    }

        // Check for duplicates
    if (isDuplicate(phoneValue, "#phone-container input")) {
            showCustomAlert("Duplicate Error", config.duplicateError, "warning");
            domCache.firstPhone.focus();
        return;
    }

        // All validation passed, proceed with adding
    makeReadOnly("first-phone");
    addPhoneNumber();
    checkAndShowButtons();
    updateLayoutOnAdd("phone");
    }, 300);

    // Validate and Add Email - with debounce for low-end devices
    const validateAndAddEmail = debounce(function(options = {}) {
        const emailValue = domCache.firstEmail.value.trim();
        const config = {
            formatError: "Please enter a valid email address before adding another.",
            duplicateError: "Email address already exists. Please enter a unique email.",
            ...options
        };

        // Check if there are any empty additional email fields
        const additionalEmailFields = document.querySelectorAll('#additional-emails input[type="email"]');
        for (let i = 0; i < additionalEmailFields.length; i++) {
            if (!additionalEmailFields[i].value.trim()) {
                showCustomAlert("Validation Error", "Please fill in all existing email fields before adding a new one.", "warning");
                additionalEmailFields[i].focus();
                return;
            }
            
            // Also validate format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(additionalEmailFields[i].value.trim())) {
                showCustomAlert("Format Error", config.formatError, "warning");
                additionalEmailFields[i].focus();
                return;
            }
        }

        // Validate first email field
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            showCustomAlert("Format Error", config.formatError, "warning");
            domCache.firstEmail.focus();
        return;
    }

        // Check for duplicates
    if (isDuplicate(emailValue, "#email-container input")) {
            showCustomAlert("Duplicate Error", config.duplicateError, "warning");
            domCache.firstEmail.focus();
        return;
    }

        // All validation passed, proceed with adding
    makeReadOnly("first-email");
    addEmail();
    checkAndShowButtons();
    updateLayoutOnAdd("email");
    }, 300);

    // Validate additional phone inputs
    function validatePhoneInput(fieldId, options = {}) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        // Skip validation if we're removing an input
        if (input.dataset.skipping === "true") return true;
        
        const value = input.value.trim();
        
        // Skip validation if input is empty and we're in cleanup mode
        if (value === "" && window._cleanupMode) return true;
        
        const config = {
            formatError: "Please enter a valid Philippine phone number (must start with 09 and be 11 digits long).",
            duplicateError: "Phone number already exists. Please enter a unique number.",
            ...options
        };
        
        // Validate Philippines phone number format
        if (!/^09\d{9}$/.test(value)) {
            showCustomAlert("Format Error", config.formatError, "warning");
            input.focus();
            return false;
        }
        
        // Check for duplicates
        if (isDuplicate(value, "#phone-container input")) {
            showCustomAlert("Duplicate Error", config.duplicateError, "warning");
            input.value = "";
            input.focus();
            return false;
        }
        
        // If valid, make read-only
        makeReadOnly(fieldId);
        return true;
    }
    
    // Validate additional email inputs
    function validateEmailInput(fieldId, options = {}) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        // Skip validation if we're removing an input
        if (input.dataset.skipping === "true") return true;
        
        const value = input.value.trim();
        
        // Skip validation if input is empty and we're in cleanup mode
        if (value === "" && window._cleanupMode) return true;
        
        const config = {
            formatError: "Please enter a valid email address.",
            duplicateError: "Email address already exists. Please enter a unique email.",
            ...options
        };
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showCustomAlert("Format Error", config.formatError, "warning");
            input.value = "";
            input.focus();
            return false;
        }
        
        // Check for duplicates
        if (isDuplicate(value, "#email-container input")) {
            showCustomAlert("Duplicate Error", config.duplicateError, "warning");
            input.value = "";
            input.focus();
            return false;
        }
        
        // If valid, make read-only
        makeReadOnly(fieldId);
        return true;
    }

    // Optimized function to add phone number
function addPhoneNumber() {
        const additionalPhones = domCache.additionalPhones;
        if (!additionalPhones) return;
        
        // Check if there are any empty additional phone inputs first
        const existingInputs = additionalPhones.querySelectorAll('input[type="tel"]');
        for (let i = 0; i < existingInputs.length; i++) {
            if (!existingInputs[i].value.trim()) {
                existingInputs[i].focus();
                return; // Don't add a new field if there's an empty one
            }
        }
        
        const uniqueId = "phone-" + Date.now();
        const newPhoneDiv = document.createElement("div");
        newPhoneDiv.className = "row phone-input mt-2";

        // Create HTML string once instead of manipulating DOM multiple times
    newPhoneDiv.innerHTML = `
            <div class="col-md-12 d-flex align-items-center">
            <div class="form-floating flex-grow-1">
                    <input type="tel" class="form-control border-warning" id="${uniqueId}" name="mobile_number[]" placeholder="Mobile Number" required pattern="^09\\d{9}$" onblur="contactManager.validatePhoneInput('${uniqueId}')">
                <label>Mobile Number</label>
            </div>
            <div class="d-flex align-items-center ms-2">
                    <button type="button" class="btn btn-sm btn-warning text-white me-1 shadow-sm" onclick="contactManager.alwaysEditable('${uniqueId}')"><i class="fas fa-edit"></i></button>
                    <button type="button" class="btn btn-sm btn-danger text-white me-1 shadow-sm" onclick="contactManager.removeField(this, 'phone')"><i class="fas fa-trash"></i></button>
                </div>
        </div>
    `;
        
        // Single DOM insertion
    additionalPhones.appendChild(newPhoneDiv);
        
        // Focus on the new input
        setTimeout(() => {
            const newInput = document.getElementById(uniqueId);
            if (newInput) newInput.focus();
        }, 100);
    }

    // Optimized function to add email
function addEmail() {
        const additionalEmails = domCache.additionalEmails;
        if (!additionalEmails) return;
        
        // Check if there are any empty additional email inputs first
        const existingInputs = additionalEmails.querySelectorAll('input[type="email"]');
        for (let i = 0; i < existingInputs.length; i++) {
            if (!existingInputs[i].value.trim()) {
                existingInputs[i].focus();
                return; // Don't add a new field if there's an empty one
            }
        }
        
        const uniqueId = "email-" + Date.now();
        const newEmailDiv = document.createElement("div");
        newEmailDiv.className = "row email-input mt-2";

        // Create HTML string once
    newEmailDiv.innerHTML = `
            <div class="col-md-12 d-flex align-items-center">
            <div class="form-floating flex-grow-1">
                    <input type="email" class="form-control border-warning" id="${uniqueId}" name="email[]" placeholder="Email Address" required onblur="contactManager.validateEmailInput('${uniqueId}')">
                <label>Email Address</label>
            </div>
            <div class="d-flex align-items-center ms-2">
                    <button type="button" class="btn btn-sm btn-warning text-white me-1 shadow-sm" onclick="contactManager.alwaysEditable('${uniqueId}')"><i class="fas fa-edit"></i></button>
                    <button type="button" class="btn btn-sm btn-danger text-white me-1 shadow-sm" onclick="contactManager.removeField(this, 'email')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        // Single DOM insertion
        additionalEmails.appendChild(newEmailDiv);
        
        // Focus on the new input
        setTimeout(() => {
            const newInput = document.getElementById(uniqueId);
            if (newInput) newInput.focus();
        }, 100);
    }

    // Completely reset layout when all additional fields are removed
    function completeLayoutReset(type) {
        // Force rendering pause to ensure changes apply cleanly
        document.body.style.pointerEvents = "none";
        
        try {
            // Get all needed elements
            const firstElement = domCache[`first${type.charAt(0).toUpperCase() + type.slice(1)}`];
            const buttonContainer = domCache[`first${type.charAt(0).toUpperCase() + type.slice(1)}Buttons`];
            const additionalContainer = document.getElementById(`additional-${type}s`);
            
            if (!firstElement) return;
            
            // Find all parent containers
            const wrapperElement = document.getElementById(`first-${type}-wrapper`);
            const colWrapper = firstElement.closest(".col-md-9, .col-md-12, .flex-grow-1");
            const parentContainer = document.getElementById(`${type}-container`);
            
            // Reset DOM structure completely
            if (parentContainer) {
                // Get the original HTML structure based on the type
                let originalHTML = '';
                
                if (type === 'phone') {
                    originalHTML = `
                        <div class="p-3">
                            <div class="row phone-input">
                                <!-- First phone input and buttons in the same row -->
                                <div class="col-md-12 flex-grow-1" id="first-phone-wrapper">
                                    <div class="form-floating flex-grow-1">
                                        <input type="tel" class="form-control border-warning" id="first-phone" name="mobile_number[]" placeholder="Mobile Number" required pattern="^09\\d{9}$">
                                        <label>Mobile Number</label>
                                    </div>
                                    <!-- Button container - will be populated by JS -->
                                    <div class="d-flex align-items-center ms-2 first-contact-buttons" id="first-phone-buttons" style="display: none;"></div>
                                </div>
                            </div>
                            <div id="additional-phones"></div>
                            <button type="button" class="btn btn-sm btn-warning text-white mt-3 shadow-sm w-100" onclick="contactManager.validateAndAddPhone()">
                                <i class="fas fa-plus"></i> Add More Phone
                            </button>
                        </div>
                    `;
                } else if (type === 'email') {
                    originalHTML = `
                        <div class="p-3">
                            <div class="row email-input">
                                <!-- First email input and buttons in the same row -->
                                <div class="col-md-12 flex-grow-1" id="first-email-wrapper">
                                    <div class="form-floating flex-grow-1">
                                        <input type="email" class="form-control border-warning" id="first-email" name="email[]" placeholder="Email Address" required>
                                        <label>Email Address</label>
                                    </div>
                                    <!-- Button container - will be populated by JS -->
                                    <div class="d-flex align-items-center ms-2 first-contact-buttons" id="first-email-buttons" style="display: none;"></div>
                                </div>
                            </div>
                            <div id="additional-emails"></div>
                            <button type="button" class="btn btn-sm btn-warning text-white mt-3 shadow-sm w-100" onclick="contactManager.validateAndAddEmail()">
                                <i class="fas fa-plus"></i> Add More Email
                            </button>
        </div>
    `;
                }
                
                // Save the current input value
                const currentValue = firstElement.value;
                
                // Replace the HTML completely
                requestAnimationFrame(() => {
                    // Replace HTML
                    parentContainer.innerHTML = originalHTML;
                    
                    // Restore the input value
                    const newFirstElement = document.getElementById(`first-${type}`);
                    if (newFirstElement && currentValue) {
                        newFirstElement.value = currentValue;
                    }
                    
                    // Update the DOM cache
                    setTimeout(() => cacheElements(), 50);
                    
                    // Ensure buttons are hidden
                    setTimeout(() => {
                        const newButtonContainer = document.getElementById(`first-${type}-buttons`);
                        if (newButtonContainer) {
                            newButtonContainer.style.display = "none";
                            newButtonContainer.style.opacity = "0";
                        }
                    }, 100);
                });
            } else {
                // Fallback to the previous approach if parent container is not found
                requestAnimationFrame(() => {
                    // Reset class names
                    if (colWrapper) {
                        colWrapper.className = "col-md-12";
                        colWrapper.style.display = "";
                        colWrapper.style.flexGrow = "";
                    }
                    
                    if (wrapperElement) {
                        wrapperElement.className = "col-md-12 flex-grow-1";
                    }
                    
                    // Hide all buttons
                    if (buttonContainer) {
                        buttonContainer.style.display = "none";
                        buttonContainer.style.opacity = "0";
                    }
                    
                    // Reset additional container
                    if (additionalContainer) {
                        additionalContainer.innerHTML = "";
                    }
                });
            }
        } finally {
            // Re-enable user interaction after short delay
            setTimeout(() => {
                document.body.style.pointerEvents = "";
            }, 300);
        }
    }
    
    // Remove added fields with optimized DOM operations
function removeField(button, type) {
        const entry = button.closest(".row");
        if (!entry) return;
        
        // Remove with animation for better UX even on low-end devices
        entry.style.opacity = "0";
        entry.style.transition = "opacity 0.2s";
        
        // First check how many additional fields exist
        const allAdditionalFields = document.querySelectorAll(`#additional-${type}s .${type}-input`).length;
        
        // If this is the only additional field, prepare for complete reset
        if (allAdditionalFields === 1) {
            // Set a flag to avoid validation alerts during cleanup
            window._cleanupMode = true;
            
            setTimeout(() => {
                entry.remove();
                completeLayoutReset(type);
                
                // Make first input editable again
                const firstInput = document.getElementById(`first-${type}`);
                if (firstInput) {
                    firstInput.removeAttribute("readonly");
                }
                
                // Reset the cleanup flag
                setTimeout(() => {
                    window._cleanupMode = false;
                }, 300);
            }, 200);
        } else {
            // Regular removal for non-last items
            setTimeout(() => {
    entry.remove();
    checkAndShowButtons();
                checkButtonVisibility();
            }, 200);
        }
}

    // Delete all entries with optimized DOM operations
function deleteAllEntries() {
        // Clear values first - minimal DOM operations
        if (domCache.firstPhone) domCache.firstPhone.value = "";
        if (domCache.firstEmail) domCache.firstEmail.value = "";
        
        // Clear readonly attributes
        if (domCache.firstPhone) domCache.firstPhone.removeAttribute("readonly");
        if (domCache.firstEmail) domCache.firstEmail.removeAttribute("readonly");
        
        // Clear containers in one operation each
        if (domCache.additionalPhones) domCache.additionalPhones.innerHTML = "";
        if (domCache.additionalEmails) domCache.additionalEmails.innerHTML = "";

        // Complete reset of both layouts
        completeLayoutReset("phone");
        completeLayoutReset("email");
    }

    // Initialize the contact field action buttons
    function initializeActionButtons() {
        // Create phone field buttons
        const phoneButtonsContainer = document.getElementById('first-phone-buttons');
        if (phoneButtonsContainer) {
            phoneButtonsContainer.innerHTML = `
                <button type="button" class="btn btn-sm btn-warning text-white me-1 shadow-sm" onclick="contactManager.alwaysEditable('first-phone')">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger text-white shadow-sm" onclick="contactManager.deleteAllEntries()">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }
        
        // Create email field buttons
        const emailButtonsContainer = document.getElementById('first-email-buttons');
        if (emailButtonsContainer) {
            emailButtonsContainer.innerHTML = `
                <button type="button" class="btn btn-sm btn-warning text-white me-1 shadow-sm" onclick="contactManager.alwaysEditable('first-email')">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger text-white shadow-sm" onclick="contactManager.deleteAllEntries()">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }
    }

    // Initialize with performance optimizations
    function init() {
        // Set global cleanup flag
        window._cleanupMode = false;
        window._toastShowing = false;
        
        // Reset alert tracker
        window.alertTracker.clear();
        
        // Cache DOM elements first to reduce DOM queries
        cacheElements();
        
        // Initialize action buttons
        initializeActionButtons();
        
        // Force hide buttons for first fields immediately
        if (domCache.firstPhoneButtons) {
            domCache.firstPhoneButtons.style.opacity = "0";
            domCache.firstPhoneButtons.style.display = "none";
        }
        if (domCache.firstEmailButtons) {
            domCache.firstEmailButtons.style.opacity = "0";
            domCache.firstEmailButtons.style.display = "none";
        }
        
        // Ensure buttons are properly hidden
        document.querySelectorAll('.first-contact-buttons button').forEach(btn => {
            btn.style.opacity = "0";
            btn.style.display = "none";
        });
        
        // Make sure first fields are editable
        if (domCache.firstPhone) domCache.firstPhone.removeAttribute("readonly");
        if (domCache.firstEmail) domCache.firstEmail.removeAttribute("readonly");

        // Add event listeners with minimal impact
        const addPhoneBtn = document.getElementById("add-phone-btn");
        const addEmailBtn = document.getElementById("add-email-btn");
        const deleteAllBtn = document.getElementById("delete-all-btn");
        
        if (addPhoneBtn) {
            addPhoneBtn.addEventListener("click", validateAndAddPhone);
        }
        
        if (addEmailBtn) {
            addEmailBtn.addEventListener("click", validateAndAddEmail);
        }
        
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener("click", function() {
                // Set cleanup mode before deleting to prevent validation
                window._cleanupMode = true;
                deleteAllEntries();
                setTimeout(() => { window._cleanupMode = false; }, 500);
            });
        }
        
        // Check button visibility immediately and after a slight delay
        checkButtonVisibility();
        // Second check after DOM is fully loaded and rendered
        setTimeout(checkButtonVisibility, 500);
        
        // Use passive event listeners where possible
        window.addEventListener('resize', debounce(() => {
            checkAndShowButtons();
            checkButtonVisibility();
        }, 200), { passive: true });
    }

    // Check if buttons should be visible
    function checkButtonVisibility() {
        // Ensure buttons are hidden for first phone/email unless additional entries exist
        const phoneInputs = document.querySelectorAll("#additional-phones .phone-input");
        const emailInputs = document.querySelectorAll("#additional-emails .email-input");
        
        if (phoneInputs.length === 0 && domCache.firstPhoneButtons) {
            domCache.firstPhoneButtons.style.opacity = "0";
            domCache.firstPhoneButtons.style.display = "none";
        }
        
        if (emailInputs.length === 0 && domCache.firstEmailButtons) {
            domCache.firstEmailButtons.style.opacity = "0";
            domCache.firstEmailButtons.style.display = "none";
        }
    }

    // Expose only necessary methods
    return {
        init: init,
        makeReadOnly: makeReadOnly,
        alwaysEditable: alwaysEditable,
        removeField: removeField,
        deleteAllEntries: deleteAllEntries,
        validateAndAddPhone: validateAndAddPhone,
        validateAndAddEmail: validateAndAddEmail,
        checkButtonVisibility: checkButtonVisibility,
        validatePhoneInput: validatePhoneInput,
        validateEmailInput: validateEmailInput
    };
}

// Create instance and initialize
const contactManager = createContactManager();

// Initialize contact manager on DOM content loaded
document.addEventListener("DOMContentLoaded", function() {
    contactManager.init();
});

// Throttle function definition (simplified for performance)
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if (Date.now() - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Example updateDropdown function with lazy loading
function updateDropdown(inputValue, dropdownId, dataList, startIndex = 0) {
    const dropdown = $(`#${dropdownId}`);
    const maxItems = 10;
    const filteredData = dataList.filter(item => item.toLowerCase().includes(inputValue.toLowerCase()));
    
    // Load more items only if needed (using startIndex to paginate)
    const itemsToShow = filteredData.slice(startIndex, startIndex + maxItems);

    // Clear the dropdown first (optional for new input)
    dropdown.empty();

    // Add filtered items to the dropdown
    itemsToShow.forEach(item => {
        dropdown.append(`<div class="dropdown-item">${item}</div>`);
    });

    // Show the dropdown if there are items to display
    if (itemsToShow.length > 0) {
        dropdown.show().css({ opacity: 1 });
    } else {
        dropdown.hide().css({ opacity: 0 });
    }

    // Return the number of items currently shown for pagination
    return itemsToShow.length;
}

// Function to attach event handlers efficiently with lazy loading support
function dropdown(inputId, dropdownId, dataList) {
    const inputField = $(`#${inputId}`);
    const dropdown = $(`#${dropdownId}`);
    let currentIndex = 0; // Keep track of the loaded index for pagination

    // Use throttle for optimized input handling
    inputField.on("input", throttle(function () {
        currentIndex = 0; // Reset index when input changes
        updateDropdown($(this).val(), dropdownId, dataList, currentIndex);
    }, 300)); // Set throttle limit to 300ms

    // Handle selection from dropdown using event delegation
    $(document).on("click", `#${dropdownId} .dropdown-item`, function () {
        inputField.val($(this).text());
        dropdown.hide().css({ opacity: 0 });
    });

    // Hide dropdown when clicking outside input and dropdown
    $(document).click(function (event) {
        if (!$(event.target).closest(`#${inputId}, #${dropdownId}`).length) {
            dropdown.hide().css({ opacity: 0 });
        }
    });

    // Lazy load more items as user scrolls
    dropdown.scroll(throttle(function () {
        const dropdownHeight = dropdown.height();
        const scrollTop = dropdown.scrollTop();
        const scrollHeight = dropdown[0].scrollHeight;

        // Check if we're near the bottom of the dropdown
        if (scrollHeight - scrollTop <= dropdownHeight) {
            // Load more items only if needed
            const loadedItemCount = updateDropdown(inputField.val(), dropdownId, dataList, currentIndex);

            // If we've loaded fewer items than maxItems, stop lazy loading
            if (loadedItemCount < 10) {
                dropdown.off("scroll"); // Stop listening for scroll once all items are loaded
            } else {
                currentIndex += 10; // Increment the index to load the next set of items
            }
        }
    }, 200)); // Throttle the scroll event handler
}

// Initialize dropdown handlers
function initializeDropdownHandlers() {
    dropdown("barangay", "barangayDropdown", barangays);
    dropdown("city", "cityDropdown", cities);
    dropdown("municipality", "municipalityDropdown", municipalities);
    dropdown("province", "provinceDropdown", provinces);
    dropdown("region", "regionDropdown", regions); // Added region support
}

$(document).ready(function () {
    initializeDropdownHandlers();
});

(function () {
    const OwnerMapHandler = {
        map: null,
        currentMarker: null,
        isMapInitialized: false,
        mapOptions: {
            // Lower detail settings for low-end devices
            preferCanvas: true, // Use canvas for rendering (better performance)
            zoomControl: true,
            attributionControl: false, // Hide attribution for cleaner UI
            minZoom: 2,
            maxZoom: 16, // Lower max zoom to avoid excessive detail
            fadeAnimation: false, // Disable fade animations
            zoomAnimation: window.innerWidth > 768, // Only enable zoom animations on larger screens
            markerZoomAnimation: false, // Disable marker animations on zoom
            inertia: false // Disable inertia for maps
        }
    };

    // Lazy load the map only when the checkbox is checked
    document.getElementById("toggleOwnerMap").addEventListener("change", function() {
        let mapContainer = document.getElementById("owner_mapContainer");
        
        if (this.checked) {
            mapContainer.style.display = "block";
            initMap();
        } else {
            mapContainer.style.display = "none";
        }
    });

    // Separate map initialization function for better performance
    function initMap() {
        if (OwnerMapHandler.isMapInitialized) {
            // Just invalidate size if already initialized (handles container resize)
            if (OwnerMapHandler.map) {
                setTimeout(() => OwnerMapHandler.map.invalidateSize(), 100);
            }
            return;
        }

        // Create map with performance options
        OwnerMapHandler.map = L.map("owner_leafletMap", OwnerMapHandler.mapOptions).setView([0, 0], 2);

        // Use simplified tile layer options
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
            crossOrigin: "anonymous", 
            maxZoom: 16,
            updateWhenIdle: true, // Only update tiles when panning stops
            updateWhenZooming: false // Don't update tiles during zoom
        }).addTo(OwnerMapHandler.map);

        // Use a more efficient click handler with throttle
        OwnerMapHandler.map.on("click", throttle(function(event) {
            if (!event || !event.latlng) {
                console.error("Invalid event data received");
                return;
            }
            addPin(event.latlng.lat, event.latlng.lng);
        }, 500)); // Throttle to avoid multiple clicks

        // Mark as initialized
        OwnerMapHandler.isMapInitialized = true;

        // Try to get user location with lower accuracy for better performance
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;
                    
                    // Use requestAnimationFrame for smooth UI
                    requestAnimationFrame(() => {
                        OwnerMapHandler.map.setView([lat, lng], 12);
                    });
                },
                function(error) {
                    console.error("Geolocation error:", error.message);
                    notifyUser("Click on the map to set your location", false);
                },
                {
                    enableHighAccuracy: false, // Lower accuracy for better performance
                    timeout: 5000,
                    maximumAge: 300000 // Allow cached positions up to 5 minutes old
                }
            );
        } else {
            notifyUser("Geolocation is not supported by this browser", true);
        }
    }

    // Optimize pin adding function
    function addPin(lat, lng) {
        // Update hidden inputs before marker operations to ensure values are saved
        updateHiddenInputs(lat, lng);

        // Reuse existing marker rather than creating and destroying
        if (OwnerMapHandler.currentMarker) {
            OwnerMapHandler.currentMarker.setLatLng([lat, lng]);
        } else {
            // Create marker with simplified options
            OwnerMapHandler.currentMarker = L.marker([lat, lng], { 
                draggable: true, 
                autoPan: false, // Disable auto-panning for better performance
                interactive: true
            }).addTo(OwnerMapHandler.map);
            
            // Add event listener just once when marker is created
            OwnerMapHandler.currentMarker.on("dragend", throttle(function() {
                let newPos = this.getLatLng();
                updateHiddenInputs(newPos.lat, newPos.lng);
                this.bindPopup(createConfirmationPopup()).openPopup();
            }, 300));
        }
        
        // Show popup with a slight delay to avoid UI freeze
        setTimeout(() => {
            OwnerMapHandler.currentMarker.bindPopup(createConfirmationPopup()).openPopup();
        }, 50);
    }

    // Simplified update function
    function updateHiddenInputs(lat, lng) {
        document.getElementById("owner_xCoord").value = lng.toFixed(6); // Reduce precision
        document.getElementById("owner_yCoord").value = lat.toFixed(6); // Reduce precision
    }

    // Use template strings for better performance
    function createConfirmationPopup() {
        return `
            <div style="text-align: center;">
                <p><strong>Is this the location?</strong></p>
                <button type="button" onclick="confirmOwnerLocation(true, event)" class="btn btn-sm btn-success">Yes</button>
                <button type="button" onclick="confirmOwnerLocation(false, event)" class="btn btn-sm btn-danger">No</button>
            </div>
        `;
    }

    function createChangeLocationPopup() {
        return `
            <div style="text-align: center;">
                <p><strong>Change location?</strong></p>
                <button type="button" onclick="changeOwnerLocation(true, event)" class="btn btn-sm btn-success">Yes</button>
                <button type="button" onclick="changeOwnerLocation(false, event)" class="btn btn-sm btn-danger">No</button>
            </div>
        `;
    }

    // Optimize confirmation function
    window.confirmOwnerLocation = function(isConfirmed, event) {
        event?.preventDefault();
        event?.stopPropagation();

        if (!OwnerMapHandler.currentMarker) return;

        if (isConfirmed) {
            OwnerMapHandler.currentMarker.dragging.disable();
            OwnerMapHandler.currentMarker.closePopup();
            
            // Get values directly from marker
            let pos = OwnerMapHandler.currentMarker.getLatLng();
            updateHiddenInputs(pos.lat, pos.lng);
            
            notifyUser("Location confirmed!");
            
            // Show change popup with delay
            setTimeout(() => {
                OwnerMapHandler.currentMarker.bindPopup(createChangeLocationPopup()).openPopup();
            }, 100);
        } else {
            OwnerMapHandler.currentMarker.dragging.enable();
        }
    };

    // Optimize change location function
    window.changeOwnerLocation = function(isConfirmed, event) {
        event?.preventDefault();
        event?.stopPropagation();

        if (!OwnerMapHandler.currentMarker) return;

        if (isConfirmed) {
            OwnerMapHandler.currentMarker.dragging.enable();
            
            // Delay popup display
            setTimeout(() => {
                OwnerMapHandler.currentMarker.bindPopup(createConfirmationPopup()).openPopup();
            }, 50);
            
            notifyUser("You can now move the pin");
        } else {
            notifyUser("Pin remains at the confirmed location");
            OwnerMapHandler.currentMarker.closePopup();
        }
    };

    // Optimize form submission check
    document.querySelector("form").addEventListener("submit", function(event) {
        const ownerLat = document.getElementById("owner_yCoord").value;
        const ownerLng = document.getElementById("owner_xCoord").value;

        if (!ownerLat || !ownerLng) {
            event.preventDefault();
            notifyUser("Please select a location for the owner", true);
        }
    });
    
    // Optimized notification function
    function notifyUser(message, isError = false, event) {
        event?.preventDefault();
        event?.stopPropagation();

        // Check if there's already a notification to avoid creating multiple
        const existingNotification = document.getElementById('user-notification');
        if (existingNotification) {
            // Update existing notification instead of creating a new one
            existingNotification.textContent = message;
            existingNotification.style.backgroundColor = isError ? "#d9534f" : "#5cb85c";
            
            // Reset the timeout
            clearTimeout(existingNotification.timeout);
            existingNotification.timeout = setTimeout(() => {
                existingNotification.classList.add('fade-out');
                setTimeout(() => existingNotification.remove(), 300);
            }, 3000);
            return;
        }

        // Create notification with minimal DOM operations
        let notification = document.createElement("div");
        notification.id = 'user-notification';
        notification.textContent = message;
        
        // Use a single style string instead of multiple style property assignments
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            color: #fff;
            background-color: ${isError ? "#d9534f" : "#5cb85c"};
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
            transition: opacity 0.3s ease;
            will-change: opacity, transform;
            opacity: 0;
        `;
        
        document.body.appendChild(notification);
        
        // Force layout recalculation before animation
        notification.offsetHeight;
        
        // Fade in
        requestAnimationFrame(() => {
            notification.style.opacity = "1";
        });

        // Store the timeout reference on the element itself
        notification.timeout = setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
})();

// Form submission handler for Manager Registration
document.addEventListener("DOMContentLoaded", function() {
    // Initialize loading spinner
    setupLoadingSpinner();
    
    // Get the form
    const form = document.getElementById('registrationForm-Manager');
    
    // Check if form exists
    if (!form) return;
    
    // Attach event listener to form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm(this)) {
            return false;
        }
        
        // Show loading spinner
        showLoadingSpinner();
        
        // Create FormData object
        const formData = new FormData(this);
        
        // Add action parameter
        formData.append('action', 'registerManager');
        
        // Submit the form with AJAX
        fetch('../backends/account-registration.php', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header, it will be set automatically with boundary for FormData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Hide loading spinner
            hideLoadingSpinner();
            
            if (data.error) {
                // Show error notification
                showCustomAlert("Registration Error", data.error, "error");
            } else if (data.success) {
                // Show success message and redirect
                showRegistrationSuccess(data);
            }
        })
        .catch(error => {
            // Hide loading spinner
            hideLoadingSpinner();
            
            // Show error notification
            showCustomAlert("Error", "There was a problem with your registration: " + error.message, "error");
            console.error('Error:', error);
        });
    });
    
    // Event listeners for document upload previews
    document.getElementById('certificate_of_attendance')?.addEventListener('change', function() {
        previewImage(this, 'certificate_of_attendance-preview');
    });
    
    document.getElementById('s2_license')?.addEventListener('change', function() {
        previewImage(this, 's2_license-preview');
    });
    
    // Back button functionality
    document.getElementById('registration_back_btn')?.addEventListener('click', function() {
        window.history.back();
    });
});

// Set up loading spinner
function setupLoadingSpinner() {
    // Make sure the loading spinner exists
    let spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        // Create it if it doesn't exist
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.className = 'd-none position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
        spinner.style.backgroundColor = 'rgba(0,0,0,0.5)';
        spinner.style.zIndex = '9999';
        spinner.style.display = 'none';
        
        spinner.innerHTML = `
            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        
        document.body.appendChild(spinner);
    }
}

// Function to validate form before submission
function validateForm(form) {
    if (!form) {
        console.error('No form provided to validate');
        return false;
    }

    // Check for empty required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;
    
    // Array to track missing fields for notification
    const missingFields = [];
    
    requiredFields.forEach(field => {
        // Check if the field is empty
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
            
            // Store the first invalid field to focus later
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
            
            // Get field label or name for error message
            let fieldName = '';
            const label = field.closest('.form-floating')?.querySelector('label');
            if (label) {
                fieldName = label.textContent;
            } else {
                // Fallback to the name attribute or placeholder
                fieldName = field.getAttribute('placeholder') || field.name || 'Required field';
            }
            
            missingFields.push(fieldName);
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate username availability
    const usernameFeedback = document.getElementById('username-feedback');
    if (usernameFeedback && usernameFeedback.textContent.includes('already taken')) {
        showCustomAlert("Validation Error", "Username is already taken. Please choose another.", "warning");
        document.getElementById('owner-username').focus();
        return false;
    }
    
    // Validate password match
    const password = document.getElementById('owner-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';
    
    if (password !== confirmPassword) {
        showCustomAlert("Validation Error", "Passwords do not match.", "warning");
        document.getElementById('confirm-password')?.focus();
        return false;
    }
    
    // Validate password strength
    if (password.length > 0 && password.length < 8) {
        showCustomAlert("Validation Error", "Password must be at least 8 characters long.", "warning");
        document.getElementById('owner-password')?.focus();
        return false;
    }
    
    // Validate email format if email exists
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
            field.classList.add('is-invalid');
            isValid = false;
            showCustomAlert("Validation Error", "Please enter a valid email address.", "warning");
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });
    
    // Validate phone format if phone exists
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value.trim() && !/^09\d{9}$/.test(field.value.trim())) {
            field.classList.add('is-invalid');
            isValid = false;
            showCustomAlert("Validation Error", "Please enter a valid mobile number (must start with 09 and be 11 digits long).", "warning");
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });
    
    // Validate document uploads
    if (!validateFileUploads()) {
        return false;
    }
    
    // If map is enabled, validate coordinates
    const mapToggle = document.getElementById('toggleOwnerMap');
    if (mapToggle && mapToggle.checked) {
        const xCoord = document.getElementById('owner_xCoord')?.value;
        const yCoord = document.getElementById('owner_yCoord')?.value;
        
        if (!xCoord || !yCoord) {
            showCustomAlert("Validation Error", "Please select a location on the map.", "warning");
            return false;
        }
    }
    
    // Show appropriate error message if validation fails
    if (!isValid) {
        if (missingFields.length > 0) {
            let errorMsg = "Please fill in all required fields:";
            if (missingFields.length <= 3) {
                // List missing fields if there aren't too many
                errorMsg += " " + missingFields.join(", ");
            }
            showCustomAlert("Validation Error", errorMsg, "warning");
        } else {
            showCustomAlert("Validation Error", "Please fill in all required fields correctly.", "warning");
        }
        
        // Focus on the first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }
    
    return isValid;
}

// Function to validate file uploads
function validateFileUploads() {
    const certificateInput = document.getElementById('certificate_of_attendance');
    const licenseInput = document.getElementById('s2_license');
    
    if (!certificateInput || !licenseInput) {
        console.error('Document upload inputs not found');
        return false;
    }
    
    if (!certificateInput.files || certificateInput.files.length === 0) {
        showCustomAlert("Missing Document", "Please upload your Certificate of Attendance", "warning");
        return false;
    }
    
    if (!licenseInput.files || licenseInput.files.length === 0) {
        showCustomAlert("Missing Document", "Please upload your S2 License", "warning");
        return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    
    if (certificateInput.files[0].size > maxSize) {
        showCustomAlert("File Too Large", "Certificate file must be less than 5MB", "warning");
        return false;
    }
    
    if (licenseInput.files[0].size > maxSize) {
        showCustomAlert("File Too Large", "License file must be less than 5MB", "warning");
        return false;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (!validTypes.includes(certificateInput.files[0].type)) {
        showCustomAlert("Invalid File Type", "Certificate must be a valid image file (JPG, PNG)", "warning");
        return false;
    }
    
    if (!validTypes.includes(licenseInput.files[0].type)) {
        showCustomAlert("Invalid File Type", "License must be a valid image file (JPG, PNG)", "warning");
        return false;
    }
    
    return true;
}

// Function to handle file uploads and previews
function handleFileUploads(formData) {
    // Already handled by the event listeners and form data
}

// Function to preview uploaded images
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    const file = input.files[0];
    
    if (file) {
        // Validate file size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showCustomAlert("File Too Large", "Image must be less than 5MB", "warning");
            input.value = ''; // Clear the input
            return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            showCustomAlert("Invalid File Type", "Please upload a valid image file (JPG, PNG)", "warning");
            input.value = ''; // Clear the input
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// Function to show loading spinner
function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('d-none');
        spinner.style.display = 'flex';
    } else {
        console.warn('Loading spinner element not found');
        // Create spinner if it doesn't exist
        setupLoadingSpinner();
        const newSpinner = document.getElementById('loadingSpinner');
        if (newSpinner) {
            newSpinner.classList.remove('d-none');
            newSpinner.style.display = 'flex';
        }
    }
}

// Function to hide loading spinner
function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('d-none');
        spinner.style.display = 'none';
    }
}

// Function to display successful registration
function showRegistrationSuccess(data) {
    // Hide spinner if it's still showing
    hideLoadingSpinner();
    
    // Show success message
    showCustomAlert("Registration Successful", "Your application has been submitted successfully. Your application ID is: " + data.application_id, "success");
    
    // Fade out the registration form with animation
    $('#registrationFormContainer').fadeOut(300, function() {
        // Once faded out, show status container with fade in
        $('#registrationStatusContainer').fadeIn(300);
        
        // Clear any existing displayed statuses
        $('#pendingStatus').hide();
        $('#approvedStatus').hide();
        
        // Show pending status (new registration will always be pending initially)
        $('#pendingStatus').fadeIn(300);
        $('#pendingApplicationId').text(data.application_id);
        
        // Scroll to the top to ensure user sees the status
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Check if user has application on page load and display appropriate content
$(document).ready(function() {
    // Show loading indicator while checking
    $('#registrationFormContainer').hide();
    showLoadingSpinner();
    
    // Check for existing application
    $.ajax({
        url: '../backends/account-registration.php',
        type: 'GET',
        data: { action: 'checkApplication' },
        dataType: 'json',
        success: function(response) {
            // Hide loading spinner once we have a response
            hideLoadingSpinner();
            
            if (response.success && response.has_application) {
                // User has an existing application
                $('#registrationFormContainer').hide();
                $('#registrationStatusContainer').show();
                
                // Show appropriate content based on status
                if (response.status === 'Pending') {
                    $('#pendingStatus').show();
                    $('#pendingApplicationId').text(response.application_id);
                    showCustomAlert("Application Status", "Your application is currently under review.", "info");
                } else if (response.status === 'Approved') {
                    $('#approvedStatus').show();
                    $('#approvedApplicationId').text(response.application_id);
                    showCustomAlert("Application Status", "Congratulations! Your application has been approved.", "success");
                } else if (response.status === 'Rejected') {
                    // For rejected status, show registration form again
                    $('#registrationStatusContainer').hide();
                    $('#registrationFormContainer').show();
                    
                    // Show rejection message
                    showCustomAlert("Application Rejected", response.message || "Your application has been rejected. Please review and resubmit.", "error");
                } else {
                    // Unknown status - show form
                    $('#registrationStatusContainer').hide();
                    $('#registrationFormContainer').show();
                    showCustomAlert("Status Unknown", "We couldn't determine your application status. Please contact support.", "warning");
                }
            } else {
                // No application or error - show registration form
                $('#registrationStatusContainer').hide();
                $('#registrationFormContainer').show();
                
                // If there was an error, show it
                if (response.error) {
                    showCustomAlert("Error", response.error, "error");
                }
            }
        },
        error: function(xhr, status, error) {
            // Hide loading spinner and show form on error
            hideLoadingSpinner();
            $('#registrationStatusContainer').hide();
            $('#registrationFormContainer').show();
            
            console.error("AJAX Error:", error);
            showCustomAlert("Connection Error", "Could not check application status. Please try again later.", "error");
        }
    });
});

// Initialize document previews
document.addEventListener('DOMContentLoaded', function() {
    // Set up preview for certificate upload
    const certificate_of_attendance = document.getElementById('certificate_of_attendance');
    const certificate_of_attendance_preview = document.getElementById('certificate_of_attendance-preview');
    
    if (certificate_of_attendance && certificate_of_attendance_preview) {
        certificate_of_attendance.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    certificate_of_attendance_preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Set up preview for license upload
    const s2_license = document.getElementById('s2_license');
    const s2_license_preview = document.getElementById('s2_license-preview');
    
    if (s2_license && s2_license_preview) {
        s2_license.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    s2_license_preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Initialize page elements and states
function initPage() {
    // Initialize display containers
    $('#registrationStatusContainer').hide();
    $('#pendingStatus').hide();
    $('#approvedStatus').hide();
    
    // Hide loading spinner initially
    hideLoadingSpinner();
    
    // Initialize form validation events
    $('#registrationForm-Manager input, #registrationForm-Manager select').on('change', function() {
        // Remove validation error styling when user changes input
        $(this).removeClass('is-invalid');
    });
    
    // Add back button functionality
    $('#registration_back_btn').on('click', function() {
        window.history.back();
    });
    
    // Initialize tooltips if they exist
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
}

// Call initPage on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    
    // Set up preview for certificate upload
    const certificate_of_attendance = document.getElementById('certificate_of_attendance');
    const certificate_of_attendance_preview = document.getElementById('certificate_of_attendance-preview');
    
    if (certificate_of_attendance && certificate_of_attendance_preview) {
        certificate_of_attendance.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    certificate_of_attendance_preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Set up preview for license upload
    const s2_license = document.getElementById('s2_license');
    const s2_license_preview = document.getElementById('s2_license-preview');
    
    if (s2_license && s2_license_preview) {
        s2_license.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    s2_license_preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});







