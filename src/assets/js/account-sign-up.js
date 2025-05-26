/**
 * API Client Utilities without functions
 */

// Global variables for API operations
const BASE_URL = '../backends';
const API_ENDPOINTS = {
    SIGN_UP: '../backends/account_sign_up.php'
};

// Create global xhr object
let xhr = new XMLHttpRequest();
let originalBtnText = '';

// Global storage for UI elements
let passwordInput;
let signupForm;
let usernameInput;
let termsCheckbox;
let responseModalElement;
let typingTimer;

// Add styles directly to document
document.addEventListener('DOMContentLoaded', function() {
    // Add component styles
    const style = document.createElement('style');
    style.textContent = `
        .password-strength-container {
            margin-bottom: 15px;
        }
        
        .password-strength-text {
            font-size: 12px;
            color: #6c757d;
        }
        
        .toast-container {
            z-index: 1050;
        }
        
        .form-feedback {
            display: none;
            width: 100%;
            margin-top: 0.25rem;
            font-size: 0.875em;
        }
        
        .form-feedback-invalid {
            display: block;
            color: #dc3545;
        }
        
        .form-feedback-valid {
            display: block;
            color: #198754;
        }
        
        .password-strength-meter .requirement {
            margin-bottom: 2px;
            font-size: 0.8rem;
        }
        
        .requirement.met {
            color: #198754;
        }
        
        .requirement:not(.met) {
            color: #dc3545;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize UI elements
    passwordInput = document.getElementById('password');
    signupForm = document.getElementById('signupForm');
    usernameInput = document.getElementById('username');
    termsCheckbox = document.getElementById('termsCheck');
    
    // Create response modal
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="responseModal" tabindex="-1" aria-labelledby="responseModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-orange text-white border-0">
                            <h5 class="modal-title fw-bold" id="responseModalLabel">Success</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body py-4 text-center">
                            <p class="mb-0" id="modalMessage"></p>
                        </div>
                        <div class="modal-footer border-0 justify-content-center">
                            <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-orange text-white px-4 fw-bold" id="modalPrimaryBtn">Continue</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal into container
        modalContainer.innerHTML = modalHTML;
        
        // Get the modal element
        responseModalElement = document.getElementById('responseModal');
        
        // Add orange theme styles
        const orangeStyles = document.createElement('style');
        orangeStyles.textContent = `
            .bg-orange {
                background-color: var(--primary-color, #df811c);
            }
            
            .btn-orange {
                background-color: var(--primary-color, #df811c);
                border-color: var(--primary-color, #df811c);
            }
            
            .btn-orange:hover {
                background-color: var(--primary-dark, #c97216);
                border-color: var(--primary-dark, #c97216);
            }
            
            .modal-content {
                border-radius: 12px;
                overflow: hidden;
                background-color: var(--form-bg, #ffffff);
            }
            
            .modal-header {
                padding: 1rem 1rem 0.75rem;
                justify-content: center;
                position: relative;
            }
            
            .modal-header .modal-title {
                font-size: 1.5rem;
                text-align: center;
                color: white;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-shadow: 0 1px 1px rgba(0,0,0,0.1);
            }
            
            .modal-header .btn-close {
                position: absolute;
                right: 1rem;
                top: 1rem;
                margin: 0;
                padding: 0.5rem;
                box-shadow: none;
                opacity: 0.8;
            }
            
            .modal-header .btn-close:hover {
                opacity: 1;
            }
            
            .modal-header .btn-close:focus {
                box-shadow: none;
            }
            
            #modalMessage {
                font-size: 1.1rem;
                color: var(--text-color, #333333);
                padding: 0.5rem 1rem;
                line-height: 1.5;
                font-weight: 500;
            }
            
            #responseModal .modal-footer {
                padding: 1.5rem 1.5rem 1.8rem;
                gap: 1rem;
                border-top-color: var(--border-color, #e0e0e0);
            }
            
            #responseModal .modal-footer .btn {
                font-weight: 600;
                padding: 0.6rem 2rem;
                border-radius: 6px;
                min-width: 120px;
                font-size: 1rem;
                letter-spacing: 0.3px;
            }
            
            .btn-outline-secondary {
                color: var(--text-color, #333333);
                border-color: var(--border-color, #e0e0e0);
            }
            
            .btn-outline-secondary:hover {
                background-color: #f5f5f5;
                color: var(--text-color, #333333);
            }
            
            #responseModal .modal-body {
                padding-top: 2rem;
                padding-bottom: 1.5rem;
            }
            
            .modal-icon i {
                font-size: 64px !important;
                margin-bottom: 1.5rem !important;
                display: block;
            }
            
            .text-success {
                color: var(--secondary-color, #5a9e94) !important;
            }
        `;
        document.head.appendChild(orangeStyles);
        
        // Handle modal close event for redirects
        responseModalElement.addEventListener('hidden.bs.modal', function () {
            if (this.dataset.success === 'true' && this.dataset.redirectUrl) {
                window.location.href = this.dataset.redirectUrl;
            }
        });
        
        // Update primary button action based on modal status
        const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
        if (modalPrimaryBtn) {
            modalPrimaryBtn.addEventListener('click', function() {
                if (responseModalElement.dataset.success === 'true' && responseModalElement.dataset.redirectUrl) {
                    window.location.href = responseModalElement.dataset.redirectUrl;
                } else {
                    // Just close the modal if no redirect
                    const modalInstance = bootstrap.Modal.getInstance(responseModalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
            });
        }
    }
    
    // Setup password validation
    if (passwordInput) {
        // Create container for strength meter
        const meterContainer = document.createElement('div');
        meterContainer.className = 'password-strength-container mt-2';
        passwordInput.parentNode.appendChild(meterContainer);
        
        // Update strength meter on input
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            // Check password requirements in sequential order
            const requirements = [
                { id: 'minLength', label: 'At least 8 characters', test: () => password.length >= 8 },
                { id: 'hasLetter', label: 'Contains a letter', test: () => /[A-Za-z]/.test(password) },
                { id: 'hasNumber', label: 'Contains a number', test: () => /[0-9]/.test(password) },
                { id: 'hasSpecial', label: 'Contains a special character', test: () => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
            ];
            
            // Calculate which requirements are met and which should be shown
            let lastFailedIndex = -1;
            let metCount = 0;
            
            // Find the first requirement that is not met
            for (let i = 0; i < requirements.length; i++) {
                requirements[i].met = requirements[i].test();
                requirements[i].show = i === 0 || requirements[i-1].met;
                
                if (requirements[i].met) {
                    metCount++;
                } else if (lastFailedIndex === -1 && requirements[i].show) {
                    lastFailedIndex = i;
                }
            }
            
            // Calculate strength percentage based on met requirements
            const strengthPercentage = (metCount / requirements.length) * 100;
            
            // Create visual meter
            let strengthClass = 'bg-danger';
            let strengthText = 'Weak';
            
            if (strengthPercentage >= 75) {
                strengthClass = 'bg-success';
                strengthText = 'Strong';
            } else if (strengthPercentage >= 50) {
                strengthClass = 'bg-warning';
                strengthText = 'Moderate';
            }
            
            meterContainer.innerHTML = `
                <div class="password-strength-text mb-1">${strengthText} password</div>
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar ${strengthClass}" role="progressbar" 
                         style="width: ${strengthPercentage}%" 
                         aria-valuenow="${strengthPercentage}" 
                         aria-valuemin="0" 
                         aria-valuemax="100"></div>
                </div>
            `;
            
            // Create or get feedback element
            let feedbackEl = document.getElementById('password-feedback');
            if (!feedbackEl) {
                feedbackEl = document.createElement('div');
                feedbackEl.id = 'password-feedback';
                feedbackEl.className = 'password-feedback mt-2';
                passwordInput.parentNode.appendChild(feedbackEl);
            }
            
            // Build feedback message with only the current requirement
            let html = '<div class="password-strength-meter">';
            
            if (!password.length) {
                // If password is empty, only show first requirement
                html += `<div class="requirement">
                        <i class="fas fa-circle"></i> 
                        ${requirements[0].label}
                        </div>`;
            } else if (metCount < requirements.length) {
                // Find the first non-met requirement that should be visible
                for (let i = 0; i < requirements.length; i++) {
                    if (requirements[i].show && !requirements[i].met) {
                        html += `<div class="requirement">
                                <i class="fas fa-times"></i> 
                                ${requirements[i].label}
                                </div>`;
                        break; // Only show the first unfulfilled requirement
                    }
                }
            } else {
                // All requirements are met
                html += `<div class="requirement met">
                        <i class="fas fa-check"></i> 
                        All requirements fulfilled!
                        </div>`;
            }
            
            html += '</div>';
            feedbackEl.innerHTML = html;
            
            // Update password input styling
            const isValid = requirements.every(req => req.met);
                            
            if (isValid) {
                passwordInput.classList.add('is-valid');
                passwordInput.classList.remove('is-invalid');
            } else if (password.length > 0) {
                passwordInput.classList.add('is-invalid');
                passwordInput.classList.remove('is-valid');
            } else {
                passwordInput.classList.remove('is-valid');
                passwordInput.classList.remove('is-invalid');
            }
        });
    }
    
    // Setup username validation with API check
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            clearTimeout(typingTimer);
            const username = this.value;
            
            // Reset indicators when input changes
            this.classList.remove('is-valid', 'is-invalid');
            
            // Check if username format is valid
            const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
            if (!usernameRegex.test(username)) {
                if (username.length >= 3) {
                    this.classList.add('is-invalid');
                    
                    // Create feedback message
                    let feedbackEl = document.querySelector('.username-feedback');
                    if (!feedbackEl) {
                        feedbackEl = document.createElement('div');
                        feedbackEl.className = 'invalid-feedback username-feedback';
                        usernameInput.parentNode.appendChild(feedbackEl);
                    }
                    feedbackEl.textContent = 'Username must be 3-20 characters with only letters, numbers, period, underscore, or hyphen.';
                }
                return;
            }
            
            // Delay check until user stops typing
            if (username.length >= 3) {
                typingTimer = setTimeout(() => {
                    // Check username availability via API
                    xhr = new XMLHttpRequest();
                    xhr.open('POST', '../backends/account_sign_up.php', true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                try {
                                    const response = JSON.parse(xhr.responseText);
                                    usernameInput.classList.add(response.available ? 'is-valid' : 'is-invalid');
                                    
                                    if (!response.available) {
                                        // Create feedback message
                                        let feedbackEl = document.querySelector('.username-feedback');
                                        if (!feedbackEl) {
                                            feedbackEl = document.createElement('div');
                                            feedbackEl.className = 'invalid-feedback username-feedback';
                                            usernameInput.parentNode.appendChild(feedbackEl);
                                        }
                                        feedbackEl.textContent = 'This username is already taken';
                                    }
                                } catch (err) {
                                    // Assume unavailable on error
                                    usernameInput.classList.add('is-invalid');
                                }
                            } else {
                                // Assume unavailable on error
                                usernameInput.classList.add('is-invalid');
                            }
                        }
                    };
                    
                    xhr.send('username=' + encodeURIComponent(username) + '&check_username=true');
                }, 500);
            }
        });
    }
    
    // Form submission handling
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            // Validate all form fields
            let isValid = true;
            
            // Validate password
            if (passwordInput) {
                const password = passwordInput.value;
                
                // Check password requirements in sequential order
                const requirements = [
                    { id: 'minLength', test: () => password.length >= 8 },
                    { id: 'hasLetter', test: () => /[A-Za-z]/.test(password) },
                    { id: 'hasNumber', test: () => /[0-9]/.test(password) },
                    { id: 'hasSpecial', test: () => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
                ];
                
                const passwordValid = requirements.every(req => req.test());
                
                if (!passwordValid) {
                    isValid = false;
                    passwordInput.classList.add('is-invalid');
                }
            }
            
            // Validate username
            if (usernameInput) {
                const username = usernameInput.value;
                const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
                if (!usernameRegex.test(username)) {
                    isValid = false;
                    usernameInput.classList.add('is-invalid');
                }
            }
            
            // Validate terms checkbox
            if (termsCheckbox && !termsCheckbox.checked) {
                isValid = false;
                // Add visual cue but don't add standard validation classes
                // as they would interfere with the checkbox styling
                const termsContainer = termsCheckbox.parentNode;
                termsContainer.classList.add('text-danger');
                
                // Remove the emphasis after a brief delay
                setTimeout(() => {
                    termsContainer.classList.remove('text-danger');
                }, 3000);
            }
            
            // Get all required inputs (excluding terms checkbox which is handled separately)
            const requiredInputs = Array.from(signupForm.querySelectorAll('[required]'))
                                     .filter(el => el.id !== 'termsCheck');
            
            requiredInputs.forEach(input => {
                if (!input.value || input.value.trim() === '') {
                    isValid = false;
                    input.classList.add('is-invalid');
                    
                    // Add feedback if missing
                    let feedbackEl = input.nextElementSibling;
                    if (!feedbackEl || !feedbackEl.classList.contains('invalid-feedback')) {
                        feedbackEl = document.createElement('div');
                        feedbackEl.className = 'invalid-feedback';
                        feedbackEl.textContent = 'This field is required';
                        input.parentNode.appendChild(feedbackEl);
                    }
                }
            });
            
            if (!isValid) {
                // Show toast for form errors
                let toastContainer = document.getElementById('toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.id = 'toast-container';
                    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                    document.body.appendChild(toastContainer);
                }
                
                const toastId = 'toast-' + Date.now();
                const toastHTML = `
                    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header bg-danger text-white">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <strong class="me-auto">Notification</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            Please correct the errors in the form before submitting.
                        </div>
                    </div>
                `;
                
                toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                const toastElement = document.getElementById(toastId);
                const toast = new bootstrap.Toast(toastElement, { 
                    autohide: true,
                    delay: 3000
                });
                
                toast.show();
                
                toastElement.addEventListener('hidden.bs.toast', function() {
                    toastElement.remove();
                });
                
                return;
            }
            
            // Verify Terms and Conditions are accepted
            if (termsCheckbox && !termsCheckbox.checked) {
                // Show toast for terms agreement
                let toastContainer = document.getElementById('toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.id = 'toast-container';
                    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                    document.body.appendChild(toastContainer);
                }
                
                const toastId = 'toast-' + Date.now();
                const toastHTML = `
                    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header bg-danger text-white">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <strong class="me-auto">Notification</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            You must agree to the Terms of Service to continue.
                        </div>
                    </div>
                `;
                
                toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                const toastElement = document.getElementById(toastId);
                const toast = new bootstrap.Toast(toastElement, { 
                    autohide: true,
                    delay: 3000
                });
                
                toast.show();
                
                toastElement.addEventListener('hidden.bs.toast', function() {
                    toastElement.remove();
                });
                
                // Add visual feedback
                const termsContainer = termsCheckbox.parentNode;
                termsContainer.classList.add('text-danger');
                
                // Remove the visual feedback after a brief delay
                setTimeout(() => {
                    termsContainer.classList.remove('text-danger');
                }, 3000);
                
                return;
            }
            
            // Get submit button for loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
                submitBtn.disabled = true;
            }
            
            // Create form data
            const formData = new FormData(signupForm);
            
            // Remove terms checkbox from form data (not needed for submission)
            if (formData.has('termsCheck')) {
                formData.delete('termsCheck');
            }
            
            // Create and send request
            xhr = new XMLHttpRequest();
            xhr.open('POST', '../backends/account_sign_up.php', true);
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    // Reset button if provided
                    if (submitBtn) {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                    
                    if (xhr.status === 200) {
                        let response = xhr.responseText.trim();
                        let data;
                        
                        // Try to parse as JSON
                        try {
                            data = JSON.parse(response);
                        } catch (err) {
                            // If not valid JSON, create a basic response object
                            data = { 
                                success: response.indexOf('success') !== -1,
                                message: response
                            };
                        }
                        
                        // Handle success
                        const modalMessage = document.getElementById('modalMessage');
                        if (modalMessage) {
                            modalMessage.textContent = data.message;
                        }
                        
                        // Set modal data for redirect
                        if (responseModalElement) {
                            responseModalElement.dataset.success = data.success.toString();
                            responseModalElement.dataset.redirectUrl = data.data?.redirect || '';
                            
                            // Update modal appearance based on success/error
                            const modalHeader = responseModalElement.querySelector('.modal-header');
                            const modalTitle = document.getElementById('responseModalLabel');
                            const modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
                            const modalBody = responseModalElement.querySelector('.modal-body');
                            
                            // Clear any previous icons
                            const previousIcon = modalBody.querySelector('.modal-icon');
                            if (previousIcon) {
                                previousIcon.remove();
                            }
                            
                            if (data.success) {
                                modalHeader.classList.remove('bg-danger');
                                modalHeader.classList.add('bg-orange');
                                modalTitle.textContent = 'Success';
                                
                                // Add success icon to the modal body
                                const successIcon = document.createElement('div');
                                successIcon.className = 'modal-icon';
                                successIcon.innerHTML = `<i class="fas fa-check-circle text-success mb-4" style="font-size: 64px;"></i>`;
                                modalBody.insertBefore(successIcon, modalMessage);
                                
                                modalPrimaryBtn.textContent = 'Continue';
                                modalPrimaryBtn.classList.remove('d-none');
                            } else {
                                modalHeader.classList.remove('bg-orange');
                                modalHeader.classList.add('bg-danger');
                                modalTitle.textContent = 'Error';
                                
                                // Add error icon to the modal body
                                const errorIcon = document.createElement('div');
                                errorIcon.className = 'modal-icon';
                                errorIcon.innerHTML = `<i class="fas fa-exclamation-circle text-danger mb-4" style="font-size: 64px;"></i>`;
                                modalBody.insertBefore(errorIcon, modalMessage);
                                
                                modalPrimaryBtn.classList.add('d-none');
                            }
                            
                            // Show modal
                            const responseModal = new bootstrap.Modal(responseModalElement);
                            responseModal.show();
                        }
                    } else {
                        // Handle error
                        // Show toast for errors
                        let toastContainer = document.getElementById('toast-container');
                        if (!toastContainer) {
                            toastContainer = document.createElement('div');
                            toastContainer.id = 'toast-container';
                            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                            document.body.appendChild(toastContainer);
                        }
                        
                        const toastId = 'toast-' + Date.now();
                        const toastHTML = `
                            <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                                <div class="toast-header bg-danger text-white">
                                    <i class="fas fa-exclamation-circle me-2"></i>
                                    <strong class="me-auto">Notification</strong>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                                </div>
                                <div class="toast-body">
                                    Request failed with status: ${xhr.status}
                                </div>
                            </div>
                        `;
                        
                        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                        const toastElement = document.getElementById(toastId);
                        const toast = new bootstrap.Toast(toastElement, { 
                            autohide: true,
                            delay: 3000
                        });
                        
                        toast.show();
                        
                        toastElement.addEventListener('hidden.bs.toast', function() {
                            toastElement.remove();
                        });
                    }
                }
            };
            
            xhr.onerror = function() {
                // Reset button if provided
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
                
                // Show toast for network error
                let toastContainer = document.getElementById('toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.id = 'toast-container';
                    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                    document.body.appendChild(toastContainer);
                }
                
                const toastId = 'toast-' + Date.now();
                const toastHTML = `
                    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="toast-header bg-danger text-white">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <strong class="me-auto">Notification</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body">
                            Network error occurred
                        </div>
                    </div>
                `;
                
                toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                const toastElement = document.getElementById(toastId);
                const toast = new bootstrap.Toast(toastElement, { 
                    autohide: true,
                    delay: 3000
                });
                
                toast.show();
                
                toastElement.addEventListener('hidden.bs.toast', function() {
                    toastElement.remove();
                });
            };
            
            xhr.send(formData);
        });
    }
});