let withDocMapInitialized = false;
let noDocMapInitialized = false;
let lastClinicSelectionSource = ''; // Tracks if user came from withDoc or noDoc
let registeredClinicId = null; // 🆕 Global
let selectedClinicId = null; // Store the currently selected clinic ID

// Global variables for functionality enhancements
let searchTimeout = null;
let currentClinics = [];
let filtersActive = false;

// Store waiting clinic IDs per pet
window.petWaitingClinics = {};

function resetMapInitFlags() {
    withDocMapInitialized = false;
    noDocMapInitialized = false;
}

function fetch(type, accountId, additionalParams = {}) {
    if (!type) {
        return Promise.reject('Missing type');
    }

    let action;
    let handler;

    switch (type) {
        case 'pet_with_owner':
            if (!accountId) {
                return Promise.reject('Missing accountId for pet_with_owner');
            }
            action = 'get_pet_with_owner';
            handler = populatePetWithOwner;
            break;
        case 'client_pet_status':
            if (!accountId) {
                return Promise.reject('Missing accountId for client_pet_status');
            }
            action = 'check_client&client_pet_existence';
            handler = null;
            break;
        case 'approved_clinics':
            action = 'get_approved_clinics_with_location';
            handler = null;
            break;
        case 'upload_booklet':
            const formData = getBookletFormData();
            if (!formData) return Promise.reject('Invalid or missing form data');
            return uploadBookletHandler(formData);
        case 'create_appointment':
            const appointmentData = getAppointmentFormData();
            if (!appointmentData) return Promise.reject('Invalid or missing appointment data');
            return createAppointmentHandler(appointmentData);
        case 'client_pet_not_added':
            if (!accountId) {
                return Promise.reject('Missing accountId for client_pet_not_added');
            }
            // Add the current pet ID when checking
            action = 'check_client_pet_not_added';
            const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
            if (currentPetId) {
                additionalParams.pet_id = currentPetId;
            }
            handler = null;
            break;
        case 'clinic_services':
            if (!additionalParams.clinicId) {
                return Promise.reject('Missing clinicId for clinic_services');
            }
            action = 'get_clinic_services';
            handler = null;
            break;
        default:
            return Promise.reject(`Invalid fetch type: ${type}`);
    }

    const requestData = { action };
    if (accountId) {
        requestData.account_id = accountId;
    }
    
    // Merge any additional parameters
    Object.assign(requestData, additionalParams);

    return $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        dataType: 'json',
        data: requestData,
        success: function (response) {
            if (response.success && response.data) {
                if (handler) {
                    handler(response.data);
                }
            }
        },
        error: function (xhr, status, error) {
            // Error handling without console.error
        }
    });
}

// 🟢 Example usage on page load
document.addEventListener('DOMContentLoaded', function () {
    // Make sure accountId is defined
    if (typeof accountId === 'undefined' || !accountId) {
        // Try to get accountId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        accountId = urlParams.get('account_id');
        
        // If still not defined, use a fallback
        if (!accountId) {
            console.error('Account ID is not defined');
            // Show error message to user
            showAlert('Error: Unable to identify account. Please log in again.', 'danger');
            return;
        }
    }
    
    // Store the pet ID globally for reference
    window.selected_pet_id = document.getElementById('selected_pet_id')?.value || null;
    
    // Initialize the pet-specific waiting clinics tracking
    if (window.selected_pet_id) {
        window.petWaitingClinics[window.selected_pet_id] = [];
    }
    
    fetch('pet_with_owner', accountId);
    BackButtons();
    attachBookletFormHandler();
    attachAppointmentFormHandler();
    
    // Initialize search functionality
    initSearchFunctionality();
    
    // Initialize filter functionality
    initFilterFunctionality();
    
    // Set min date for appointment
    setMinDateForAppointment();
});

// ✅ Shared universal setter
function setField(selector, type, value, fallback) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach(el => {
        switch (type) {
            case 'input':
                loadValueIfVisible(el, value || '');
                break;
            case 'image':
                el.setAttribute('src', value || fallback);
                break;
            default:
                // Handle unsupported field type without console.warn
                break;
        }
    });
}

function showElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        el.classList.remove('d-none');

        const defer = window.requestIdleCallback || function (fn) {
            setTimeout(fn, 0); // fallback
        };

        defer(() => {
            applyDeferredValues();
            applyDeferredImages();
        });
    }
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'none';
        el.classList.add('d-none');
    }
}

function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function loadValueIfVisible(input, value) {
    if (isVisible(input)) {
        input.value = value;
    } else {
        input.setAttribute('data-value', value);
    }
}

function loadImageIfVisible(img) {
    if (isVisible(img)) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.setAttribute('src', src);
            img.removeAttribute('data-src'); // Optional cleanup
        }
    }
}

function applyDeferredValues() {
    document.querySelectorAll('[data-value]').forEach(input => {
        if (isVisible(input)) {
            input.value = input.getAttribute('data-value');
            input.removeAttribute('data-value');
        }
    });
}

function applyDeferredImages() {
    document.querySelectorAll('img[data-src]').forEach(loadImageIfVisible);
}

// 🐾 Pet functions
function populatePetPicture(picture) {
    const path = picture ? `../uploads/pets_image/${picture}` : 'default-pet.png';

    const imgs = document.querySelectorAll('.pet-picture');
    imgs.forEach(img => {
        img.setAttribute('data-src', path);
        loadImageIfVisible(img);
    });
}


function populatePetName(name) {
    setField('.selected-pet-name', 'input', name);
}

function populatePetGender(gender) {
    setField('.selected-pet-gender', 'input', gender);
}

function populatePetSpecies(species) {
    setField('.selected-pet-species', 'input', species);
}

function populatePetBreed(breed) {
    setField('.selected-pet-breed', 'input', breed);
}

// 👤 Owner functions
function populateOwnerPicture(picture) {
    const isValidPicture = picture && picture.trim() !== '' && picture.trim().toLowerCase() !== 'null';

    const path = isValidPicture
        ? `../uploads/profile_pics/${picture.trim()}`
        : '../assets/images/profile.jpg'; // 🟡 <-- use your actual default path

    const el = document.querySelector('.selected-owner-pic');
    if (!el) return;

    if (isVisible(el)) {
        el.setAttribute('src', path);
    } else {
        el.setAttribute('data-src', path); // lazy-load if needed
    }
}

function buildOwnerFullName(data) {
    const parts = [
        data.first_name,
        data.middle_name,
        data.last_name,
        data.name_extension
    ].filter(part => part && part.trim() !== ''); // remove null/empty values

    return parts.join(' ');
}

function populateOwnerFullName(ownerData) {
    const fullName = buildOwnerFullName(ownerData);
    setField('.selected-owner-name', 'input', fullName);
}


// ✅ Executes the full population process
function populatePetInfo(data) {
    if (!data) return;

    populatePetPicture(data.pet_picture);
    populatePetName(data.pet_name);
    populatePetGender(data.gender);
    populatePetSpecies(data.species);
    populatePetBreed(data.breed);
}

function populateOwnerInfo(ownerData) {
    if (!ownerData) return;

    populateOwnerPicture(ownerData.owner_picture);
    populateOwnerFullName(ownerData);
}

function ExecutePopulatedData(data) {
    if (!data) return;

    populatePetInfo(data);
    populateOwnerInfo(data.owner);
}

// 👇 Kick it off like this
function populatePetWithOwner(data) {
    ExecutePopulatedData(data);
}

function fetchClientPetStatus(accountId) {
    return fetch('client_pet_status', accountId);
}

function fetchApprovedClinics() {
    // Show loading state
    showLoading('withDocCards', '');
    showLoading('noDocCards', '');
    
    return fetch('approved_clinics')
        .done(function (response) {
            if (response.success && response.data && response.data.length > 0) {
                currentClinics = response.data; // Store clinics globally for filtering/searching
                return response;
            } else {
                // Handle empty response
                showEmptyState('withDocCards', 'No approved clinics found', 'hospital-user');
                showEmptyState('noDocCards', 'No approved clinics found', 'hospital-user');
                return { success: false, data: [] };
            }
        })
        .fail(function (xhr, status, error) {
            // Handle failure
            showEmptyState('withDocCards', 'Failed to load clinics. Please try again.', 'exclamation-triangle');
            showEmptyState('noDocCards', 'Failed to load clinics. Please try again.', 'exclamation-triangle');
            return { success: false, error: error };
        });
}

document.addEventListener('click', function (e) {
    const withOrNoDocBtn = e.target.closest('#btnWithDoc, #btnNoDoc');
    if (withOrNoDocBtn) {
        handleButtonClick({ target: withOrNoDocBtn });
        return;
    }

    const goToClinicBtn = e.target.closest('.goToClinicSelectionBtn');
    if (goToClinicBtn) {
        // Make sure to hide waiting content
        hideWaitingClinicConfirmationContent();
        
        // Force refresh the waiting clinic IDs to get the latest data
        window.waitingClinicIds = null;
        
        // Use showContent to properly initialize the map
        if (lastClinicSelectionSource === 'withDoc') {
            resetMapInitFlags(); // Reset map initialization flags
            showContent('new', 'btnWithDoc');
        } else if (lastClinicSelectionSource === 'noDoc') {
            resetMapInitFlags(); // Reset map initialization flags
            showContent('new', 'btnNoDoc');
        } else {
            resetMapInitFlags(); // Reset map initialization flags
            showContent('new', 'btnWithDoc');
        }
        return;
    }
});

function handleButtonClick(event) {
    const buttonId = event.target.id;
    lastClinicSelectionSource = buttonId === 'btnWithDoc' ? 'withDoc' : 'noDoc';

    hideInitialContent();

    // Clear waiting clinic IDs for the current pet when starting a new flow
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
    if (currentPetId) {
        window.petWaitingClinics[currentPetId] = [];
    }

    // First check if the pet has any pending appointments
    $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'check_pet_appointments',
            account_id: accountId,
            pet_id: currentPetId
        },
        success: function(appointmentResponse) {
            const hasPendingAppointments = appointmentResponse.success && 
                                       appointmentResponse.data && 
                                       appointmentResponse.data.has_pending_appointments;
            
            // If pet has pending appointments, immediately show waiting screen
            if (hasPendingAppointments) {
                showContent('waiting');
                return;
            }
            
            // Proceed with status checks without using debug_documents
            const statusPromise = fetchClientPetStatus(accountId);
            const notAddedPromise = fetch('client_pet_not_added', accountId, { pet_id: currentPetId });
            
            $.when(statusPromise, notAddedPromise).done(function(statusRes, notAddedRes) {
                const clientPetData = statusRes[0]?.data || {};
                const notAddedData = notAddedRes[0]?.data || {};
                
                const isRegistered = clientPetData.clientExists && clientPetData.petExists;
                const isWaiting = notAddedData.notAdded;
                
                // Verify we're dealing with the correct pet ID
                const responsePetId = notAddedData.pet_id ? parseInt(notAddedData.pet_id) : null;
                const currentPetIdInt = currentPetId ? parseInt(currentPetId) : null;
                
                // Only proceed if the response pet ID matches the current pet ID
                const isPetMatch = responsePetId === currentPetIdInt;
                
                // MODIFIED: Check if this pet is in a waiting state regardless of button type
                if (isWaiting && isPetMatch) {
                    // Show waiting content for both buttons
                    showContent('waiting');
                } else if (isRegistered && buttonId === 'btnWithDoc') {
                    registeredClinicId = clientPetData.clinic_id || null;
                    showContent('registered');
                } else {
                    showContent('new', buttonId);
                }
            }).fail(function() {
                alert("An error occurred while checking the pet status.");
            });
        },
        error: function(xhr, status, error) {
            // Enhanced error logging
            console.error('Appointment check error details:', {
                status: status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
                error: error
            });
            
            // Try to parse the response to get more details
            let errorDetails = 'Unknown error';
            try {
                if (xhr.responseText) {
                    const response = JSON.parse(xhr.responseText);
                    errorDetails = response.message || errorDetails;
                }
            } catch (e) {
                errorDetails = xhr.responseText || errorDetails;
            }
            
            // Show a more helpful error message
            showAlert(`Error checking appointments: ${errorDetails}`, 'danger');
            
            // Still show the default alert for backward compatibility
            alert("An error occurred while checking for appointments.");
        }
    });
}

function debounce(fn, delay = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

function initLeafletMap(mapId, cardContainerId) {
    if (L.DomUtil.get(mapId)._leaflet_id) {
        return;
    }
    const map = L.map(mapId).setView([0, 0], 13);

    // Load tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const centerMapOnUser = debounce(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 14);
                    L.marker([latitude, longitude]).addTo(map)
                        .bindPopup('You are here')
                        .openPopup();
                },
                () => {
                    map.setView([7.1907, 125.4553], 12); // Fallback to Davao City
                }
            );
        }
    }, 500);

    centerMapOnUser();
    fetchApprovedClinics().done(function (response) {
        if (response.data) {
            renderClinicMarkers(response.data);
            renderClinicCards(response.data);
        }
    });

    // Event delegation for "Select" buttons
    document.getElementById(cardContainerId).addEventListener('click', handleClinicSelection);

    // === Inner Functions ===
    function renderClinicMarkers(clinics) {
        clinics.forEach(clinic => {
            if (clinic.latitude && clinic.longitude) {
                const logoUrl = `../uploads/clinic_logos/${encodeURIComponent(clinic.clinic_logo)}`;
                const marker = L.marker([clinic.latitude, clinic.longitude]).addTo(map);

                const popupContent = `
                    <div style="display: flex; align-items: center;">
                        <img src="${logoUrl}" alt="${clinic.clinic_name}"
                            width="50" height="50"
                            style="border-radius: 50%; object-fit: cover; margin-right: 10px;">
                        <div style="font-weight: bold;">${clinic.clinic_name}</div>
                    </div>
                `;
                marker.bindPopup(popupContent);
            }
        });
    }

    function renderClinicCards(clinics) {
        const container = document.getElementById(cardContainerId);
        if (!container) return;
    
        let cardsHTML = ''; // ← collect all HTML here
    
        clinics.forEach(clinic => {
            const logoUrl = `../uploads/clinic_logos/${encodeURIComponent(clinic.clinic_logo)}`;
    
            const isRegisteredClinic = parseInt(clinic.clinic_id) === parseInt(registeredClinicId);
            const buttonText = isRegisteredClinic ? 'Already Registered Here' : 'Select';
            const buttonDisabled = isRegisteredClinic ? 'disabled' : '';
            const buttonClass = isRegisteredClinic ? 'btn-secondary' : 'btn-warning';
    
            // Format the address from the nested address object
            let formattedAddress = 'No address provided';
            if (clinic.address) {
                const a = clinic.address;
                const parts = [];
                
                // Street address
                if (a.street_number && a.street_name) {
                    parts.push(`${a.street_number} ${a.street_name}`);
                }
                
                // Barangay
                if (a.barangay) {
                    parts.push(a.barangay);
                }
                
                // City/Municipality
                if (a.city) {
                    parts.push(a.city);
                } else if (a.municipality) {
                    parts.push(a.municipality);
                }
                
                // Province
                if (a.province) {
                    parts.push(a.province);
                }
                
                // Only update if we have parts
                if (parts.length > 0) {
                    formattedAddress = parts.join(', ');
                }
            }
    
            cardsHTML += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <img src="${logoUrl}" class="rounded-circle me-3" width="50" height="50" style="object-fit: cover;">
                                <h5 class="card-title mb-0">${clinic.clinic_name}</h5>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="card-text text-muted mb-0 small">
                                        <i class="fas fa-map-marker-alt me-1"></i> 
                                        ${formattedAddress}
                                    </p>
                                </div>
                                <button class="btn ${buttonClass} select-btn"
                                    id="select-clinic-${clinic.clinic_id}"
                                    data-clinic-id="${clinic.clinic_id}"
                                    data-clinic="${clinic.clinic_name}"
                                    data-clinic-logo="${clinic.clinic_logo}"
                                    ${buttonDisabled}>
                                    ${buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    
        container.innerHTML = cardsHTML; // ← one DOM update
    }    

    function handleClinicSelection(e) {
        if (!e.target.classList.contains('select-btn')) return;

        const btn = e.target;
        const clinicId = btn.dataset.clinicId;
        const clinicName = btn.dataset.clinic;
        const clinicLogo = btn.dataset.clinicLogo;
        
        // Store clinic ID in global variable for backup
        selectedClinicId = clinicId;

        showAlert(`You selected: ${clinicName}`, 'info');

        // Update selected values in DOM
        document.querySelectorAll('.selected-clinic-name').forEach(el => el.textContent = clinicName);
        document.querySelectorAll('.selected-clinic-input').forEach(input => input.value = clinicName);
        document.querySelectorAll('.selected-clinic-id').forEach(input => {
            input.value = clinicId;
        });
        document.querySelectorAll('.selected-clinic-logo').forEach(img => {
            img.src = `../uploads/clinic_logos/${encodeURIComponent(clinicLogo)}`;
            img.alt = clinicName;
        });

        // Hide all general content
        ['initialOptions', 'petRegisteredContent', 'withDocContentClinicSelection', 'noDocContentClinicSelection'].forEach(hideElement);

        // Hide both target sections to avoid overlap
        ['clinic_booklet_registration', 'setting_clinic_appointment'].forEach(hideElement);

        // Determine and show the correct section
        const isFromWithDoc = btn.closest('#withDocContentClinicSelection');
        const isFromNoDoc = btn.closest('#noDocContentClinicSelection');

        const showElId = isFromWithDoc
            ? 'clinic_booklet_registration'
            : isFromNoDoc
                ? 'setting_clinic_appointment'
                : null;

        if (showElId) {
            showElement(showElId);
            
            // If this is the appointment form, fetch clinic services
            if (showElId === 'setting_clinic_appointment') {
                setTimeout(() => {
                    loadClinicServices(clinicId);
                }, 100);
            }
        }
    }
}

function loadClinicServices(clinicId) {
    const serviceSelect = document.getElementById('service_type');
    const serviceDescription = document.getElementById('service_description');
    if (!serviceSelect) return;
    
    // Keep only the default option
    serviceSelect.innerHTML = '<option selected disabled>Select a service</option>';
    
    // Show loading in select and description
    serviceSelect.disabled = true;
    if (serviceDescription) {
        serviceDescription.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm" role="status"></div> Loading services...</div>';
    }
    
    // Fetch services for this clinic
    $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'get_clinic_services',
            clinic_id: clinicId
        },
        success: function(response) {
            if (response.success && response.data && response.data.length > 0) {
                populateServiceOptions(response.data);
            } else {
                // No services found
                const noOption = document.createElement('option');
                noOption.disabled = true;
                noOption.textContent = 'No services available';
                serviceSelect.innerHTML = '';
                serviceSelect.appendChild(noOption);
                
                if (serviceDescription) {
                    serviceDescription.innerHTML = '<div class="alert alert-info">This clinic has no services available. Please select another clinic.</div>';
                }
            }
        },
        error: function(xhr, status, error) {
            const errorOption = document.createElement('option');
            errorOption.disabled = true;
            errorOption.textContent = 'Error loading services';
            serviceSelect.innerHTML = '';
            serviceSelect.appendChild(errorOption);
            
            if (serviceDescription) {
                serviceDescription.innerHTML = '<div class="alert alert-danger">Failed to load services. Please try again later.</div>';
            }
        },
        complete: function() {
            serviceSelect.disabled = false;
        }
    });
}

function populateServiceOptions(services) {
    const serviceSelect = document.getElementById('service_type');
    if (!serviceSelect) return;
    
    // Keep the default option
    serviceSelect.innerHTML = '<option selected disabled>Select a service</option>';
    
    if (services.length === 0) {
        const noOption = document.createElement('option');
        noOption.disabled = true;
        noOption.textContent = 'No services available';
        serviceSelect.appendChild(noOption);
        return;
    }
    
    // Add each service as an option
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.service_id;
        option.textContent = `${service.service_name} - ${formatCurrency(service.price)}`;
        option.dataset.description = service.description || '';
        option.dataset.price = service.price || '';
        serviceSelect.appendChild(option);
    });
    
    // Add change event listener to show description
    serviceSelect.addEventListener('change', showServiceDescription);
}

function showServiceDescription(e) {
    const select = e.target;
    const selectedOption = select.options[select.selectedIndex];
    const description = selectedOption.dataset.description || '';
    
    const descriptionEl = document.getElementById('service_description');
    if (descriptionEl) {
        descriptionEl.textContent = description;
    }
}

function formatCurrency(value) {
    if (!value) return '';
    return '₱' + parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Function to show the content based on the button clicked
function showContent(status, buttonId = '') {
    // Hide all content sections first
    hideInitialContent();
    hidePetRegisteredContent();
    hideWaitingClinicConfirmationContent();
    hideWithDocContentClinicSelection();
    hideNoDocContentClinicSelection();
    hideSettingAppointmentContent();
    hideBookletRegistrationContent();

    resetMapInitFlags();

    // Reset the pet-specific waiting clinics for current pet when showing content
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;

    switch (status) {
        case 'registered':
            showPetRegisteredContentContent(); // ✅ cleaner
            break;
        case 'waiting':
            ShowWaitingClinicConfirmationContent(); // ✅ cleaner
            break;
        case 'new':
            let targetSectionId, mapId, cardContainerId, isMapInitializedFlagRef;

            if (buttonId === 'btnWithDoc') {
                showWithDocContentClinicSelectionContent(); // Use direct show function
                mapId = 'mapWithDoc';
                cardContainerId = 'withDocCards';
                isMapInitializedFlagRef = 'withDoc';
            } else if (buttonId === 'btnNoDoc') {
                showNoDocContentClinicSelection(); // Use direct show function
                mapId = 'mapNoDoc';
                cardContainerId = 'noDocCards';
                isMapInitializedFlagRef = 'noDoc';
            } else {
                return;
            }

            const isInitialized = isMapInitializedFlagRef === 'withDoc'
                ? withDocMapInitialized
                : noDocMapInitialized;

            if (!isInitialized) {
                setTimeout(() => {
                    const mapEl = document.getElementById(mapId);
                    const cardEl = document.getElementById(cardContainerId);
                
                    if (mapEl) {
                        initLeafletMap(mapId, cardContainerId);
                        if (isMapInitializedFlagRef === 'withDoc') {
                            withDocMapInitialized = true;
                        } else {
                            noDocMapInitialized = true;
                        }
                        
                        // Update waiting status after map is initialized
                        setTimeout(forceUpdateWaitingClinicButtons, 1000);
                    }
                }, 50);                
            } else {
                // Still update buttons even if map is already initialized
                setTimeout(forceUpdateWaitingClinicButtons, 500);
            }
            break;

        default:
            // Handle unhandled status without console.warn
            break;
    }
}

function showInitialContent() { showElement('initialOptions'); }
function hideInitialContent() { hideElement('initialOptions'); }

function showWaitingClinicConfirmationContent() { showElement('waitingClinicConfirmationContent'); }
function hideWaitingClinicConfirmationContent() { hideElement('waitingClinicConfirmationContent'); }

function showPetRegisteredContent() { showElement('petRegisteredContent'); }
function hidePetRegisteredContent() { hideElement('petRegisteredContent'); }

function showWithDocContentClinicSelection() { showElement('withDocContentClinicSelection'); }
function hideWithDocContentClinicSelection() { hideElement('withDocContentClinicSelection'); }

function showNoDocContentClinicSelection() { 
    // First hide all other content sections
    hideInitialContent();
    hidePetRegisteredContent();
    hideWaitingClinicConfirmationContent();
    hideWithDocContentClinicSelection();
    hideSettingAppointmentContent();
    hideBookletRegistrationContent();
    
    // Then show the no-doc clinic selection content
    showElement('noDocContentClinicSelection'); 
}
function hideNoDocContentClinicSelection() { hideElement('noDocContentClinicSelection'); }

function showBookletRegistrationContent() { showElement('clinic_booklet_registration'); }
function hideBookletRegistrationContent() { hideElement('clinic_booklet_registration'); }

function showSettingAppointmentContent() { showElement('setting_clinic_appointment'); }
function hideSettingAppointmentContent() { hideElement('setting_clinic_appointment'); }

function BackButtons() {
    document.addEventListener('click', function (event) {
        let target = event.target;

        const backToInitial = target.closest('.back-to-initial');
        const backToSelectingClinicWithDocs = target.closest('.back-to-selecting-clinic-with-docs');
        const backToSelectingClinicWithoutDocs = target.closest('.back-to-selecting-clinic-without-docs');

        if (backToInitial) {
            event.preventDefault();
            ShowInitialContent();
        }
        if (backToSelectingClinicWithDocs) {
            event.preventDefault();
            
            // First explicitly hide the booklet registration content
            const bookletForm = document.getElementById('clinic_booklet_registration');
            if (bookletForm) {
                bookletForm.style.display = 'none';
                bookletForm.classList.add('d-none');
            }
            
            // Add a short delay to ensure the hide takes effect
            setTimeout(() => {
                showWithDocContentClinicSelectionContent();
            }, 10);
        }
        if (backToSelectingClinicWithoutDocs) {
            event.preventDefault();
            
            // First explicitly hide the appointment content
            const appointmentForm = document.getElementById('setting_clinic_appointment');
            if (appointmentForm) {
                appointmentForm.style.display = 'none';
                appointmentForm.classList.add('d-none');
            }
            
            // Add a short delay to ensure the hide takes effect
            setTimeout(() => {
                showNoDocContentClinicSelectionContent();
            }, 10);
        }
    });
}

// Function to go back to the initial content
function ShowInitialContent() {
    // Hide all content sections first
    hidePetRegisteredContent();
    hideWithDocContentClinicSelection();
    hideNoDocContentClinicSelection();
    hideWaitingClinicConfirmationContent();
    hideSettingAppointmentContent();
    hideBookletRegistrationContent();
    
    // Then show the initial content
    showInitialContent();
}

function ShowWaitingClinicConfirmationContent() {
    showWaitingClinicConfirmationContent();
    
    // Update clinic information when showing the waiting content
    updateWaitingClinicInfo(accountId);
}

function showWithDocContentClinicSelectionContent() {
    // First hide all other content sections
    hideInitialContent();
    hidePetRegisteredContent();
    hideWaitingClinicConfirmationContent();
    hideNoDocContentClinicSelection();
    hideSettingAppointmentContent();
    hideBookletRegistrationContent();
    
    // Then show the with-doc clinic selection content
    showWithDocContentClinicSelection();
}

function showNoDocContentClinicSelectionContent() {
    showNoDocContentClinicSelection();
}

function showPetRegisteredContentContent() {
    showPetRegisteredContent();
}

function triggerFileInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.click();
    }
}

function replaceTdWithImage(event, tdId, inputId) {
    const input = event.target;
    const td = document.getElementById(tdId);
    const file = input.files[0];

    if (file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert("Only PNG, JPG, or JPEG images are allowed.");
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            // Keep the input as is — just visually enhance
            const labelText = inputId
                .replace(/Booklet_/g, '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());

            td.innerHTML = `
                <div class="preview-container" onclick="event.stopPropagation()">
                    <span class="label-top-left">
                        <i class="me-1"></i>${labelText}
                    </span>
                    <img src="${e.target.result}" class="preview-image" width="100" height="100">
                    <div class="edit-icon" onclick="triggerFileInput('${inputId}')">
                        <i class="fas fa-pen"></i>
                    </div>
                </div>
            `;
            // Reattach the input element
            td.appendChild(input); // <--- this preserves the selected file
            input.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function getBookletFormData() {
    const form = document.getElementById('bookletUploadForm');
    if (!form) {
        return null;
    }

    // Create a FormData object but DON'T pass the form directly
    // This is because we need to manually add elements
    const formData = new FormData();
    
    // Try multiple ways to get the clinic ID
    let clinicId = '';
    
    // Option 1: Try the specific input in the booklet form
    const clinicIdInput = document.querySelector('#bookletUploadForm #selected_clinic_id');
    if (clinicIdInput && clinicIdInput.value) {
        clinicId = clinicIdInput.value;
    }
    
    // Option 2: Try any element with the class
    if (!clinicId) {
        const clinicIdByClass = document.querySelector('.selected-clinic-id');
        if (clinicIdByClass && clinicIdByClass.value) {
            clinicId = clinicIdByClass.value;
        }
    }
    
    // Option 3: Try the global variable
    if (!clinicId && window.selectedClinicId) {
        clinicId = window.selectedClinicId;
    }
    
    if (!clinicId) {
        alert('Please select a clinic first.');
        return null;
    }

    formData.append('clinic_id', clinicId);
    formData.append('action', 'upload_client_pet_docs');

    const fileFields = [
        'Booklet_front_page_left',
        'Booklet_front_page_right',
        'Booklet_back_page_left',
        'Booklet_back_page_right'
    ];

    let hasFiles = false;
    fileFields.forEach(fieldId => {
        const fileInput = document.getElementById(fieldId);
        const file = fileInput?.files[0];
        if (file) {
            formData.append(fieldId, file);
            hasFiles = true;
        }
    });
    
    // Check if at least one file is selected
    if (!hasFiles) {
        alert('Please upload at least one booklet image.');
        return null;
    }

    return formData;
}

function attachBookletFormHandler() {
    const form = document.getElementById('bookletUploadForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Validate the form
        if (!validateForm('bookletUploadForm')) {
            return;
        }
        
        // Confirm submission
        const confirmed = await confirmSubmission('Are you sure you want to submit your pet\'s health booklet?');
        if (!confirmed) return;
        
        // Show loading on the submit button
        showLoading(form.querySelector('button[type="submit"]').id || 'submitBookletBtn', 'Submitting...');
        
        fetch('upload_booklet'); // 🔥 Now calls centralized fetch!
    });
}

function uploadBookletHandler(formData) {
    const submitBtn = document.querySelector('#bookletUploadForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    return $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (submitBtn) submitBtn.disabled = false;

            if (response.success) {
                // Get the clinic ID that was submitted
                const clinicId = parseInt($('#selected_clinic_id').val());
                
                // Add this clinic to the waiting list for the current pet
                addWaitingClinicForCurrentPet(clinicId);
                
                showAlert('Pet registration submitted! Please wait for the clinic to confirm.', 'success', 3000);

                // Show waiting confirmation content instead of redirecting
                setTimeout(() => {
                    hideBookletRegistrationContent();
                    ShowWaitingClinicConfirmationContent();
                }, 3100);
            } else {
                showAlert('Upload failed: ' + (response.message || 'Unknown error.'), 'danger');
            }
        },
        error: function (xhr, status, error) {
            if (submitBtn) submitBtn.disabled = false;
            showAlert('An error occurred during upload.', 'danger');
        }
    });
}

function getAppointmentFormData() {
    const form = document.getElementById('applyAppointment');
    if (!form) {
        return null;
    }

    // Get form values
    const appointmentDate = document.getElementById('appointment_date')?.value;
    const appointmentTime = document.getElementById('appointment_time')?.value;
    const serviceSelect = document.getElementById('service_type');
    const serviceId = serviceSelect?.value;
    const serviceName = serviceSelect?.options[serviceSelect.selectedIndex]?.textContent;
    const clinicId = form.querySelector('.selected-clinic-id')?.value || 
                    document.querySelector('#setting_clinic_appointment #selected_clinic_id')?.value;
    
    // Validate required fields
    if (!appointmentDate) {
        alert('Please select an appointment date.');
        return null;
    }
    
    if (!appointmentTime) {
        alert('Please select an appointment time.');
        return null;
    }
    
    if (!serviceId || serviceId === 'Select a service') {
        alert('Please select a service.');
        return null;
    }
    
    if (!clinicId) {
        alert('Please select a clinic first.');
        return null;
    }

    // Create form data object
    const formData = new FormData();
    formData.append('action', 'create_appointment');
    formData.append('clinic_id', clinicId);
    formData.append('appointment_date', appointmentDate);
    formData.append('appointment_time', appointmentTime);
    formData.append('service_id', serviceId);
    
    return formData;
}

function attachAppointmentFormHandler() {
    const form = document.getElementById('applyAppointment');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Validate the form
        if (!validateForm('applyAppointment')) {
            return;
        }
        
        // Get selected service name for confirmation message
        const serviceSelect = document.getElementById('service_type');
        const selectedServiceText = serviceSelect.options[serviceSelect.selectedIndex].text;
        const appointmentDate = document.getElementById('appointment_date').value;
        const appointmentTime = document.getElementById('appointment_time').value;
        
        // Format the date and time for display
        const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Format time to 12-hour format
        const formattedTime = formatTime(appointmentTime);
        
        // Confirm submission
        const confirmed = await confirmSubmission(`Are you sure you want to book an appointment for "${selectedServiceText}" on ${formattedDate} at ${formattedTime}?`);
        if (!confirmed) return;
        
        // Show loading on the submit button
        showLoading(form.querySelector('button[type="submit"]').id || 'submitAppointmentBtn', 'Booking...');
        
        fetch('create_appointment');
    });
}

// Helper function to format time to 12-hour format
function formatTime(time) {
    if (!time) return '';
    
    // Parse the time string (HH:MM)
    const [hours, minutes] = time.split(':').map(Number);
    const hour = parseInt(hours, 10);
    
    // Convert to 12-hour format
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // 0 should be displayed as 12
    
    return `${hour12}:${minutes} ${period}`;
}

function createAppointmentHandler(formData) {
    const submitBtn = document.querySelector('#applyAppointment button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    return $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (submitBtn) submitBtn.disabled = false;

            if (response.success) {
                showAlert('Appointment created successfully! Please wait for clinic confirmation.', 'success', 3000);

                // Get the clinic ID that was submitted
                const clinicId = formData.get('clinic_id');
                
                // Add this clinic to the waiting list for the current pet if needed
                if (clinicId) {
                    addWaitingClinicForCurrentPet(parseInt(clinicId));
                }
                
                // Show waiting confirmation content instead of redirecting
                setTimeout(() => {
                    hideSettingAppointmentContent();
                    ShowWaitingClinicConfirmationContent();
                }, 3100);
            } else {
                showAlert('Failed to create appointment: ' + (response.message || 'Unknown error.'), 'danger');
            }
        },
        error: function (xhr, status, error) {
            if (submitBtn) submitBtn.disabled = false;
            showAlert('An error occurred while creating the appointment.', 'danger');
        }
    });
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Reset previous validation
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    form.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
    });
    
    // Check each required field
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            
            // Add invalid class
            field.classList.add('is-invalid');
            
            // Add feedback message
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'invalid-feedback';
            feedbackDiv.textContent = 'This field is required';
            field.parentNode.appendChild(feedbackDiv);
        }
    });
    
    // Special validation for date field
    const dateField = form.querySelector('input[type="date"]');
    if (dateField && dateField.value) {
        const selectedDate = new Date(dateField.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            dateField.classList.add('is-invalid');
            
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'invalid-feedback';
            feedbackDiv.textContent = 'Please select a future date';
            dateField.parentNode.appendChild(feedbackDiv);
        }
    }
    
    // Special validation for time field
    const timeField = form.querySelector('input[type="time"]');
    if (timeField && timeField.value && dateField && dateField.value) {
        const selectedTime = timeField.value;
        const [hours, minutes] = selectedTime.split(':').map(Number);
        
        // Check if time is within business hours (8 AM to 5 PM)
        if (hours < 8 || hours >= 17) {
            isValid = false;
            timeField.classList.add('is-invalid');
            
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'invalid-feedback';
            feedbackDiv.textContent = 'Please select a time between 8:00 AM and 5:00 PM';
            timeField.parentNode.appendChild(feedbackDiv);
        }
        
        // If date is today, validate that time is in the future
        const selectedDate = new Date(dateField.value);
        const today = new Date();
        
        if (selectedDate.toDateString() === today.toDateString()) {
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();
            
            if (hours < currentHour || (hours === currentHour && minutes <= currentMinute)) {
                isValid = false;
                timeField.classList.add('is-invalid');
                
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'invalid-feedback';
                feedbackDiv.textContent = 'Please select a future time';
                timeField.parentNode.appendChild(feedbackDiv);
            }
        }
    }
    
    // Check file inputs for booklet form
    if (formId === 'bookletUploadForm') {
        const fileInputs = ['Booklet_front_page_left', 'Booklet_front_page_right', 
                            'Booklet_back_page_left', 'Booklet_back_page_right'];
        let filesSelected = false;
        
        fileInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input && input.files && input.files.length > 0) {
                filesSelected = true;
            }
        });
        
        if (!filesSelected) {
            isValid = false;
            // Show a message at the top of the form
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.role = 'alert';
            alertDiv.textContent = 'Please upload at least one booklet image';
            form.prepend(alertDiv);
            
            // Remove alert after 3 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 3000);
        }
    }
    
    return isValid;
}

// Function to show loading state for both buttons and containers
function showLoading(elementIdOrElement, message = 'Loading...') {
    let element;
    
    if (typeof elementIdOrElement === 'string') {
        element = document.getElementById(elementIdOrElement);
    } else {
        element = elementIdOrElement;
    }
    
    if (!element) return;
    
    // Check if it's a button
    if (element.tagName === 'BUTTON' || element instanceof HTMLButtonElement) {
        // For buttons
        if (!element.hasAttribute('data-original-content')) {
            element.setAttribute('data-original-content', element.innerHTML);
        }
        
        element.innerHTML = `
            <div class="d-flex align-items-center justify-content-center">
                <div class="spinner-border spinner-border-sm text-light me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span>${message || 'Loading...'}</span>
            </div>
        `;
        
        element.disabled = true;
    } else {
        // For containers
        element.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">${message || 'Loading clinics...'}</p>
            </div>
        `;
    }
}

// Function to hide loading state
function hideLoading(elementIdOrElement) {
    let element;
    
    if (typeof elementIdOrElement === 'string') {
        element = document.getElementById(elementIdOrElement);
    } else {
        element = elementIdOrElement;
    }
    
    if (!element) return;
    
    // Restore original content for buttons
    if (element.tagName === 'BUTTON' || element instanceof HTMLButtonElement) {
        if (element.hasAttribute('data-original-content')) {
            element.innerHTML = element.getAttribute('data-original-content');
            element.removeAttribute('data-original-content');
        }
        
        element.disabled = false;
    }
}

// Empty state handlers
function showEmptyState(containerId, message, icon = 'frown') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const emptyState = `
        <div class="text-center p-5 empty-state">
            <i class="fas fa-${icon} fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">${message}</h5>
        </div>
    `;
    
    container.innerHTML = emptyState;
}

// Initialize search functionality
function initSearchFunctionality() {
    // With Doc search
    const withDocSearchInput = document.getElementById('withDocSearchInput');
    const withDocSearchBtn = document.getElementById('withDocSearchBtn');
    
    if (withDocSearchInput && withDocSearchBtn) {
        withDocSearchInput.addEventListener('input', function() {
            if (searchTimeout) clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                searchClinics('withDocCards', this.value);
            }, 300); // Debounce search for 300ms
        });
        
        withDocSearchBtn.addEventListener('click', function() {
            searchClinics('withDocCards', withDocSearchInput.value);
        });
        
        // Add enter key support
        withDocSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchClinics('withDocCards', this.value);
            }
        });
    }
    
    // No Doc search - same logic for this section
    const noDocSearchInput = document.getElementById('noDocSearchInput');
    const noDocSearchBtn = document.getElementById('noDocSearchBtn');
    
    if (noDocSearchInput && noDocSearchBtn) {
        noDocSearchInput.addEventListener('input', function() {
            if (searchTimeout) clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                searchClinics('noDocCards', this.value);
            }, 300); // Debounce search for 300ms
        });
        
        noDocSearchBtn.addEventListener('click', function() {
            searchClinics('noDocCards', noDocSearchInput.value);
        });
        
        // Add enter key support
        noDocSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchClinics('noDocCards', this.value);
            }
        });
    }
}

// Search clinics function
function searchClinics(containerId, query) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Show loading state
    showLoading(containerId, '');
    
    // If query is empty, show all clinics by fetching from backend
    if (!query.trim()) {
        fetchApprovedClinics().done(function(response) {
            if (response.success && response.data) {
                renderClinicCardsForContainer(response.data, containerId);
            } else {
                showEmptyState(containerId, 'No clinics available', 'hospital-user');
            }
        });
        return;
    }
    
    // Use backend search endpoint
    $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'search_clinics',
            search_term: query
        },
        success: function(response) {
            if (response.success && response.data && response.data.length > 0) {
                // Update our global clinics with search results
                currentClinics = response.data;
                renderClinicCardsForContainer(response.data, containerId);
            } else {
                showEmptyState(containerId, 'No clinics found matching your search', 'search');
            }
        },
        error: function(xhr, status, error) {
            showEmptyState(containerId, 'Failed to search clinics. Please try again.', 'exclamation-triangle');
        }
    });
}

// Filter functionality
function initFilterFunctionality() {
    const filterBtns = document.querySelectorAll('#withDocFilterBtn, #noDocFilterBtn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showFilterModal(this.id.includes('withDoc') ? 'withDocCards' : 'noDocCards');
        });
    });
}

function showFilterModal(containerId) {
    // Create modal dynamically
    const modalId = 'filterModal';
    let modal = document.getElementById(modalId);
    
    // Remove existing modal if present
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // Create new modal
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.tabIndex = '-1';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Filter Clinics</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="filterForm">
                        <div class="mb-3">
                            <label class="form-label">Distance</label>
                            <select class="form-select" id="filterDistance">
                                <option value="">Any distance</option>
                                <option value="5">Within 5 km</option>
                                <option value="10">Within 10 km</option>
                                <option value="25">Within 25 km</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Services</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="checkVaccination">
                                <label class="form-check-label" for="checkVaccination">Vaccination</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="checkCheckup">
                                <label class="form-check-label" for="checkCheckup">General Checkup</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="checkGrooming">
                                <label class="form-check-label" for="checkGrooming">Grooming</label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-warning" id="applyFilterBtn">Apply Filters</button>
                    <button type="button" class="btn btn-outline-secondary" id="resetFilterBtn">Reset</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Bootstrap modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Add event listeners to filter buttons
    document.getElementById('applyFilterBtn').addEventListener('click', function() {
        applyFilters(containerId);
        modalInstance.hide();
    });
    
    document.getElementById('resetFilterBtn').addEventListener('click', function() {
        document.getElementById('filterForm').reset();
        filtersActive = false;
        renderClinicCards(currentClinics, containerId);
        modalInstance.hide();
    });
}

function applyFilters(containerId) {
    const distanceFilter = document.getElementById('filterDistance').value;
    const vaccinationFilter = document.getElementById('checkVaccination').checked;
    const checkupFilter = document.getElementById('checkCheckup').checked;
    const groomingFilter = document.getElementById('checkGrooming').checked;
    
    filtersActive = !!(distanceFilter || vaccinationFilter || checkupFilter || groomingFilter);
    
    // This is a placeholder - in a real implementation, you would use actual service data
    // from your API and calculate distances based on user location
    let filteredClinics = [...currentClinics];
    
    // Apply filters (this is simplified - you would need to implement actual logic)
    if (filtersActive) {
        // Filter by distance if selected
        if (distanceFilter) {
            // This would need real implementation to calculate distances
            // For now, just show fewer clinics for demonstration
            filteredClinics = filteredClinics.slice(0, Math.ceil(filteredClinics.length / 2));
        }
        
        // Filter by services (placeholder logic)
        if (vaccinationFilter || checkupFilter || groomingFilter) {
            // Randomly filter clinics for demonstration purposes
            filteredClinics = filteredClinics.filter(() => Math.random() > 0.3);
        }
    }
    
    // Update clinic cards
    if (filteredClinics.length > 0) {
        renderClinicCardsForContainer(filteredClinics, containerId);
    } else {
        showEmptyState(containerId, 'No clinics match your filters', 'filter');
    }
}

// Modified to work with pet-specific waiting status
function renderClinicCardsForContainer(clinics, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Get current pet ID
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
    
    if (!currentPetId) {
        return;
    }
    
    // Show loading state
    showLoading(containerId, 'Loading clinics...');
    
    // First, batch-fetch all waiting clinic IDs at once to avoid multiple API calls
    // We'll make this a Promise to ensure it completes before rendering
    let waitingPromise = new Promise((resolve) => {
        $.ajax({
            url: '../backends/account_pet-registration.php',
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'get_all_waiting_clinics',
                account_id: accountId,
                pet_id: currentPetId
            },
            success: function(response) {
                if (response.success && response.data && response.data.clinics) {
                    const waitingClinicIds = response.data.clinics.map(clinic => parseInt(clinic.clinic_id));
                    setWaitingClinicsForCurrentPet(waitingClinicIds);
                } else {
                    setWaitingClinicsForCurrentPet([]);
                }
                resolve();
            },
            error: function(xhr, status, error) {
                setWaitingClinicsForCurrentPet([]);
                resolve();
            }
        });
    });
    
    // Now wait for the waiting clinics to be loaded before rendering
    waitingPromise.then(() => {
        let cardsHTML = '';
        
        if (clinics.length === 0) {
            showEmptyState(containerId, 'No clinics available at this time', 'hospital');
            return;
        }
        
        // Get the current pet's waiting clinics
        const waitingClinicIds = getWaitingClinicsForCurrentPet();
        
        clinics.forEach(clinic => {
            const clinicId = parseInt(clinic.clinic_id);
            const logoUrl = `../uploads/clinic_logos/${encodeURIComponent(clinic.clinic_logo)}`;
            
            const isRegisteredClinic = clinicId === parseInt(registeredClinicId);
            const isWaitingClinic = waitingClinicIds.includes(clinicId);
            
            let buttonText = 'Select';
            let buttonDisabled = '';
            let buttonClass = 'btn-warning';
            
            if (isRegisteredClinic) {
                buttonText = 'Already Registered Here';
                buttonDisabled = 'disabled';
                buttonClass = 'btn-secondary';
            } else if (isWaitingClinic) {
                buttonText = 'Awaiting Confirmation';
                buttonDisabled = 'disabled';
                buttonClass = 'btn-info';
            }
            
            // Format the address from the nested address object
            let formattedAddress = 'No address provided';
            if (clinic.address) {
                const a = clinic.address;
                const parts = [];
                
                // Street address
                if (a.street_number && a.street_name) {
                    parts.push(`${a.street_number} ${a.street_name}`);
                }
                
                // Barangay
                if (a.barangay) {
                    parts.push(a.barangay);
                }
                
                // City/Municipality
                if (a.city) {
                    parts.push(a.city);
                } else if (a.municipality) {
                    parts.push(a.municipality);
                }
                
                // Province
                if (a.province) {
                    parts.push(a.province);
                }
                
                // Only update if we have parts
                if (parts.length > 0) {
                    formattedAddress = parts.join(', ');
                }
            }
            
            cardsHTML += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <img src="${logoUrl}" class="rounded-circle me-3" width="50" height="50" style="object-fit: cover;">
                                <h5 class="card-title mb-0">${clinic.clinic_name}</h5>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="card-text text-muted mb-0 small">
                                        <i class="fas fa-map-marker-alt me-1"></i> 
                                        ${formattedAddress}
                                    </p>
                                </div>
                                <button class="btn ${buttonClass} select-btn"
                                    id="select-clinic-${clinic.clinic_id}"
                                    data-clinic-id="${clinic.clinic_id}"
                                    data-clinic="${clinic.clinic_name}"
                                    data-clinic-logo="${clinic.clinic_logo}"
                                    ${buttonDisabled}>
                                    ${buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = cardsHTML;
    });
}

// Function to fetch and update waiting clinic information
function updateWaitingClinicInfo(accountId, petId) {
    // First, fetch data from the server
    $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'get_waiting_clinic_info',
            account_id: accountId,
            pet_id: petId || $('#selected_pet_id').val()
        },
        success: function (response) {
            if (response.success && response.data) {
                // Update the clinic information in the waiting content
                const clinicData = response.data;
                
                // Update clinic name
                $('.waiting-clinic-name').text(clinicData.clinic_name || 'Waiting for clinic confirmation');
                
                // Update clinic logo
                if (clinicData.clinic_logo) {
                    $('.waiting-clinic-logo').attr('src', '../uploads/clinic_logos/' + encodeURIComponent(clinicData.clinic_logo));
                    $('.waiting-clinic-logo').attr('alt', clinicData.clinic_name);
                }
            }
        },
        error: function (xhr, status, error) {
            // Handle error without console.error
        }
    });
}

// Set min date for appointment
function setTimeRangeForAppointment() {
    const timeField = document.getElementById('appointment_time');
    if (!timeField) return;
    
    // Set default value to a common starting time (e.g., 9:00 AM)
    timeField.value = '09:00';
    
    // Optional: Set min and max times for business hours
    // Most clinics operate between 8 AM and 5 PM
    timeField.min = '08:00';
    timeField.max = '17:00';
}

// Update the existing setMinDateForAppointment function to also call setTimeRangeForAppointment
function setMinDateForAppointment() {
    const dateField = document.getElementById('appointment_date');
    if (!dateField) return;
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    dateField.min = `${yyyy}-${mm}-${dd}`;
    
    // Also set time range
    setTimeRangeForAppointment();
}

// Confirmation dialog before form submission
function confirmSubmission(message) {
    return new Promise((resolve, reject) => {
        // Create modal dynamically
        const modalId = 'confirmModal';
        let modal = document.getElementById(modalId);
        
        // Remove existing modal if present
        if (modal) {
            document.body.removeChild(modal);
        }
        
        // Create new modal
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Submission</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancelBtn">Cancel</button>
                        <button type="button" class="btn btn-warning" id="confirmBtn">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Add event listeners
        document.getElementById('cancelBtn').addEventListener('click', function() {
            resolve(false);
            modalInstance.hide();
        });
        
        document.getElementById('confirmBtn').addEventListener('click', function() {
            resolve(true);
            modalInstance.hide();
        });
        
        // Handle modal dismissal
        modal.addEventListener('hidden.bs.modal', function() {
            resolve(false);
        });
    });
}

// Function to forcibly check and disable buttons for waiting clinics
function forceUpdateWaitingClinicButtons() {
    // Get current pet ID
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
    
    if (!currentPetId) {
        return;
    }
    
    // Always get a fresh list from the server to ensure accuracy
    $.ajax({
        url: '../backends/account_pet-registration.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'get_all_waiting_clinics',
            account_id: accountId,
            pet_id: currentPetId
        },
        success: function(response) {
            if (response.success && response.data && response.data.clinics) {
                const waitingClinicIds = response.data.clinics.map(clinic => parseInt(clinic.clinic_id));
                
                // Update our local storage
                setWaitingClinicsForCurrentPet(waitingClinicIds);
                
                // Update all buttons based on this fresh data
                document.querySelectorAll('.select-btn').forEach(button => {
                    const clinicId = parseInt(button.dataset.clinicId);
                    const clinicName = button.dataset.clinic;
                    
                    // Check if this clinic is in the waiting list for this pet
                    if (waitingClinicIds.includes(clinicId)) {
                        button.disabled = true;
                        button.classList.remove('btn-warning');
                        button.classList.add('btn-info');
                        button.textContent = 'Awaiting Confirmation';
                        button.setAttribute('data-waiting', 'true');
                    } else {
                        // Only enable if not already disabled for another reason (like "Already Registered")
                        if (button.textContent === 'Awaiting Confirmation') {
                            button.disabled = false;
                            button.classList.remove('btn-info');
                            button.classList.add('btn-warning');
                            button.textContent = 'Select';
                            button.removeAttribute('data-waiting');
                        }
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            // Handle error without console.error
        }
    });
}

// Call this function after content changes
document.addEventListener('DOMContentLoaded', function() {
    // Mutation observer to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any select buttons were added
                const hasSelectButtons = Array.from(mutation.addedNodes).some(node => {
                    if (node.nodeType === 1) { // Element node
                        return node.classList && node.classList.contains('select-btn') || 
                               node.querySelector && node.querySelector('.select-btn');
                    }
                    return false;
                });
                
                if (hasSelectButtons) {
                    setTimeout(forceUpdateWaitingClinicButtons, 100);
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
});

// Direct event handler for the back button in the document submission form
document.addEventListener('DOMContentLoaded', function() {
    // Find the back button in the document submission form
    const backBtn = document.querySelector('.back-to-selecting-clinic-with-docs');
    if (backBtn) {
        // Add a direct click handler
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide the booklet registration form with !important
            const bookletForm = document.getElementById('clinic_booklet_registration');
            if (bookletForm) {
                bookletForm.style.cssText = 'display: none !important';
                bookletForm.classList.add('d-none');
                
                // Add a short delay to ensure the hide takes effect
                setTimeout(() => {
                    showWithDocContentClinicSelectionContent();
                }, 10);
            } else {
                showWithDocContentClinicSelectionContent();
            }
        });
    }
});

// Helper function to get waiting clinics for current pet
function getWaitingClinicsForCurrentPet() {
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
    if (!currentPetId) return [];
    
    if (!window.petWaitingClinics[currentPetId]) {
        window.petWaitingClinics[currentPetId] = [];
    }
    
    return window.petWaitingClinics[currentPetId];
}

// Helper function to set waiting clinics for current pet
function setWaitingClinicsForCurrentPet(clinicIds) {
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
    if (!currentPetId) return;
    
    window.petWaitingClinics[currentPetId] = clinicIds;
}

// Helper function to add a waiting clinic for current pet
function addWaitingClinicForCurrentPet(clinicId) {
    const currentPetId = $('#selected_pet_id').val() || window.selected_pet_id;
    if (!currentPetId) return;
    
    if (!window.petWaitingClinics[currentPetId]) {
        window.petWaitingClinics[currentPetId] = [];
    }
    
    if (!window.petWaitingClinics[currentPetId].includes(parseInt(clinicId))) {
        window.petWaitingClinics[currentPetId].push(parseInt(clinicId));
    }
}

