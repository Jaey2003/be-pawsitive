// Global variables
let upcomingAppointments = [];
let initialAppointments = [];
let appointmentHistory = [];
let currentClinicFilter = 'all';

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeAppointmentsPage();
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize the appointments page
function initializeAppointmentsPage() {
    // Check session status first (for debugging)
    checkSessionStatus();
    
    // Load clinic data for the header and switcher
    loadClinicHeaderData();
    
    // Load appointments data
    loadUpcomingAppointments();
    loadInitialAppointments();
    
    // Load appointment history when that tab is clicked
    document.getElementById('history-tab').addEventListener('click', function() {
        loadAppointmentHistory();
    });
}

// Set up event listeners for the page
function setupEventListeners() {
    // Clinic switcher
    const clinicSwitcherMenu = document.getElementById('clinicSwitcherMenu');
    if (clinicSwitcherMenu) {
        clinicSwitcherMenu.addEventListener('click', function(e) {
            if (e.target.closest('[data-clinic]')) {
                const clinicElement = e.target.closest('[data-clinic]');
                const clinicId = clinicElement.dataset.clinic;
                
                // Update the current clinic filter
                currentClinicFilter = clinicId;
                
                // Update active class
                document.querySelectorAll('#clinicSwitcherMenu .dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                clinicElement.classList.add('active');
                
                // Update the current clinic display
                const clinicName = clinicElement.querySelector('div:last-child').textContent;
                document.querySelector('.current-clinic').textContent = clinicName;
                
                // Reload appointments with the new filter
                loadUpcomingAppointments();
                loadInitialAppointments();
                
                // Reload history if that tab is active
                if (document.getElementById('history-tab').getAttribute('aria-selected') === 'true') {
                    loadAppointmentHistory();
                }
            }
        });
    }
    
    // Appointment search and filters
    const appointmentSearch = document.getElementById('appointmentSearch');
    if (appointmentSearch) {
        appointmentSearch.addEventListener('input', filterAppointments);
    }
    
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterAppointments);
    }
    
    const serviceFilter = document.getElementById('serviceFilter');
    if (serviceFilter) {
        serviceFilter.addEventListener('change', filterAppointments);
    }
    
    // History filters
    const historyClinicFilter = document.getElementById('historyClinicFilter');
    if (historyClinicFilter) {
        historyClinicFilter.addEventListener('change', function() {
            loadAppointmentHistory();
        });
    }
    
    const historyDateFilter = document.getElementById('historyDateFilter');
    if (historyDateFilter) {
        historyDateFilter.addEventListener('change', function() {
            loadAppointmentHistory();
        });
    }
    
    const historyServiceFilter = document.getElementById('historyServiceFilter');
    if (historyServiceFilter) {
        historyServiceFilter.addEventListener('change', function() {
            loadAppointmentHistory();
        });
    }
    
    // Appointment details modal
    document.body.addEventListener('click', function(e) {
        const viewDetailsBtn = e.target.closest('.view-appointment-details');
        if (viewDetailsBtn) {
            const appointmentId = viewDetailsBtn.dataset.appointmentId;
            loadAppointmentDetails(appointmentId);
        }
        
        // Accept suggestion button
        const acceptBtn = e.target.closest('.accept-suggestion');
        if (acceptBtn) {
            const suggestionId = acceptBtn.dataset.suggestionId;
            handleSuggestionAction(suggestionId, 'Accepted');
        }
        
        // Reject suggestion button
        const rejectBtn = e.target.closest('.reject-suggestion');
        if (rejectBtn) {
            const suggestionId = rejectBtn.dataset.suggestionId;
            handleSuggestionAction(suggestionId, 'Rejected');
        }
    });
}

// Helper function to get status class for badges
function getStatusClass(status) {
    switch (status) {
        case 'Confirmed':
            return 'bg-success';
        case 'Pending':
            return 'bg-warning';
        case 'Cancelled':
            return 'bg-danger';
        case 'Completed':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

// Load clinic header data
function loadClinicHeaderData() {
    fetch('../backends/account-appointments.php?action=get_clinic_header')
        .then(response => {
            try {
                return response.json();
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return { status: 'error', message: 'Invalid JSON response', data: {} };
            }
        })
        .then(data => {
            if (data.status === 'success') {
                updateClinicHeader(data.data);
                populateClinicSwitcher(data.data.all_clinics);
            } else {
                console.error('Error loading clinic data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching clinic data:', error);
        });
}

// Update the clinic header with data
function updateClinicHeader(data) {
    const mainClinicLogo = document.getElementById('mainClinicLogo');
    const mainClinicTitle = document.querySelector('.main-clinic-title');
    const mainClinicAddress = document.getElementById('mainClinicAddress');
    
    if (data.main_clinic) {
        if (mainClinicLogo) {
            mainClinicLogo.src = data.main_clinic.logo || '../assets/images/clinic-logo-placeholder.png';
            mainClinicLogo.title = data.main_clinic.name;
        }
        
        if (mainClinicTitle) {
            mainClinicTitle.textContent = data.main_clinic.name;
        }
        
        if (mainClinicAddress) {
            mainClinicAddress.textContent = data.main_clinic.address;
        }
    }
}

// Populate the clinic switcher dropdown
function populateClinicSwitcher(clinics) {
    const clinicSwitcherMenu = document.getElementById('clinicSwitcherMenu');
    const currentClinicDisplay = document.querySelector('.current-clinic');
    const currentClinicBadge = document.querySelector('.clinic-badge');
    
    if (!clinicSwitcherMenu || !clinics || clinics.length === 0) return;
    
    // Clear existing items except the "View All Clinics" option
    const viewAllOption = clinicSwitcherMenu.querySelector('[data-clinic="all"]').closest('li');
    const divider = clinicSwitcherMenu.querySelector('.dropdown-divider');
    
    clinicSwitcherMenu.innerHTML = '';
    clinicSwitcherMenu.appendChild(divider);
    clinicSwitcherMenu.appendChild(viewAllOption);
    
    // Add each clinic to the dropdown
    clinics.forEach(clinic => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.dataset.clinic = clinic.clinic_id;
        
        const div = document.createElement('div');
        div.className = 'd-flex align-items-center';
        
        const img = document.createElement('img');
        img.src = clinic.logo || '../assets/images/clinic-logo-placeholder.png';
        img.alt = clinic.name;
        img.width = 24;
        img.height = 24;
        img.className = 'me-2';
        
        const nameDiv = document.createElement('div');
        nameDiv.textContent = clinic.name;
        
        div.appendChild(img);
        div.appendChild(nameDiv);
        a.appendChild(div);
        li.appendChild(a);
        
        clinicSwitcherMenu.insertBefore(li, divider);
    });
    
    // Set the current clinic display to the first clinic or "All Clinics"
    if (currentClinicDisplay) {
        currentClinicDisplay.textContent = clinics.length > 0 ? clinics[0].name : 'All Clinics';
    }
    
    if (currentClinicBadge && clinics.length > 0) {
        currentClinicBadge.src = clinics[0].logo || '../assets/images/clinic-logo-placeholder.png';
    }
}

// Load upcoming appointments
function loadUpcomingAppointments() {
    const upcomingAppointmentsBody = document.getElementById('upcomingAppointmentsBody');
    if (!upcomingAppointmentsBody) return;
    
    // Show loading indicator
    upcomingAppointmentsBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading appointments...</td></tr>';
    
    // Build the URL with clinic filter if needed
    let url = '../backends/account-appointments.php?action=fetch_upcoming_appointments';
    if (currentClinicFilter !== 'all') {
        url += `&clinic_id=${currentClinicFilter}`;
    }
    
    fetch(url)
        .then(response => {
            try {
                return response.json();
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return { status: 'error', message: 'Invalid JSON response', data: [] };
            }
        })
        .then(data => {
            if (data.status === 'success') {
                upcomingAppointments = Array.isArray(data.data) ? data.data : [];
                console.log('Loaded upcoming appointments:', upcomingAppointments.length);
                renderUpcomingAppointments();
                
                // Check if this is the first appointment
                const firstAppointmentBanner = document.getElementById('firstAppointmentBanner');
                if (firstAppointmentBanner) {
                    if (upcomingAppointments.length === 1 && appointmentHistory.length === 0) {
                        firstAppointmentBanner.style.display = 'block';
                    } else {
                        firstAppointmentBanner.style.display = 'none';
                    }
                }
            } else {
                console.error('Error loading appointments:', data.message);
                upcomingAppointmentsBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${data.message}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
            upcomingAppointmentsBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading appointments</td></tr>';
        });
}

// Load initial appointments
function loadInitialAppointments() {
    // Build the URL with clinic filter if needed
    let url = '../backends/account-appointments.php?action=fetch_initial_appointments';
    if (currentClinicFilter !== 'all') {
        url += `&clinic_id=${currentClinicFilter}`;
    }
    
    fetch(url)
        .then(response => {
            try {
                return response.json();
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return { status: 'error', message: 'Invalid JSON response', data: [] };
            }
        })
        .then(data => {
            if (data.status === 'success') {
                initialAppointments = Array.isArray(data.data) ? data.data : [];
                console.log('Loaded initial appointments:', initialAppointments.length);
                // Combine with regular appointments for display
                renderUpcomingAppointments();
            } else {
                console.error('Error loading initial appointments:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching initial appointments:', error);
        });
}

// Load appointment history
function loadAppointmentHistory() {
    const historyTableBody = document.querySelector('#history table tbody');
    if (!historyTableBody) return;
    
    // Show loading indicator
    historyTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading appointment history...</td></tr>';
    
    // Get filter values
    const clinicFilter = document.getElementById('historyClinicFilter').value;
    const dateFilter = document.getElementById('historyDateFilter').value;
    const serviceFilter = document.getElementById('historyServiceFilter').value;
    
    // Build the URL with filters
    let url = '../backends/account-appointments.php?action=fetch_appointment_history';
    if (clinicFilter !== 'all') {
        url += `&clinic_id=${clinicFilter}`;
    }
    if (dateFilter) {
        url += `&date_filter=${dateFilter}`;
    }
    if (serviceFilter) {
        url += `&service_filter=${serviceFilter}`;
    }
    
    fetch(url)
        .then(response => {
            try {
                return response.json();
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return { status: 'error', message: 'Invalid JSON response', data: [] };
            }
        })
        .then(data => {
            if (data.status === 'success') {
                appointmentHistory = data.data;
                renderAppointmentHistory();
                updateHistorySummary();
            } else {
                console.error('Error loading appointment history:', data.message);
                historyTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading appointment history</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching appointment history:', error);
            historyTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading appointment history</td></tr>';
        });
}

// Load appointment details
function loadAppointmentDetails(appointmentId) {
    const modal = document.getElementById('appointmentDetailsModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Show loading indicator
    modalBody.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Loading appointment details...</p></div>';
    
    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    fetch(`../backends/account-appointments.php?action=get_appointment_details&appointment_id=${appointmentId}`)
        .then(response => {
            try {
                return response.json();
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return { status: 'error', message: 'Invalid JSON response', data: {} };
            }
        })
        .then(data => {
            if (data.status === 'success') {
                renderAppointmentDetails(data.data, modalBody);
            } else {
                console.error('Error loading appointment details:', data.message);
                modalBody.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error fetching appointment details:', error);
            modalBody.innerHTML = '<div class="alert alert-danger">Error loading appointment details. Please try again later.</div>';
        });
}

// Render upcoming appointments
function renderUpcomingAppointments() {
    const upcomingAppointmentsBody = document.getElementById('upcomingAppointmentsBody');
    if (!upcomingAppointmentsBody) return;
    
    // Combine regular and initial appointments
    const allAppointments = [...upcomingAppointments, ...initialAppointments];
    
    // Sort by date and time
    allAppointments.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
        return dateA - dateB;
    });
    
    // Apply filters
    const filteredAppointments = filterAppointmentsList(allAppointments);
    
    if (filteredAppointments.length === 0) {
        upcomingAppointmentsBody.innerHTML = '<tr><td colspan="6" class="text-center">No upcoming appointments found</td></tr>';
        return;
    }
    
    // Clear the table
    upcomingAppointmentsBody.innerHTML = '';
    
    // Add each appointment to the table
    filteredAppointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        // Pet column
        const petCell = document.createElement('td');
        petCell.className = 'd-flex align-items-center';
        
        const petImg = document.createElement('img');
        petImg.src = appointment.pet_picture || '../assets/images/pet-placeholder.png';
        petImg.alt = appointment.pet_name;
        petImg.width = 40;
        petImg.height = 40;
        petImg.className = 'rounded-circle me-2';
        
        const petInfo = document.createElement('div');
        petInfo.innerHTML = `<strong>${appointment.pet_name}</strong><br><small class="text-muted">${appointment.pet_species} - ${appointment.pet_breed || 'Unknown'}</small>`;
        
        petCell.appendChild(petImg);
        petCell.appendChild(petInfo);
        row.appendChild(petCell);
        
        // Service column
        const serviceCell = document.createElement('td');
        serviceCell.innerHTML = `<div>${appointment.service_name}</div><small class="text-muted">${appointment.clinic_name}</small>`;
        row.appendChild(serviceCell);
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = appointment.formatted_date;
        row.appendChild(dateCell);
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = appointment.formatted_time;
        row.appendChild(timeCell);
        
        // Status column
        const statusCell = document.createElement('td');
        let statusClass = getStatusClass(appointment.status);
        
        statusCell.innerHTML = `<span class="badge ${statusClass}">${appointment.status}</span>`;
        if (appointment.is_initial) {
            statusCell.innerHTML += '<span class="badge bg-info ms-1">Initial</span>';
        }
        
        // Add room status if available
        if (appointment.room_status && appointment.room_status !== 'Not Created') {
            let roomStatusClass = 'bg-secondary';
            if (appointment.room_status === 'Created') {
                roomStatusClass = 'bg-info';
            } else if (appointment.room_status === 'active') {
                roomStatusClass = 'bg-primary';
            } else if (appointment.room_status === 'completed') {
                roomStatusClass = 'bg-success';
            }
            statusCell.innerHTML += `<span class="badge ${roomStatusClass} ms-1">Room: ${appointment.room_status}</span>`;
        }
        
        // Add attendance status if not "Not Recorded"
        if (appointment.attendance_status && appointment.attendance_status !== 'Not Recorded') {
            let attendanceClass = 'bg-secondary';
            if (appointment.attendance_status === 'Present') {
                attendanceClass = 'bg-success';
            } else if (appointment.attendance_status === 'Absent') {
                attendanceClass = 'bg-danger';
            } else if (appointment.attendance_status === 'Late') {
                attendanceClass = 'bg-warning';
            }
            statusCell.innerHTML += `<span class="badge ${attendanceClass} ms-1">${appointment.attendance_status}</span>`;
        }
        
        row.appendChild(statusCell);
        
        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Actions
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item view-appointment-details" data-appointment-id="${appointment.appointment_id}"><i class="fas fa-eye me-2"></i> View Details</button></li>
                    <li><button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#cancelModal" data-appointment-id="${appointment.appointment_id}"><i class="fas fa-times-circle me-2"></i> Cancel</button></li>
                    <li><button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#rescheduleModal" data-appointment-id="${appointment.appointment_id}"><i class="fas fa-calendar-alt me-2"></i> Reschedule</button></li>
                </ul>
            </div>
        `;
        row.appendChild(actionsCell);
        
        upcomingAppointmentsBody.appendChild(row);
    });
}

// Render appointment history
function renderAppointmentHistory() {
    const historyTableBody = document.querySelector('#history table tbody');
    if (!historyTableBody) return;
    
    if (appointmentHistory.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No appointment history found</td></tr>';
        return;
    }
    
    // Clear the table
    historyTableBody.innerHTML = '';
    
    // Add each appointment to the table
    appointmentHistory.forEach(appointment => {
        const row = document.createElement('tr');
        
        // Pet column
        const petCell = document.createElement('td');
        petCell.className = 'd-flex align-items-center';
        
        const petImg = document.createElement('img');
        petImg.src = appointment.pet_picture || '../assets/images/pet-placeholder.png';
        petImg.alt = appointment.pet_name;
        petImg.width = 40;
        petImg.height = 40;
        petImg.className = 'rounded-circle me-2';
        
        const petInfo = document.createElement('div');
        petInfo.innerHTML = `<strong>${appointment.pet_name}</strong><br><small class="text-muted">${appointment.pet_species} - ${appointment.pet_breed || 'Unknown'}</small>`;
        
        petCell.appendChild(petImg);
        petCell.appendChild(petInfo);
        row.appendChild(petCell);
        
        // Service column
        const serviceCell = document.createElement('td');
        serviceCell.innerHTML = `<div>${appointment.service_name}</div><small class="text-muted">${appointment.clinic_name}</small>`;
        row.appendChild(serviceCell);
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = appointment.formatted_date;
        row.appendChild(dateCell);
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = appointment.formatted_time;
        row.appendChild(timeCell);
        
        // Status column
        const statusCell = document.createElement('td');
        let statusClass = getStatusClass(appointment.status);
        
        statusCell.innerHTML = `<span class="badge ${statusClass}">${appointment.status}</span>`;
        row.appendChild(statusCell);
        
        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Actions
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item view-appointment-details" data-appointment-id="${appointment.appointment_id}"><i class="fas fa-eye me-2"></i> View Details</button></li>
                    <li><button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#feedbackModal" data-appointment-id="${appointment.appointment_id}"><i class="fas fa-comment me-2"></i> Provide Feedback</button></li>
                    <li><button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#medicalHistoryModal" data-appointment-id="${appointment.appointment_id}"><i class="fas fa-file-medical me-2"></i> Medical History</button></li>
                </ul>
            </div>
        `;
        row.appendChild(actionsCell);
        
        historyTableBody.appendChild(row);
    });
}

// Render appointment details in the modal
function renderAppointmentDetails(appointment, modalBody) {
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>Appointment Information</h5>
                <div class="mb-3">
                    <strong>Date:</strong> ${appointment.formatted_date}
                </div>
                <div class="mb-3">
                    <strong>Time:</strong> ${appointment.formatted_time}
                </div>
                <div class="mb-3">
                    <strong>Status:</strong> 
                    <span class="badge ${getStatusClass(appointment.status)}">${appointment.status}</span>
                    ${appointment.is_initial ? '<span class="badge bg-info ms-1">Initial</span>' : ''}
                </div>
                ${appointment.room_status && appointment.room_status !== 'Not Created' ? 
                    `<div class="mb-3">
                        <strong>Room Status:</strong> 
                        <span class="badge ${appointment.room_status === 'Created' ? 'bg-info' : 
                                             appointment.room_status === 'active' ? 'bg-primary' : 
                                             appointment.room_status === 'completed' ? 'bg-success' : 'bg-secondary'}">${appointment.room_status}</span>
                    </div>` : ''}
                ${appointment.attendance_status && appointment.attendance_status !== 'Not Recorded' ? 
                    `<div class="mb-3">
                        <strong>Attendance:</strong> 
                        <span class="badge ${appointment.attendance_status === 'Present' ? 'bg-success' : 
                                             appointment.attendance_status === 'Absent' ? 'bg-danger' : 
                                             appointment.attendance_status === 'Late' ? 'bg-warning' : 'bg-secondary'}">${appointment.attendance_status}</span>
                    </div>` : ''}
                <h5 class="mt-4">Service Information</h5>
                <div class="service-details p-3 border rounded mb-3">
                    <div class="d-flex align-items-center mb-2">
                        ${appointment.service_image ? 
                            `<img src="${appointment.service_image}" alt="${appointment.service_name}" class="me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : 
                            ''
                        }
                        <div>
                            <h6 class="mb-0">${appointment.service_name}</h6>
                            <div class="text-primary fw-bold">$${parseFloat(appointment.price).toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="service-description">
                        ${appointment.service_description || 'No description available'}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h5>Pet Information</h5>
                <div class="d-flex align-items-center mb-3">
                    <img src="${appointment.pet_picture || '../assets/images/pet-placeholder.png'}" alt="${appointment.pet_name}" width="60" height="60" class="rounded-circle me-3">
                    <div>
                        <h6 class="mb-0">${appointment.pet_name}</h6>
                        <small class="text-muted">${appointment.pet_species} - ${appointment.pet_breed || 'Unknown'}</small>
                    </div>
                </div>
                <h5 class="mt-4">Clinic Information</h5>
                <div class="d-flex align-items-center mb-3">
                    <img src="${appointment.clinic_logo || '../assets/images/clinic-logo-placeholder.png'}" alt="${appointment.clinic_name}" width="60" height="60" class="rounded-circle me-3">
                    <div>
                        <h6 class="mb-0">${appointment.clinic_name}</h6>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add suggested alternatives section if this is an initial appointment with suggestions
    if (appointment.is_initial && appointment.suggestions && appointment.suggestions.length > 0) {
        const suggestionsSection = document.createElement('div');
        suggestionsSection.className = 'mt-4';
        suggestionsSection.innerHTML = `
            <h5>Alternative Appointment Suggestions</h5>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Suggested Date</th>
                            <th>Suggested Time</th>
                            <th>Clinic Feedback</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="suggestionTableBody"></tbody>
                </table>
            </div>
        `;
        
        modalBody.appendChild(suggestionsSection);
        
        const suggestionTableBody = document.getElementById('suggestionTableBody');
        appointment.suggestions.forEach(suggestion => {
            const row = document.createElement('tr');
            
            // Date column
            const dateCell = document.createElement('td');
            dateCell.textContent = suggestion.formatted_date;
            row.appendChild(dateCell);
            
            // Time column
            const timeCell = document.createElement('td');
            timeCell.textContent = suggestion.formatted_time;
            row.appendChild(timeCell);
            
            // Feedback column
            const feedbackCell = document.createElement('td');
            feedbackCell.textContent = suggestion.clinic_feedback || 'No feedback provided';
            row.appendChild(feedbackCell);
            
            // Status column
            const statusCell = document.createElement('td');
            let clientStatusClass = '';
            switch (suggestion.client_status) {
                case 'Accepted':
                    clientStatusClass = 'bg-success';
                    break;
                case 'Rejected':
                    clientStatusClass = 'bg-danger';
                    break;
                case 'Superseded':
                    clientStatusClass = 'bg-secondary';
                    break;
                default:
                    clientStatusClass = 'bg-warning';
            }
            
            statusCell.innerHTML = `<span class="badge ${clientStatusClass}">${suggestion.client_status}</span>`;
            row.appendChild(statusCell);
            
            // Actions column
            const actionsCell = document.createElement('td');
            if (suggestion.client_status === 'Pending') {
                actionsCell.innerHTML = `
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-success accept-suggestion" data-suggestion-id="${suggestion.suggestion_id}">Accept</button>
                        <button class="btn btn-sm btn-danger reject-suggestion" data-suggestion-id="${suggestion.suggestion_id}">Reject</button>
                    </div>
                `;
            } else if (suggestion.client_status === 'Accepted') {
                actionsCell.innerHTML = `<span class="text-success"><i class="fas fa-check-circle"></i> Accepted</span>`;
            } else if (suggestion.client_status === 'Rejected') {
                actionsCell.innerHTML = `<span class="text-danger"><i class="fas fa-times-circle"></i> Rejected</span>`;
                if (suggestion.client_feedback) {
                    actionsCell.innerHTML += `<br><small class="text-muted">${suggestion.client_feedback}</small>`;
                }
            } else if (suggestion.client_status === 'Superseded') {
                actionsCell.innerHTML = `<span class="text-muted"><i class="fas fa-ban"></i> No longer available</span>`;
            } else {
                actionsCell.textContent = 'No actions available';
            }
            row.appendChild(actionsCell);
            
            suggestionTableBody.appendChild(row);
        });
    }
}

// Update history summary cards
function updateHistorySummary() {
    const totalVisits = document.getElementById('totalVisits');
    const completedVisits = document.getElementById('completedVisits');
    const upcomingVisits = document.getElementById('upcomingVisits');
    const lastVisit = document.getElementById('lastVisit');
    
    if (totalVisits) {
        totalVisits.textContent = appointmentHistory.length + upcomingAppointments.length + initialAppointments.length;
    }
    
    if (completedVisits) {
        const completed = appointmentHistory.filter(appt => appt.status === 'Completed').length;
        completedVisits.textContent = completed;
    }
    
    if (upcomingVisits) {
        upcomingVisits.textContent = upcomingAppointments.length + initialAppointments.length;
    }
    
    if (lastVisit && appointmentHistory.length > 0) {
        // Sort by date descending
        const sortedHistory = [...appointmentHistory].sort((a, b) => {
            const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
            const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
            return dateB - dateA;
        });
        
        lastVisit.textContent = sortedHistory[0].formatted_date;
    }
}

// Filter appointments based on search and filter inputs
function filterAppointments() {
    renderUpcomingAppointments();
}

// Filter the appointments list based on search and filter criteria
function filterAppointmentsList(appointments) {
    const searchTerm = document.getElementById('appointmentSearch')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    const serviceFilter = document.getElementById('serviceFilter')?.value || '';
    
    return appointments.filter(appointment => {
        // Search filter
        const searchMatch = searchTerm === '' || 
            appointment.pet_name.toLowerCase().includes(searchTerm) ||
            appointment.service_name.toLowerCase().includes(searchTerm) ||
            appointment.clinic_name.toLowerCase().includes(searchTerm);
        
        // Date filter
        let dateMatch = true;
        if (dateFilter) {
            const appointmentDate = new Date(appointment.appointment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch (dateFilter) {
                case 'today':
                    dateMatch = appointmentDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekLater = new Date(today);
                    weekLater.setDate(today.getDate() + 7);
                    dateMatch = appointmentDate >= today && appointmentDate <= weekLater;
                    break;
                case 'month':
                    const monthLater = new Date(today);
                    monthLater.setMonth(today.getMonth() + 1);
                    dateMatch = appointmentDate >= today && appointmentDate <= monthLater;
                    break;
            }
        }
        
        // Service filter
        const serviceMatch = serviceFilter === '' || 
            appointment.service_name.toLowerCase().includes(serviceFilter.toLowerCase());
        
        return searchMatch && dateMatch && serviceMatch;
    });
}

// Handle JSON parsing errors gracefully
function safelyParseJSON(response) {
    try {
        return response.json();
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return { status: 'error', message: 'Invalid JSON response', data: [] };
    }
}

// Add this function to check session status (for debugging)
function checkSessionStatus() {
    fetch('../backends/account-appointments.php?action=debug_session')
        .then(response => response.json())
        .then(data => {
            console.log('Session debug info:', data);
        })
        .catch(error => {
            console.error('Error checking session:', error);
        });
}

// Handle accepting or rejecting an appointment suggestion
function handleSuggestionAction(suggestionId, clientStatus) {
    if (!suggestionId || !clientStatus) return;
    
    // Optional: Show loading indicator or disable buttons
    const actionButton = document.querySelector(`.${clientStatus.toLowerCase()}-suggestion[data-suggestion-id="${suggestionId}"]`);
    const originalText = actionButton ? actionButton.textContent : '';
    if (actionButton) {
        actionButton.disabled = true;
        actionButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    }
    
    // Get any additional feedback from user
    let clientFeedback = '';
    if (clientStatus === 'Rejected') {
        clientFeedback = prompt('Please provide a reason for rejection (optional):') || '';
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('suggestion_id', suggestionId);
    formData.append('client_status', clientStatus);
    formData.append('client_feedback', clientFeedback);
    
    // Send AJAX request
    fetch('../backends/account-appointments.php?action=update_appointment_suggestion', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Show success message
            alert(data.message);
            
            // Reload appointment details to refresh the suggestions list
            const appointmentDetailsModal = document.getElementById('appointmentDetailsModal');
            const appointmentId = getActiveAppointmentId();
            
            if (appointmentId) {
                // Store the modal instance to prevent it from closing
                const modalInstance = bootstrap.Modal.getInstance(appointmentDetailsModal);
                
                // Reload the appointment details
                loadAppointmentDetails(appointmentId);
                
                // If the action was 'Accepted', also refresh the upcoming appointments list
                if (clientStatus === 'Accepted') {
                    loadUpcomingAppointments();
                    loadInitialAppointments();
                }
            } else {
                // If we can't determine the appointment ID, just reload the page
                window.location.reload();
            }
        } else {
            // Show error message
            alert('Error: ' + data.message);
            
            // Reset button if there was an error
            if (actionButton) {
                actionButton.disabled = false;
                actionButton.textContent = originalText;
            }
        }
    })
    .catch(error => {
        console.error('Error updating suggestion:', error);
        alert('An unexpected error occurred. Please try again.');
        
        // Reset button
        if (actionButton) {
            actionButton.disabled = false;
            actionButton.textContent = originalText;
        }
    });
}

// Helper function to get the active appointment ID from the modal
function getActiveAppointmentId() {
    const modal = document.getElementById('appointmentDetailsModal');
    if (!modal) return null;
    
    // Look for appointment ID in the buttons
    const detailsButtons = document.querySelectorAll('.view-appointment-details');
    for (const button of detailsButtons) {
        if (button.closest('.modal') === modal) {
            return button.dataset.appointmentId;
        }
    }
    
    // Try to find it in the suggestions table
    const suggestionButtons = document.querySelectorAll('.accept-suggestion, .reject-suggestion');
    if (suggestionButtons.length > 0) {
        const firstButton = suggestionButtons[0];
        const suggestionId = firstButton.dataset.suggestionId;
        
        // We have a suggestion ID, but need to look up appointment ID
        // For now, we'll reload the page in this case
        return null;
    }
    
    return null;
}