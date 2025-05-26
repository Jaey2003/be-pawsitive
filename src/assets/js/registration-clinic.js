// Initialize once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup clinic logo preview
    const logoPreview = PreviewUtils.init({
        inputElement: '#vetFileInput',
        previewElement: '#vetImgPreview',
        containerElement: '.image-box',
        showRemoveButton: false,
        showFileTypeHint: false,
        defaultPreviewImage: '../assets/images/building_logo.jpg',
        hintParent: 'button[onclick="document.getElementById(\'vetFileInput\').click();"]',
        onSuccess: function(dataUrl, file, result) {
            // Update the upload button text
            const uploadButton = document.querySelector('button[onclick="document.getElementById(\'vetFileInput\').click();"]');
            if (uploadButton) {
                uploadButton.innerHTML = '<i class="fas fa-sync-alt"></i> Change Logo';
            }
        },
        onReset: function() {
            // Reset upload button text
            const uploadButton = document.querySelector('button[onclick="document.getElementById(\'vetFileInput\').click();"]');
            if (uploadButton) {
                uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Logo';
            }
        }
    });
    
    // Initialize required fields highlighting
    const requiredFields = RequiredFieldsUtils.init({
        useAsterisk: false,  // Set to false to remove asterisks from buttons
        highlightColor: '#fff9c4',  // Light yellow background
        borderColor: '#ffc107',     // Warning color border
        pulseEffect: true           // Enable pulse effect
    });
    
    // Make requiredFields available globally so dropdown utils can access it
    window.requiredFields = requiredFields;
    
    // Manually mark dropdown containers as required if they contain hidden required inputs
    // This ensures they get highlighted correctly when the highlight toggle is activated
    const markDropdownsRequired = function() {
        // Find all hidden inputs that are required
        const requiredHiddenInputs = document.querySelectorAll('input[type="hidden"][required]');
        
        requiredHiddenInputs.forEach(input => {
            // Find parent dropdown container
            const dropdownContainer = input.closest('.dropdown');
            if (dropdownContainer && !dropdownContainer.classList.contains('required')) {
                // Add required class to the container
                dropdownContainer.classList.add('required');
                console.log('Marked dropdown as required:', input.name);
            }
        });
        
        // Directly add required class to the Business Type and Facility Type dropdowns
        const businessTypeDropdown = document.querySelector('#businessTypeDropdown').closest('.dropdown');
        const facilityTypeDropdown = document.querySelector('#facilityTypeDropdown').closest('.dropdown');
        
        if (businessTypeDropdown && !businessTypeDropdown.classList.contains('required')) {
            businessTypeDropdown.classList.add('required');
            console.log('Directly marked Business Type dropdown as required');
        }
        
        if (facilityTypeDropdown && !facilityTypeDropdown.classList.contains('required')) {
            facilityTypeDropdown.classList.add('required');
            console.log('Directly marked Facility Type dropdown as required');
        }
        
        // Reinitialize requiredContainers collection after adding classes
        if (requiredFields && requiredFields.requiredContainers) {
            requiredFields.requiredContainers = document.querySelectorAll(`.${requiredFields.config.requiredContainerClass}`);
        }
    };
    
    // Call immediately to set up required dropdowns
    markDropdownsRequired();
    
    // Initialize dropdown management
    const dropdownManager = DropdownUtils.init();
    
    // Custom function to update dropdown highlighting based on value
    const updateDropdownHighlighting = function(dropdown) {
        if (!window.requiredFields) return;
        
        // Get current value
        const value = dropdown.getValue();
        const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === '';
        
        // Get dropdown container
        const container = dropdown.container;
        
        // Check if highlighting is active
        if (window.requiredFields.isHighlightActive()) {
            if (isEmpty) {
                window.requiredFields.highlightElement(container);
            } else {
                window.requiredFields.unhighlightElement(container);
            }
        }
    };
    
    // Setup Business Type dropdown if elements exist
    const businessTypeToggle = document.querySelector('#businessTypeDropdown');
    if (businessTypeToggle) {
        const businessTypeDropdown = dropdownManager.create('#businessTypeDropdown', {
            id: 'business_type_dropdown',
            hiddenInputName: 'vetBusinessType',
            placeholder: 'Select Business Type',
            onChange: function(value, text) {
                // Update highlighting state
                updateDropdownHighlighting(this);
            }
        });
        
        // Set initial highlighting state
        updateDropdownHighlighting(businessTypeDropdown);
    } else {
        console.warn('Business Type dropdown elements not found');
    }
    
    // Setup Facility Type dropdown if elements exist
    const facilityTypeToggle = document.querySelector('#facilityTypeDropdown');
    if (facilityTypeToggle) {
        const facilityTypeDropdown = dropdownManager.create('#facilityTypeDropdown', {
            id: 'facility_type_dropdown',
            hiddenInputName: 'vetFacilityType',
            placeholder: 'Select Facility Type',
            isCheckboxDropdown: true,
            itemsSelectedText: 'Type(s) Selected',
            closeOnSelect: false, // Prevent closing when selecting options
            addCloseButton: true, // Add a close button at the bottom of the dropdown
            onChange: function(value, text) {
                // Update highlighting state
                updateDropdownHighlighting(this);
                
                // Debug: Log the facility type value to verify it's being set
                console.log('Facility Type Value:', value);
                console.log('Hidden Input Value:', document.getElementById('vetFacilityType').value);
                
                // Additional check to make sure the hidden input is updated
                const hiddenInput = document.getElementById('vetFacilityType');
                if (hiddenInput && Array.isArray(value) && value.length > 0) {
                    // Ensure the hidden input has the value in string format
                    hiddenInput.value = value.join(', ');
                    console.log('Updated Hidden Input Value:', hiddenInput.value);
                }
            }
        });
        
        // Set initial highlighting state
        updateDropdownHighlighting(facilityTypeDropdown);
    } else {
        console.warn('Facility Type dropdown elements not found');
    }
    
    // Make dropdownManager available globally
    window.dropdownManager = dropdownManager;
    
    // Add direct event handlers for facility type checkboxes to ensure the hidden field is updated
    document.querySelectorAll('.facilityTypeCheckbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Get all checked values
            const selectedValues = [];
            document.querySelectorAll('.facilityTypeCheckbox:checked').forEach(cb => {
                selectedValues.push(cb.value);
            });
            
            // Update hidden input directly
            const hiddenInput = document.getElementById('vetFacilityType');
            if (hiddenInput) {
                hiddenInput.value = selectedValues.join(', ');
                console.log('Facility Type Checkboxes Changed - Updated Hidden Value:', hiddenInput.value);
                
                // Force validation check
                setTimeout(updateSubmitButtonState, 100);
            }
        });
    });
    
    // Add handlers for business and facility type dropdowns if not already set up
    if (!window.dropdownHandlersInitialized) {
        // If using the new dropdown utility, we don't need these manual handlers
        // But keep as fallback in case the dropdowns weren't properly initialized
        const businessTypeItems = document.querySelectorAll('.business-type-item');
        if (businessTypeItems.length && !dropdownManager.get('business_type_dropdown')) {
            console.warn('Using fallback business type dropdown handlers');
            businessTypeItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get the selected value
                    const selectedValue = this.dataset.value || this.textContent.trim();
                    
                    // Update the hidden input
                    const hiddenInput = document.getElementById('vetBusinessType');
                    if (hiddenInput) {
                        hiddenInput.value = selectedValue;
                    }
                    
                    // Update the dropdown button text
                    const dropdownButton = document.getElementById('businessTypeDropdown');
                    if (dropdownButton) {
                        dropdownButton.innerHTML = `
                            <span class="me-1"><i class="fas fa-building"></i></span> 
                            ${selectedValue}
                        `;
                    }
                    
                    // If highlighting is active, unhighlight this dropdown since it now has a value
                    if (requiredFields && requiredFields.isHighlightActive()) {
                        const dropdownContainer = dropdownButton.closest('.dropdown');
                        if (dropdownContainer) {
                            requiredFields.unhighlightElement(dropdownContainer);
                        }
                    }
                });
            });
        }
        
        // Facility Type checkbox handling - fallback
        const facilityTypeCheckboxes = document.querySelectorAll('.facilityTypeCheckbox');
        if (facilityTypeCheckboxes.length && !dropdownManager.get('facility_type_dropdown')) {
            console.warn('Using fallback facility type dropdown handlers');
            facilityTypeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    // Get all checked values
                    const selectedValues = [];
                    document.querySelectorAll('.facilityTypeCheckbox:checked').forEach(cb => {
                        selectedValues.push(cb.value);
                    });
                    
                    // Update hidden input
                    const hiddenInput = document.getElementById('vetFacilityType');
                    if (hiddenInput) {
                        hiddenInput.value = selectedValues.join(', ');
                    }
                    
                    // Update dropdown button text
                    const dropdownButton = document.getElementById('facilityTypeDropdown');
                    if (dropdownButton) {
                        if (selectedValues.length) {
                            dropdownButton.innerHTML = `
                                <span class="me-1"><i class="fas fa-hospital"></i></span> 
                                ${selectedValues.length} Type${selectedValues.length > 1 ? 's' : ''} Selected
                            `;
                        } else {
                            dropdownButton.innerHTML = `
                                <span class="me-1"><i class="fas fa-hospital"></i></span> 
                                Select Facility Type
                            `;
                        }
                    }
                    
                    // If highlighting is active, unhighlight this dropdown since it now has a value
                    if (requiredFields && requiredFields.isHighlightActive()) {
                        const dropdownContainer = dropdownButton.closest('.dropdown');
                        if (dropdownContainer) {
                            requiredFields.unhighlightElement(dropdownContainer);
                        }
                    }
                });
            });
        }
        
        window.dropdownHandlersInitialized = true;
    }
    
    // Function to manually highlight dropdowns
    const forceHighlightDropdowns = function() {
        // Get all dropdowns with required hidden inputs
        const requiredDropdowns = document.querySelectorAll('.dropdown:has(input[type="hidden"][required])');
        
        requiredDropdowns.forEach(dropdown => {
            // Get the hidden input
            const hiddenInput = dropdown.querySelector('input[type="hidden"][required]');
            
            // Check if it's empty and highlighting is active
            if (requiredFields.isHighlightActive() && (!hiddenInput.value || hiddenInput.value.trim() === '')) {
                requiredFields.highlightElement(dropdown);
            }
        });
        
        // Directly target Business Type and Facility Type dropdowns
        const businessTypeDropdown = document.querySelector('#businessTypeDropdown').closest('.dropdown');
        const facilityTypeDropdown = document.querySelector('#facilityTypeDropdown').closest('.dropdown');
        
        // Check the hidden input values
        const businessTypeValue = document.getElementById('vetBusinessType').value;
        const facilityTypeValue = document.getElementById('vetFacilityType').value;
        
        // Highlight if empty and highlighting is active
        if (requiredFields.isHighlightActive()) {
            if (!businessTypeValue || businessTypeValue.trim() === '') {
                requiredFields.highlightElement(businessTypeDropdown);
            }
            
            if (!facilityTypeValue || facilityTypeValue.trim() === '') {
                requiredFields.highlightElement(facilityTypeDropdown);
            }
        }
    };
    
    // Function to completely unhighlight all required elements
    const forceUnhighlightAll = function() {
        // Remove highlight classes from all elements
        document.querySelectorAll('.required-highlight, .required-pulse, .required-pulse-subtle').forEach(element => {
            element.classList.remove('required-highlight');
            element.classList.remove('required-pulse');
            element.classList.remove('required-pulse-subtle');
            
            // Reset styles
            element.style.outline = '';
            element.style.boxShadow = '';
            element.style.backgroundColor = '';
            element.style.borderColor = '';
            
            // If this is a dropdown, clean up the toggle button too
            if (element.classList.contains('dropdown') || element.closest('.dropdown')) {
                const dropdown = element.classList.contains('dropdown') ? element : element.closest('.dropdown');
                const toggleButton = dropdown.querySelector('.dropdown-toggle');
                if (toggleButton) {
                    toggleButton.style.backgroundColor = '';
                }
            }
        });
        
        // Additionally target specific elements we know might need cleaning
        const businessTypeDropdown = document.querySelector('#businessTypeDropdown');
        const facilityTypeDropdown = document.querySelector('#facilityTypeDropdown');
        
        if (businessTypeDropdown) {
            businessTypeDropdown.style.backgroundColor = '';
            businessTypeDropdown.closest('.dropdown').style.outline = '';
            businessTypeDropdown.closest('.dropdown').style.boxShadow = '';
            businessTypeDropdown.closest('.dropdown').style.borderColor = '';
        }
        
        if (facilityTypeDropdown) {
            facilityTypeDropdown.style.backgroundColor = '';
            facilityTypeDropdown.closest('.dropdown').style.outline = '';
            facilityTypeDropdown.closest('.dropdown').style.boxShadow = '';
            facilityTypeDropdown.closest('.dropdown').style.borderColor = '';
        }
    };
    
    // Ultra-aggressive reset function to ensure highlighting is completely removed
    const completeReset = function() {
        // First call our normal unhighlight function
        forceUnhighlightAll();
        
        // Then use a more aggressive approach to find all elements with specific styles
        const allElements = document.querySelectorAll('*');
        const highlightColor = '#fff9c4'; // Light yellow background
        const borderColor = '#ffc107';    // Warning color border
        
        allElements.forEach(element => {
            // Check computed styles
            const computedStyle = window.getComputedStyle(element);
            
            // If any element has our highlight background color or border, reset it
            if (computedStyle.backgroundColor === highlightColor ||
                computedStyle.borderColor.includes(borderColor) ||
                computedStyle.boxShadow.includes(borderColor) ||
                computedStyle.outline.includes(borderColor)) {
                
                // Reset all relevant styles
                element.style.outline = '';
                element.style.boxShadow = '';
                element.style.backgroundColor = '';
                element.style.borderColor = '';
                
                // Remove any highlight classes
                element.classList.remove('required-highlight');
                element.classList.remove('required-pulse');
                element.classList.remove('required-pulse-subtle');
            }
        });
        
        // Finally, specifically target critical elements
        const criticalSelectors = [
            '.dropdown-toggle',
            '.dropdown',
            '.required',
            '.required-field',
            '.required-button',
            '.required-container',
            '#businessTypeDropdown',
            '#facilityTypeDropdown',
            '.form-control'
        ];
        
        criticalSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.style.outline = '';
                element.style.boxShadow = '';
                element.style.backgroundColor = '';
                element.style.borderColor = '';
            });
        });
    };
    
    // Call once after initialization to ensure dropdowns are highlighted if empty
    setTimeout(forceHighlightDropdowns, 500);
    
    // Add a toggle button for demonstration (optional)
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn btn-sm btn-outline-warning position-fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.zIndex = '1000';
    toggleButton.innerHTML = '<i class="fas fa-eye"></i> Highlight Required Fields';
    
    // Track highlighting state
    let highlightingActive = false;
    
    toggleButton.addEventListener('click', function() {
        // Check current highlighting state
        const highlightedElements = document.querySelectorAll('.required-highlight');
        highlightingActive = highlightedElements.length > 0;
        
        if (!highlightingActive) {
            // Turn highlighting ON
            requiredFields.highlight();
            this.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Required Highlighting';
            
            // Force dropdown highlighting
            setTimeout(forceHighlightDropdowns, 100);
            
            highlightingActive = true;
        } else {
            // Turn highlighting OFF - use our most thorough unhighlighting approach
            requiredFields.unhighlight();
            forceUnhighlightAll();
            // For extreme cases, use the complete reset
            completeReset();
            this.innerHTML = '<i class="fas fa-eye"></i> Highlight Required Fields';
            
            highlightingActive = false;
        }
        
        // Update dropdown highlighting based on new state
        if (dropdownManager) {
            dropdownManager.dropdowns.forEach(dropdown => {
                if (highlightingActive) {
                    updateDropdownHighlighting(dropdown);
                }
            });
        }
    });
    
    document.body.appendChild(toggleButton);
    
    // Add CSS styles for required indicators and validation
    const addRequiredStyles = function() {
        if (!document.getElementById('requiredCustomStyles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'requiredCustomStyles';
            styleElement.textContent = `
                .document-card.required-highlight,
                .image-box.required-highlight {
                    border: 2px solid #ffc107 !important;
                    box-shadow: 0 0 10px rgba(255, 193, 7, 0.3) !important;
                }
                
                .dropdown.required-highlight {
                    border: 2px solid #ffc107 !important;
                    box-shadow: 0 0 10px rgba(255, 193, 7, 0.3) !important;
                    border-radius: 5px;
                }
                
                .dropdown.required-highlight .dropdown-toggle {
                    background-color: #fff9c4 !important;
                }
                
                .validation-alert {
                    position: relative;
                    border-left: 4px solid #dc3545;
                    margin-bottom: 20px;
                }
                
                /* Fade out animation for alerts */
                .alert.fade {
                    transition: opacity 0.3s linear;
                }
                
                /* Map Related Styles */
                .location-confirmed {
                    border: 2px solid #28a745 !important;
                    box-shadow: 0 0 10px rgba(40, 167, 69, 0.3) !important;
                    position: relative;
                }
                
                .location-confirmed-banner {
                    background-color: #28a745;
                    color: white;
                    text-align: center;
                    padding: 5px 10px;
                    font-weight: bold;
                    width: 100%;
                    margin-bottom: 10px;
                    border-radius: 3px;
                }
                
                .locked-marker-icon {
                    color: #28a745;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
                    background: none !important;
                    border: none !important;
                }
            `;
            document.head.appendChild(styleElement);
        }
    };
    
    // Add custom styles
    addRequiredStyles();
    
    // Optional: Highlight empty required fields on form submission
    const form = document.getElementById('clinicRegistrationForm');
    if (form) {
        // Handle form validation for hidden file inputs
        const handleHiddenFileInputs = function() {
            // Find all hidden file inputs marked as required
            const hiddenFileInputs = document.querySelectorAll('input[type="file"][required][style*="display: none"], input[type="file"][required][style*="display:none"]');
            
            hiddenFileInputs.forEach(fileInput => {
                // Store the required attribute state
                const isRequired = fileInput.hasAttribute('required');
                
                // Create a custom validation approach
                // 1. Remove the required attribute (to prevent the browser's built-in validation)
                fileInput.removeAttribute('required');
                
                // 2. Add a custom data attribute to mark it for our validation
                fileInput.dataset.validationRequired = isRequired;
                
                // 3. Find the associated label or button
                const fileInputId = fileInput.id;
                const associatedLabel = document.querySelector(`label[for="${fileInputId}"], button[onclick*="${fileInputId}"]`);
                
                if (associatedLabel) {
                    // Add a visual indicator to show it's required (if not already there)
                    if (!associatedLabel.querySelector('.required-indicator')) {
                        const indicator = document.createElement('span');
                        indicator.className = 'required-indicator ms-1';
                        
                        associatedLabel.appendChild(indicator);
                    }
                }
                
                console.log(`Prepared hidden file input for custom validation: ${fileInput.name}`);
            });
        };
        
        // Call immediately to set up hidden file inputs
        handleHiddenFileInputs();
        
        // Function to check if all required fields are filled and update submit button state
        const updateSubmitButtonState = function() {
            const submitButton = document.getElementById('submitBtn');
            if (!submitButton) return;
            
            // Use the requiredFields utility to check if all fields are filled
            const allFilled = requiredFields.checkAllFilled();
            
            // Check dropdowns specifically
            const businessTypeValue = document.getElementById('vetBusinessType').value.trim();
            const facilityTypeValue = document.getElementById('vetFacilityType').value.trim();
            const hasBusinessType = businessTypeValue !== '';
            const hasFacilityType = facilityTypeValue !== '';
            
            // Log the values for debugging
            console.log('Business Type Value:', businessTypeValue, 'Has Value:', hasBusinessType);
            console.log('Facility Type Value:', facilityTypeValue, 'Has Value:', hasFacilityType);
            
            // Check file inputs
            const hasLogo = document.getElementById('vetFileInput').files.length > 0;
            const hasDTI = document.getElementById('dti_business_registration').files.length > 0;
            const hasMayorsPermit = document.getElementById('mayors_permit').files.length > 0;
            const hasEnvironmentalClearance = document.getElementById('environmental_clearance').files.length > 0;
            
            // Enable the button only if everything is filled
            const shouldEnable = allFilled && hasBusinessType && hasFacilityType && 
                                hasLogo && hasDTI && hasMayorsPermit && hasEnvironmentalClearance;
            
            // Log the overall state for debugging
            console.log('All required fields filled:', allFilled);
            console.log('Should enable submit button:', shouldEnable);
            
            if (shouldEnable) {
                submitButton.disabled = false;
                submitButton.classList.remove('btn-secondary');
                submitButton.classList.add('btn-success');
            } else {
                submitButton.disabled = true;
                submitButton.classList.remove('btn-success');
                submitButton.classList.add('btn-secondary');
            }
        };
        
        // Initialize the submit button as disabled
        const submitButton = document.getElementById('submitBtn');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.remove('btn-success');
            submitButton.classList.add('btn-secondary');
        }
        
        // Initialize submit button state
        setTimeout(updateSubmitButtonState, 500);
        
        // Set up event listeners for all required fields
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            field.addEventListener('input', updateSubmitButtonState);
            field.addEventListener('change', updateSubmitButtonState);
            field.addEventListener('blur', updateSubmitButtonState);
        });
        
        // Special handling for file inputs
        document.querySelectorAll('input[type="file"][required]').forEach(fileInput => {
            fileInput.addEventListener('change', updateSubmitButtonState);
        });
        
        // Set up a mutation observer to watch for changes to inputs and update the button state
        const formObserver = new MutationObserver(function(mutations) {
            let shouldCheck = false;
            
            mutations.forEach(function(mutation) {
                // Check if the mutation is related to attributes (like value changes)
                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'value' || 
                        mutation.attributeName === 'selected' || 
                        mutation.attributeName === 'checked') {
                        shouldCheck = true;
                    }
                }
                
                // Check for added or removed nodes (like in dropdowns)
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const removedNodes = Array.from(mutation.removedNodes);
                    
                    const isRelevantNode = node => 
                        node.nodeType === Node.ELEMENT_NODE && 
                        (node.tagName === 'INPUT' || 
                         node.tagName === 'SELECT' || 
                         node.tagName === 'TEXTAREA' || 
                         node.classList.contains('dropdown-item') ||
                         node.querySelector('input, select, textarea, .dropdown-item'));
                    
                    if (addedNodes.some(isRelevantNode) || removedNodes.some(isRelevantNode)) {
                        shouldCheck = true;
                    }
                }
            });
            
            if (shouldCheck) {
                // Update the submit button state
                updateSubmitButtonState();
            }
        });
        
        // Start observing the form
        formObserver.observe(form, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['value', 'selected', 'checked']
        });
        
        // Call updateSubmitButtonState whenever a dropdown item is clicked
        document.querySelectorAll('.dropdown-item, .facilityTypeCheckbox').forEach(item => {
            item.addEventListener('click', function() {
                setTimeout(updateSubmitButtonState, 100);
            });
        });
        
        // Call updateSubmitButtonState periodically to catch any changes that might be missed
        setInterval(updateSubmitButtonState, 1000);
        
        // Custom validation for the form before submission
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default submit

            // First check if any hidden file inputs are empty
            const hiddenFileInputs = document.querySelectorAll('input[type="file"][data-validation-required="true"]');
            let hasEmptyFileInputs = false;
            let firstEmptyFileInput = null;
            
            hiddenFileInputs.forEach(fileInput => {
                if (!fileInput.files || !fileInput.files.length) {
                    hasEmptyFileInputs = true;
                    
                    if (!firstEmptyFileInput) {
                        firstEmptyFileInput = fileInput;
                    }
                    
                    // Find the associated container to highlight
                    const container = fileInput.closest('.document-card, .image-box');
                    if (container && window.requiredFields) {
                        window.requiredFields.highlightElement(container);
                    }
                    
                    // Find the associated label or button to highlight
                    const fileInputId = fileInput.id;
                    const associatedLabel = document.querySelector(`label[for="${fileInputId}"], button[onclick*="${fileInputId}"]`);
                    if (associatedLabel && window.requiredFields) {
                        associatedLabel.classList.add('btn-danger');
                        associatedLabel.classList.remove('btn-warning');
                        
                        // Reset to normal style after a delay
                        setTimeout(() => {
                            associatedLabel.classList.remove('btn-danger');
                            associatedLabel.classList.add('btn-warning');
                        }, 2000);
                    }
                }
            });
            
            // If any required fields are empty (including normal inputs), prevent submission and highlight them
            if (hasEmptyFileInputs || !requiredFields.checkAllFilled()) {
                requiredFields.highlightEmpty();
                
                // Update dropdown highlighting
                if (dropdownManager) {
                    dropdownManager.dropdowns.forEach(dropdown => {
                        updateDropdownHighlighting(dropdown);
                    });
                }
                
                // Show validation message
                const validationMessage = document.createElement('div');
                validationMessage.className = 'alert alert-danger alert-dismissible fade show validation-alert';
                validationMessage.innerHTML = `
                    <strong><i class="fas fa-exclamation-triangle me-2"></i>Please complete all required fields</strong>
                    <p class="mb-0 mt-1">All fields marked as required must be filled before submitting.</p>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                
                // Insert at the top of the form
                const firstElement = form.querySelector('.container');
                if (firstElement) {
                    if (!document.querySelector('.validation-alert')) {
                        firstElement.insertBefore(validationMessage, firstElement.firstChild);
                        
                        // Auto-dismiss after 5 seconds
                        setTimeout(() => {
                            const alert = document.querySelector('.validation-alert');
                            if (alert) {
                                alert.classList.remove('show');
                                setTimeout(() => alert.remove(), 300);
                            }
                        }, 5000);
                    }
                }
                
                // Scroll to the validation message or first empty field
                const validationAlert = document.querySelector('.validation-alert');
                if (validationAlert) {
                    validationAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (firstEmptyFileInput) {
                    // Find a visible element near the file input to scroll to
                    const nearestVisibleElement = firstEmptyFileInput.closest('.document-card, .image-box');
                    if (nearestVisibleElement) {
                        nearestVisibleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else {
                    const emptyFields = Array.from(requiredFields.requiredFields).filter(field => !field.value.trim());
                    if (emptyFields.length > 0) {
                        emptyFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                return;
            }

            // If validation passes, submit the form using fetch API
            submitFormWithFetch();
        });

        // Function to submit form data using fetch API
        function submitFormWithFetch() {
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            
            // Show loading modal
            const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
            loadingModal.show();
            
            // Animate the progress bar
            const progressBar = document.getElementById('loadingProgressBar');
            let progress = 0;
            
            // Simulate progress (this is just visual feedback, not actual upload progress)
            const progressInterval = setInterval(() => {
                // Progress increases faster at the beginning, slower at the end
                if (progress < 70) {
                    progress += Math.random() * 5; // Faster at beginning
                } else {
                    progress += Math.random() * 0.5; // Slower when almost done
                }
                
                // Cap at 90% until the request is complete
                if (progress > 90) progress = 90;
                
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
            }, 300);
            
            // Create FormData object from the form
            const formData = new FormData(form);
            
            // Send form data to backend using fetch API
            fetch('../backends/registration-clinic.php', {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, let the browser set it with boundary parameter for FormData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Complete the progress bar
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                progressBar.setAttribute('aria-valuenow', 100);
                
                // Hide loading modal after a short delay (to see 100% progress)
                setTimeout(() => {
                    loadingModal.hide();
                    
                    if (data.success) {
                        // Show success message
                        const successMessage = document.createElement('div');
                        successMessage.className = 'alert alert-success alert-dismissible fade show';
                        successMessage.innerHTML = `
                            <strong><i class="fas fa-check-circle me-2"></i>Registration Successful!</strong>
                            <p class="mb-0 mt-1">${data.message}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        `;
                        
                        // Clear the form or redirect to another page
                        const formContainer = document.querySelector('.container.mt-4');
                        formContainer.innerHTML = '';
                        formContainer.appendChild(successMessage);
                        
                        // Add a button to redirect to a dashboard or homepage
                        const redirectBtn = document.createElement('div');
                        redirectBtn.className = 'text-center mt-4';
                        redirectBtn.innerHTML = `
                            <p>You will be redirected to the dashboard in <span id="countdown">5</span> seconds...</p>
                            <a href="../pages/dashboard.php" class="btn btn-warning shadow-sm">
                                <i class="fas fa-tachometer-alt me-2"></i>Go to Dashboard Now
                            </a>
                        `;
                        formContainer.appendChild(redirectBtn);
                        
                        // Countdown and redirect
                        let seconds = 5;
                        const countdownEl = document.getElementById('countdown');
                        const countdownInterval = setInterval(() => {
                            seconds--;
                            countdownEl.textContent = seconds;
                            if (seconds <= 0) {
                                clearInterval(countdownInterval);
                                window.location.href = '../pages/dashboard.php';
                            }
                        }, 1000);
                    } else {
                        // Show error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'alert alert-danger alert-dismissible fade show validation-alert';
                        errorMessage.innerHTML = `
                            <strong><i class="fas fa-exclamation-triangle me-2"></i>Registration Failed</strong>
                            <p class="mb-0 mt-1">${data.message || 'An error occurred during registration. Please try again.'}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        `;
                        
                        // Insert at the top of the form
                        const firstElement = form.querySelector('.container');
                        if (firstElement) {
                            // Remove any existing alert
                            const existingAlert = document.querySelector('.validation-alert');
                            if (existingAlert) existingAlert.remove();
                            
                            firstElement.insertBefore(errorMessage, firstElement.firstChild);
                            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        
                        // Reset submit button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                }, 500);
            })
            .catch(error => {
                // Complete the progress bar
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                progressBar.setAttribute('aria-valuenow', 100);
                progressBar.classList.remove('bg-warning');
                progressBar.classList.add('bg-danger');
                
                // Hide loading modal after a short delay
                setTimeout(() => {
                    loadingModal.hide();
                    
                    console.error('Error:', error);
                    
                    // Show error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'alert alert-danger alert-dismissible fade show validation-alert';
                    errorMessage.innerHTML = `
                        <strong><i class="fas fa-exclamation-triangle me-2"></i>Connection Error</strong>
                        <p class="mb-0 mt-1">There was a problem connecting to the server. Please check your internet connection and try again.</p>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    `;
                    
                    // Insert at the top of the form
                    const firstElement = form.querySelector('.container');
                    if (firstElement) {
                        // Remove any existing alert
                        const existingAlert = document.querySelector('.validation-alert');
                        if (existingAlert) existingAlert.remove();
                        
                        firstElement.insertBefore(errorMessage, firstElement.firstChild);
                        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    // Reset submit button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }, 500);
            });
        }
    }
    
    // Fix file input previews
    const setupFileInputPreviews = function() {
        // Setup DTI Business Registration preview
        const dtiInput = document.getElementById('dti_business_registration');
        const dtiPreview = document.getElementById('vet_imgPreview1');
        
        if (dtiInput && dtiPreview) {
            dtiInput.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        dtiPreview.src = e.target.result;
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                    
                    // Update the label text
                    const label = document.querySelector('label[for="dti_business_registration"]');
                    if (label) {
                        label.innerHTML = '<i class="fas fa-sync-alt"></i> Change Document';
                    }
                }
            });
        }
        
        // Setup Mayor's Permit preview
        const mayorInput = document.getElementById('mayors_permit');
        const mayorPreview = document.getElementById('vet_imgPreview2');
        
        if (mayorInput && mayorPreview) {
            mayorInput.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        mayorPreview.src = e.target.result;
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                    
                    // Update the label text
                    const label = document.querySelector('label[for="mayors_permit"]');
                    if (label) {
                        label.innerHTML = '<i class="fas fa-sync-alt"></i> Change Permit';
                    }
                }
            });
        }
        
        // Setup Environmental Clearance preview
        const envInput = document.getElementById('environmental_clearance');
        const envPreview = document.getElementById('vet_imgPreview3');
        
        if (envInput && envPreview) {
            envInput.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        envPreview.src = e.target.result;
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                    
                    // Update the label text
                    const label = document.querySelector('label[for="environmental_clearance"]');
                    if (label) {
                        label.innerHTML = '<i class="fas fa-sync-alt"></i> Change Clearance';
                    }
                }
            });
        }
        
        // Setup clinic logo preview handler if not already set
        if (!window.vetpreviewImage && document.getElementById('vetFileInput')) {
            window.vetpreviewImage = function(event) {
                const input = event.target;
                const preview = document.getElementById('vetImgPreview');
                
                if (input.files && input.files[0] && preview) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                    };
                    
                    reader.readAsDataURL(input.files[0]);
                    
                    // Update the button text
                    const uploadButton = document.querySelector('button[onclick="document.getElementById(\'vetFileInput\').click();"]');
                    if (uploadButton) {
                        uploadButton.innerHTML = '<i class="fas fa-sync-alt"></i> Change Logo';
                    }
                }
            };
        }
    };
    
    // Setup file input previews
    setupFileInputPreviews();
    
    // Initialize contact fields manager with validation
    const contactFields = ContactFieldsUtils.init({
        // Phone fields configuration
        phoneContainer: '#vet_phone_container',
        additionalPhonesContainer: '#vet_additional_phones',
        firstPhoneInput: '#vet_first_phone',
        firstPhoneWrapper: '#vet_first_phone_wrapper',
        firstPhoneButtons: '#vet_first_phone_buttons',
        phoneName: 'vet_mobile_number[]',
        phonePattern: '^09\\d{9}$',
        phoneMaxFields: 5,
        phoneFieldClass: 'vet_phone_input',
        
        // Email fields configuration
        emailContainer: '#vet_email_container',
        additionalEmailsContainer: '#vet_additional_emails',
        firstEmailInput: '#vet_first_email',
        firstEmailWrapper: '#vet_first_email_wrapper',
        firstEmailButtons: '#vet_first_email_buttons',
        emailName: 'vet_email[]',
        emailMaxFields: 5,
        emailFieldClass: 'vet_email_input',
        
        // Phone validation settings
        phoneInvalidMessage: 'Invalid format. Must be 11 digits starting with 09',
        phoneValidMessage: 'Valid phone number',
        duplicatePhoneMessage: 'This phone number is already in use',
        
        // Email validation settings
        emailInvalidMessage: 'Invalid email format. Please enter a valid email address',
        emailValidMessage: 'Valid email format',
        duplicateEmailMessage: 'This email address is already in use',
        
        // Validation behavior
        validateOnInput: true,
        validateOnBlur: true,
        showValidFeedback: true,
        preventDuplicates: true,
        
        // Fix for validation issue - clear feedback on valid entry
        onFieldAdded: function(type, field) {
            // Initial validation for newly added fields
            if (field.value.trim()) {
                this.validateField(field, type);
                
                // Ensure feedback is properly cleared when valid
                if ((type === 'phone' && this.validatePhoneNumber(field.value)) || 
                    (type === 'email' && this.validateEmailAddress(field.value))) {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                }
            }
        },
        
        // Handler for validation failures
        onValidationFailed: function(type, field, reason) {
            console.log(`Validation failed for ${type} field:`, field.value, reason);
        }
    });
    
    // Setup existing fields
    contactFields.setupExistingFields();
    
    // Make available globally
    window.contactFields = contactFields;
    
    // Fix for validation bug
    setTimeout(() => {
        document.querySelectorAll('input[name="vet_mobile_number[]"], input[name="vet_email[]"]').forEach(input => {
            if (input.value) {
                // Force revalidation
                input.dispatchEvent(new Event('blur'));
            }
        });
    }, 500);
    
    // ================== Map Functionality ==================
    
    // Map elements
    const toggleMapCheckbox = document.getElementById('toggleVetMap');
    const mapContainer = document.getElementById('vet_mapContainer');
    const leafletMap = document.getElementById('vet_leafletMap');
    const mapSearchInput = document.getElementById('vet_mapSearchInput');
    const mapSearchBtn = document.getElementById('vet_mapSearchBtn');
    const useCurrentLocationBtn = document.getElementById('vet_useCurrentLocation');
    const resetMarkerBtn = document.getElementById('vet_resetMarker');
    const confirmLocationBtn = document.getElementById('vet_confirmLocation');
    const displayCoords = document.getElementById('vet_displayCoords');
    
    // Hidden coordinate inputs
    const xCoordInput = document.getElementById('vet_xCoord');
    const yCoordInput = document.getElementById('vet_yCoord');
    
    // Map instance and marker
    let map = null;
    let marker = null;
    let fallbackCenter = [14.5995, 120.9842]; // Fallback center (Manila, Philippines) if geolocation fails
    let defaultZoom = 15;
    
    // Initialize the map with user's location
    function initMap() {
        // Create the map if it doesn't exist yet
        if (!map && leafletMap) {
            // Initially create map with fallback location
            map = L.map('vet_leafletMap').setView(fallbackCenter, defaultZoom);
            
            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Add event listener for map clicks
            map.on('click', function(e) {
                setMarkerAt(e.latlng);
            });
            
            // Try to get user's current location and set as map center
            getUserLocation();
            
            // Refresh the map after initialization (fixes rendering issues)
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }
    
    // Get user's current location and center map
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Center map on current location
                    if (map) {
                        map.setView(latlng, defaultZoom);
                        
                        // Optional: Add a marker at user's current location
                        // setMarkerAt(latlng);
                    }
                },
                function(error) {
                    // On error, use fallback location (Manila)
                    console.warn('Geolocation error:', error.message);
                }
            );
        }
    }
    
    // Set or move marker to specified location
    function setMarkerAt(latlng) {
        const lat = latlng.lat;
        const lng = latlng.lng;
        
        // Create marker if it doesn't exist, or move existing marker
        if (!marker) {
            // Use default Leaflet marker
            marker = L.marker(latlng, {
                draggable: true
            }).addTo(map);
            
            // Add event listener for marker drag end
            marker.on('dragend', function() {
                const newPos = marker.getLatLng();
                updateCoordinateDisplay(newPos);
                updateCoordinateInputs(newPos);
            });
        } else {
            marker.setLatLng(latlng);
        }
        
        // Update coordinate displays and inputs
        updateCoordinateDisplay(latlng);
        updateCoordinateInputs(latlng);
    }
    
    // Update coordinate display
    function updateCoordinateDisplay(latlng) {
        if (displayCoords) {
            displayCoords.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        }
    }
    
    // Update hidden coordinate inputs
    function updateCoordinateInputs(latlng) {
        if (xCoordInput && yCoordInput) {
            xCoordInput.value = latlng.lat.toFixed(6);
            yCoordInput.value = latlng.lng.toFixed(6);
        }
    }
    
    // Clear marker from map
    function clearMarker() {
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        
        // Clear coordinate displays and inputs
        if (displayCoords) {
            displayCoords.value = '';
        }
        if (xCoordInput && yCoordInput) {
            xCoordInput.value = '';
            yCoordInput.value = '';
        }
    }
    
    // Toggle map visibility based on checkbox state
    function toggleMapVisibility() {
        if (toggleMapCheckbox && mapContainer) {
            if (toggleMapCheckbox.checked) {
                mapContainer.style.display = 'block';
                
                // Initialize map if not already done
                initMap();
                
                // Refresh the map after making it visible
                setTimeout(() => {
                    if (map) map.invalidateSize();
                }, 100);
            } else {
                mapContainer.style.display = 'none';
                
                // Clear coordinates if map is hidden
                if (!toggleMapCheckbox.checked) {
                    if (xCoordInput) xCoordInput.value = '';
                    if (yCoordInput) yCoordInput.value = '';
                }
            }
        }
    }
    
    // Use geolocation to set map to current location
    function useCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Center map on current location
                    if (map) {
                        map.setView(latlng, 17);
                    }
                    
                    // Set marker at current location
                    setMarkerAt(latlng);
                },
                function(error) {
                    let errorMessage = '';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred.';
                    }
                    alert(`Geolocation error: ${errorMessage}`);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }
    
    // Open location confirmation modal
    function openLocationConfirmModal() {
        if (!marker) {
            alert('Please place a marker on the map first');
            return;
        }
        
        // Get coordinates
        const latlng = marker.getLatLng();
        
        // Update modal content with coordinates - format more nicely for display
        const confirmCoordinates = document.getElementById('confirmCoordinates');
        if (confirmCoordinates) {
            // Format coordinates in a more user-friendly way
            confirmCoordinates.innerHTML = `
                <span class="coordinate-value">${latlng.lat.toFixed(6)}</span>, 
                <span class="coordinate-value">${latlng.lng.toFixed(6)}</span>
            `;
        }
        
        // Get confirm button
        const finalizeLocationBtn = document.getElementById('finalizeLocation');
        
        // Reset any previous state
        if (finalizeLocationBtn) {
            finalizeLocationBtn.disabled = false;
            finalizeLocationBtn.classList.remove('disabled');
            finalizeLocationBtn.title = '';
        }
        
        // Update the entire address display with loading message
        const confirmAddressElement = document.getElementById('confirmAddress');
        if (confirmAddressElement) {
            confirmAddressElement.innerHTML = '<div class="text-center py-2"><i class="fas fa-spinner fa-spin me-2"></i>Getting address from coordinates...</div>';
        }
        
        // Store current scroll position before opening modal
        const scrollPosition = window.scrollY || window.pageYOffset;
        
        // Open the modal (modified to use the existing modal element or create a new one)
        const locationModalEl = document.getElementById('locationConfirmModal');
        let locationModal = bootstrap.Modal.getInstance(locationModalEl);
        
        if (!locationModal) {
            locationModal = new bootstrap.Modal(locationModalEl, {
                backdrop: true,
                keyboard: true,
                focus: true,
                // Set modal to static to prevent closing on backdrop click
                // This can sometimes help with scroll issues
                backdrop: 'static'
            });
        }
        
        // Show the modal
        locationModal.show();
        
        // Restore scroll position after modal is shown
        setTimeout(() => {
            window.scrollTo({
                top: scrollPosition,
                behavior: 'instant'
            });
        }, 0);
        
        // Use reverse geocoding to get address from coordinates
        getReverseGeocodedAddress(latlng);
    }
    
    // Get address from coordinates using reverse geocoding
    function getReverseGeocodedAddress(latlng) {
        // Use OpenStreetMap's Nominatim service for reverse geocoding
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    // Got address data, parse it
                    const address = data.address;
                    
                    // Extract address components with fallbacks for different naming conventions
                    const streetNumber = address.house_number || '';
                    const streetName = address.road || address.pedestrian || address.street || '';
                    const neighborhood = address.neighbourhood || address.suburb || '';
                    const barangay = address.village || address.hamlet || address.quarter || neighborhood || '';
                    const city = address.city || address.town || '';
                    const municipality = address.municipality || address.county || '';
                    const province = address.province || address.state || '';
                    const region = address.region || '';
                    
                    // Format address lines, handling empty fields
                    let addressLines = [];
                    
                    // Street number and name
                    if (streetNumber || streetName) {
                        addressLines.push(`${streetNumber} ${streetName}`.trim());
                    }
                    
                    // Barangay
                    if (barangay) {
                        addressLines.push(barangay);
                    }
                    
                    // City and municipality
                    if (city || municipality) {
                        addressLines.push(`${city}${city && municipality ? ', ' : ''}${municipality}`.trim());
                    }
                    
                    // Province and region
                    if (province || region) {
                        addressLines.push(`${province}${province && region ? ', ' : ''}${region}`.trim());
                    }
                    
                    // Update form fields with the geocoded address
                    if (streetNumber) document.getElementById('vet_street_number').value = streetNumber;
                    if (streetName) document.getElementById('vet_street_name').value = streetName;
                    if (barangay) document.getElementById('vet_barangay').value = barangay;
                    if (city) document.getElementById('vet_city').value = city;
                    if (municipality) document.getElementById('vet_municipality').value = municipality;
                    if (province) document.getElementById('vet_province').value = province;
                    if (region) document.getElementById('vet_region').value = region;
                    
                    // If no formatted address was created, use the display_name as fallback
                    if (addressLines.length === 0) {
                        addressLines = [data.display_name];
                    }
                    
                    // Add "Address from map:" prefix to indicate source of address
                    addressLines.unshift('<strong><i class="fas fa-map-marker-alt text-warning me-2"></i>Address from map:</strong>');
                    
                    // Update the entire address display
                    const confirmAddressElement = document.getElementById('confirmAddress');
                    if (confirmAddressElement) {
                        confirmAddressElement.innerHTML = addressLines.map(line => line).join('<br>');
                    }
                } else {
                    // No address found, show a message
                    const confirmAddressElement = document.getElementById('confirmAddress');
                    if (confirmAddressElement) {
                        confirmAddressElement.innerHTML = '<span class="text-warning"><i class="fas fa-exclamation-triangle me-2"></i>Could not retrieve address information from this location</span>';
                    }
                }
            })
            .catch(error => {
                console.error('Reverse geocoding error:', error);
                
                // Show error message
                const confirmAddressElement = document.getElementById('confirmAddress');
                if (confirmAddressElement) {
                    confirmAddressElement.innerHTML = '<span class="text-danger"><i class="fas fa-exclamation-circle me-2"></i>Error getting address information</span>';
                }
            });
    }
    
    // Finalize location selection
    function finalizeLocation() {
        // Store current scroll position before closing modal
        const scrollPosition = window.scrollY || window.pageYOffset;
        
        // Close the modal
        const locationModal = bootstrap.Modal.getInstance(document.getElementById('locationConfirmModal'));
        if (locationModal) {
            locationModal.hide();
        }
        
        // Add visual indicator that location is confirmed
        if (mapContainer) {
            mapContainer.classList.add('location-confirmed');
            
            // Add a status banner at the top of the map container
            if (!document.getElementById('location-confirmed-banner')) {
                const banner = document.createElement('div');
                banner.id = 'location-confirmed-banner';
                banner.className = 'location-confirmed-banner';
                banner.innerHTML = '<i class="fas fa-check-circle me-1"></i> Location Confirmed';
                // Insert at the beginning of map container
                mapContainer.insertBefore(banner, mapContainer.firstChild);
            }
        }
        
        // Disable map editing after confirmation
        if (map) {
            // Remove click event to prevent adding new markers
            map.off('click');
            
            // Disable marker dragging if marker exists
            if (marker) {
                marker.dragging.disable();
                
                // Optional: Change marker icon to indicate it's locked
                const lockedIcon = L.divIcon({
                    html: '<i class="fas fa-map-marker-alt fa-2x text-success"></i>',
                    iconSize: [20, 20],
                    className: 'locked-marker-icon'
                });
                marker.setIcon(lockedIcon);
            }
        }
        
        // Update map controls to reflect locked state
        const confirmLocationBtn = document.getElementById('vet_confirmLocation');
        if (confirmLocationBtn) {
            confirmLocationBtn.disabled = true;
            confirmLocationBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Location Confirmed';
            confirmLocationBtn.classList.remove('btn-success');
            confirmLocationBtn.classList.add('btn-secondary');
        }
        
        const resetMarkerBtn = document.getElementById('vet_resetMarker');
        if (resetMarkerBtn) {
            resetMarkerBtn.disabled = true;
            resetMarkerBtn.classList.remove('btn-outline-danger');
            resetMarkerBtn.classList.add('btn-outline-secondary');
        }
        
        // Add an unlock button
        const cardBody = resetMarkerBtn.closest('.card-body');
        if (cardBody && !document.getElementById('vet_unlockLocation')) {
            const unlockButton = document.createElement('button');
            unlockButton.id = 'vet_unlockLocation';
            unlockButton.className = 'btn btn-warning mt-3 w-100';
            unlockButton.innerHTML = '<i class="fas fa-unlock me-2"></i>Edit Location';
            unlockButton.addEventListener('click', unlockLocation);
            cardBody.appendChild(unlockButton);
        }
        
        // Restore scroll position after modal is closed
        setTimeout(() => {
            window.scrollTo({
                top: scrollPosition,
                behavior: 'instant'
            });
        }, 0);
    }
    
    // Function to unlock a confirmed location
    function unlockLocation() {
        // Remove confirmation visual indicator
        if (mapContainer) {
            mapContainer.classList.remove('location-confirmed');
            
            // Remove the status banner
            const banner = document.getElementById('location-confirmed-banner');
            if (banner) {
                banner.remove();
            }
        }
        
        // Re-enable map editing
        if (map) {
            // Re-attach click event to allow adding new markers
            map.on('click', function(e) {
                setMarkerAt(e.latlng);
            });
            
            // Re-enable marker dragging if marker exists
            if (marker) {
                marker.dragging.enable();
                
                // Restore default marker icon
                const defaultIcon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                marker.setIcon(defaultIcon);
            }
        }
        
        // Update map controls to reflect unlocked state
        const confirmLocationBtn = document.getElementById('vet_confirmLocation');
        if (confirmLocationBtn) {
            confirmLocationBtn.disabled = false;
            confirmLocationBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Confirm Location';
            confirmLocationBtn.classList.remove('btn-secondary');
            confirmLocationBtn.classList.add('btn-success');
        }
        
        const resetMarkerBtn = document.getElementById('vet_resetMarker');
        if (resetMarkerBtn) {
            resetMarkerBtn.disabled = false;
            resetMarkerBtn.classList.remove('btn-outline-secondary');
            resetMarkerBtn.classList.add('btn-outline-danger');
        }
        
        // Remove the unlock button
        const unlockButton = document.getElementById('vet_unlockLocation');
        if (unlockButton) {
            unlockButton.remove();
        }
    }
    
    // Search for location
    function searchLocation() {
        const searchQuery = mapSearchInput ? mapSearchInput.value.trim() : '';
        if (!searchQuery) {
            alert('Please enter a location to search');
            return;
        }
        
        // Use Nominatim API for geocoding (free OpenStreetMap geocoding service)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Get the first result
                    const result = data[0];
                    const latlng = {
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon)
                    };
                    
                    // Center map on result
                    if (map) {
                        map.setView(latlng, 17);
                    }
                    
                    // Set marker at result location
                    setMarkerAt(latlng);
                } else {
                    alert('No locations found. Please try a different search term.');
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                alert('An error occurred while searching. Please try again.');
            });
    }
    
    // Event listeners
    if (toggleMapCheckbox) {
        toggleMapCheckbox.addEventListener('change', toggleMapVisibility);
    }
    
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.addEventListener('click', useCurrentLocation);
    }
    
    if (resetMarkerBtn) {
        resetMarkerBtn.addEventListener('click', clearMarker);
    }
    
    if (confirmLocationBtn) {
        confirmLocationBtn.addEventListener('click', openLocationConfirmModal);
    }
    
    if (mapSearchBtn && mapSearchInput) {
        mapSearchBtn.addEventListener('click', searchLocation);
        
        // Also allow search with Enter key
        mapSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation();
            }
        });
    }
    
    // Final confirmation button in modal
    const finalizeLocationBtn = document.getElementById('finalizeLocation');
    if (finalizeLocationBtn) {
        finalizeLocationBtn.addEventListener('click', finalizeLocation);
    }
    
    // Initialize based on initial checkbox state
    toggleMapVisibility();
});

/**
 * End of file
 */