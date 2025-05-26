document.addEventListener('DOMContentLoaded', function() {
  // Store fetched appointments data
  let appointments = [];
  let unavailableTimes = [];
  let initialAppointments = []; // Store fetched initial appointments
  
  // Initialize date filters with today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('filterDate').value = today;
  
  // Calendar state
  let currentCalendarDate = new Date();
  
  // Load appointments when the page loads
  loadAppointments();
  
  // Add event listener for Manage Unavailable Times button
  document.getElementById('manageUnavailableTimes').addEventListener('click', function() {
    showUnavailableTimesModal();
  });
  
  // Appointment Reports button event listener removed
  
  // Add tab click event listeners
  const initialTab = document.getElementById('initial-tab');
  if (initialTab) {
    initialTab.addEventListener('shown.bs.tab', function() {
      if (initialAppointments.length === 0) {
        loadInitialAppointments();
      }
    });
  }

  // Fetch appointments from the backend
  function loadAppointments() {
    const tableBody = document.querySelector('#list-view table tbody');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <i class="fas fa-spinner fa-spin me-2"></i>Loading appointments...
          </td>
        </tr>
      `;
    }
    // Get filter values
    const dateFilter = document.getElementById('filterDate').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const serviceFilter = document.getElementById('filterService').value;
    const searchValue = document.getElementById('searchClient').value;
    
    // Build API URL with filters
    let apiUrl = '../backends/clinic-appointments.php?action=list';
    
    if (dateFilter) {
      apiUrl += `&date_from=${dateFilter}`;
    }
    
    if (statusFilter) {
      apiUrl += `&status=${statusFilter}`;
    }
    
    if (serviceFilter) {
      apiUrl += `&service=${serviceFilter}`;
    }
    
    if (searchValue) {
      apiUrl += `&search=${encodeURIComponent(searchValue)}`;
    }
    
    // Fetch appointments from the backend
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // Get the raw text first
      })
      .then(text => {
        try {
          return JSON.parse(text); // Then try to parse it as JSON
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          console.log('Raw response:', text);
          throw new Error('Invalid JSON response from server');
        }
      })
      .then(data => {
        if (data.success) {
          // Normalize date formats for consistency
          appointments = data.appointments.map(apt => {
            // Ensure date is in consistent format
            if (apt.date) {
              // Keep the original date string but ensure we can parse it correctly
              const dateObj = new Date(apt.date);
              if (!isNaN(dateObj.getTime())) {
                apt.date = formatDateForComparison(dateObj);
              }
            }
            return apt;
          });
          
          displayAppointments(appointments);
          
          // Initialize calendar with current date
          renderCalendar(currentCalendarDate);
        } else {
          throw new Error(data.error || 'Failed to load appointments');
        }
      })
      .catch(error => {
        console.error('Error fetching appointments:', error);
        document.querySelector('#list-view .table-responsive').innerHTML = 
          `<div class="alert alert-danger m-3">Error loading appointments: ${error.message}</div>`;
      });
  }
  
  // Display appointments in the list view
  function displayAppointments(appointmentsData) {
    const tableBody = document.querySelector('#list-view table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (appointmentsData.length === 0) {
      // Show a more informative no data message with icon and helpful text
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="text-center py-5">
              <div class="mb-3">
                <i class="fas fa-calendar-times fa-3x text-muted"></i>
              </div>
              <h5 class="text-muted mb-2">No Appointments Found</h5>
              <p class="text-muted mb-0">There are no appointments matching your current filters.</p>
              <p class="text-muted small">Try adjusting your filters or check back later.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    // Add rows for each appointment
    appointmentsData.forEach(appointment => {
      const row = document.createElement('tr');
      
      // Get the appropriate status badge class
      let statusClass = 'bg-secondary';
      switch(appointment.status.toLowerCase()) {
        case 'confirmed': statusClass = 'bg-confirmed'; break;
        case 'scheduled': statusClass = 'bg-scheduled'; break;
        case 'completed': statusClass = 'bg-completed'; break;
        case 'cancelled': statusClass = 'bg-cancelled'; break;
        case 'verified': statusClass = 'bg-success'; break;
        default: statusClass = 'bg-secondary';
      }
      
      // Format date for display
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Get attendance status badge class
      let attendanceClass = 'bg-secondary';
      switch(appointment.attendance_status) {
        case 'Present': attendanceClass = 'bg-success'; break;
        case 'Absent': attendanceClass = 'bg-danger'; break;
        case 'Late': attendanceClass = 'bg-warning'; break;
        default: attendanceClass = 'bg-secondary';
      }
      
      // Create HTML for the table row
      row.innerHTML = `
        <td>
          <div class="d-flex flex-column">
            <span class="fw-bold">${formattedDate}</span>
            <span class="text-muted">${appointment.time}</span>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div class="owner-avatar me-2" style="width: 40px; height: 40px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${appointment.owner_picture 
                ? `<img src="../uploads/profiles/${appointment.owner_picture}" alt="Owner Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                : `<i class="fas fa-user"></i>`
              }
            </div>
            <span>${appointment.client_name}</span>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div class="pet-avatar me-2" style="width: 40px; height: 40px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${appointment.pet_picture 
                ? `<img src="../uploads/pets_image/${appointment.pet_picture}" alt="Pet Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                : `<i class="fas fa-paw"></i>`
              }
            </div>
            <span>${appointment.pet_name} (${appointment.pet_type})</span>
          </div>
        </td>
        <td>${appointment.service_name || (typeof appointment.service === 'string' ? appointment.service : (appointment.service?.name || 'N/A'))}</td>
        <td><span class="badge ${statusClass}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
        <td><span class="badge ${attendanceClass}" data-id="${appointment.id}">${appointment.attendance_status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-icon view-appointment" data-id="${appointment.id}" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn btn-sm btn-icon cancel-appointment" data-id="${appointment.id}" title="Cancel"><i class="fas fa-times-circle"></i></button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addActionButtonListeners();
  }
  
  // Add event listeners to appointment action buttons
  function addActionButtonListeners() {
    // View appointment details
    document.querySelectorAll('.view-appointment').forEach(btn => {
      btn.addEventListener('click', function() {
        const appointmentId = this.getAttribute('data-id');
        fetchAndShowAppointmentDetails(appointmentId);
      });
    });
    
    // Cancel appointment
    document.querySelectorAll('.cancel-appointment').forEach(btn => {
      btn.addEventListener('click', function() {
        const appointmentId = this.getAttribute('data-id');
        const row = this.closest('tr');
        const clientName = row.querySelector('td:nth-child(2)').textContent;
        const petName = row.querySelector('td:nth-child(3) span').textContent.split(' ')[0];
        
        if (confirm(`Are you sure you want to cancel the appointment for ${clientName}'s ${petName}?`)) {
          cancelAppointment(appointmentId, row);
        }
      });
    });

    // Add the attendance dropdown listeners:

    // Attendance status dropdown options
    document.querySelectorAll('.attendance-option').forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        const appointmentId = this.getAttribute('data-id');
        const newStatus = this.getAttribute('data-status');
        const dropdownButton = this.closest('tr').querySelector('.attendance-dropdown');
        
        // Update the button appearance immediately for better UX
        dropdownButton.textContent = newStatus;
        
        // Update button class based on the new status
        dropdownButton.className = dropdownButton.className.replace(/bg-\w+/, ''); // Remove existing bg class
        const statusClass = newStatus === 'Present' ? 'bg-success' : 
                          newStatus === 'Absent' ? 'bg-danger' : 
                          newStatus === 'Late' ? 'bg-warning' : 'bg-secondary';
        dropdownButton.classList.add(statusClass);
        
        // Update in the backend
        updateAttendanceStatus(appointmentId, newStatus);
      });
    });
  }
  
  // Fetch appointment details from the API and show modal
  function fetchAndShowAppointmentDetails(appointmentId) {
    fetch(`../backends/clinic-appointments.php?action=details&appointment_id=${appointmentId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showAppointmentDetails(data.appointment);
        } else {
          throw new Error(data.error || 'Failed to load appointment details');
        }
      })
      .catch(error => {
        console.error('Error fetching appointment details:', error);
        showToast(`Error: ${error.message}`, 'error');
      });
  }
  
  // Load initial client appointments from the backend
  function loadInitialAppointments() {
    // Show loading indicator
    document.querySelector('#initial-view .table-responsive table tbody').innerHTML = 
      '<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i>Loading initial appointments...</td></tr>';
    
    // Get filter values
    const dateFilter = document.getElementById('filterDate').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const serviceFilter = document.getElementById('filterService').value;
    const searchValue = document.getElementById('searchClient').value;
    
    // Build API URL with filters
    let apiUrl = '../backends/clinic-appointments.php?action=initial_appointments';
    
    if (dateFilter) {
      apiUrl += `&date_from=${dateFilter}`;
    }
    
    if (statusFilter) {
      apiUrl += `&status=${statusFilter}`;
    }
    
    if (serviceFilter) {
      apiUrl += `&service=${serviceFilter}`;
    }
    
    if (searchValue) {
      apiUrl += `&search=${encodeURIComponent(searchValue)}`;
    }
    
    // Fetch initial appointments from the backend
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // Get the raw text first
      })
      .then(text => {
        try {
          return JSON.parse(text); // Then try to parse it as JSON
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          console.log('Raw response:', text);
          throw new Error('Invalid JSON response from server');
        }
      })
      .then(data => {
        if (data.success) {
          initialAppointments = data.appointments;
          displayInitialAppointments(initialAppointments);
        } else {
          throw new Error(data.error || 'Failed to load initial appointments');
        }
      })
      .catch(error => {
        console.error('Error fetching initial appointments:', error);
        document.querySelector('#initial-view .table-responsive table tbody').innerHTML = 
          `<tr><td colspan="6" class="text-center py-4"><div class="alert alert-danger m-3">Error loading initial appointments: ${error.message}</div></td></tr>`;
      });
  }
  
  // Display initial appointments in the list view
  function displayInitialAppointments(initialAppointmentsData) {
    const tableBody = document.querySelector('#initial-view table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (initialAppointmentsData.length === 0) {
      // Show no data message
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">No initial appointments found matching your criteria.</td>
        </tr>
      `;
      return;
    }
    
    // Add rows for each initial appointment
    initialAppointmentsData.forEach(appointment => {
      const row = document.createElement('tr');
      
      // Get the appropriate status badge class
      let statusClass = 'bg-secondary';
      switch(appointment.status) {
        case 'pending': statusClass = 'bg-warning'; break;
        case 'approved': statusClass = 'bg-success'; break;
        case 'rejected': statusClass = 'bg-danger'; break;
        case 'rescheduled': statusClass = 'bg-info'; break;
      }
      
      // Create HTML for the table row
      row.innerHTML = `
        <td>
          <div class="d-flex flex-column">
            <span class="fw-bold">${appointment.date}</span>
            <span class="text-muted">${appointment.time}</span>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div class="owner-avatar me-2" style="width: 40px; height: 40px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${appointment.owner_picture 
                ? `<img src="../uploads/profiles/${appointment.owner_picture}" alt="Owner Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                : `<i class="fas fa-user"></i>`
              }
            </div>
            <span>${appointment.client_name}</span>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div class="pet-avatar me-2" style="width: 40px; height: 40px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${appointment.pet_picture 
                ? `<img src="../uploads/pets_image/${appointment.pet_picture}" alt="Pet Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                : `<i class="fas fa-paw"></i>`
              }
            </div>
            <span>${appointment.pet_name} (${appointment.pet_type})</span>
          </div>
        </td>
        <td>${appointment.service_name || (typeof appointment.service === 'string' ? appointment.service : (appointment.service?.name || 'N/A'))}</td>
        <td><span class="badge ${statusClass}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-icon view-initial-appointment" data-id="${appointment.id}" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn btn-sm btn-icon reschedule-initial-appointment" data-id="${appointment.id}" title="Reschedule"><i class="fas fa-calendar-alt"></i></button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons for initial appointments
    addInitialAppointmentButtonListeners();
  }
  
  // Add event listeners to the initial appointment action buttons
  function addInitialAppointmentButtonListeners() {
    // View initial appointment details
    document.querySelectorAll('.view-initial-appointment').forEach(btn => {
      btn.addEventListener('click', function() {
        const appointmentId = this.getAttribute('data-id');
        fetchAndShowInitialAppointmentDetails(appointmentId);
      });
    });
    
    // Reschedule initial appointment
    document.querySelectorAll('.reschedule-initial-appointment').forEach(btn => {
      btn.addEventListener('click', function() {
        const appointmentId = this.getAttribute('data-id');
        fetchAndShowRescheduleForm(appointmentId);
      });
    });
  }
  
  // Fetch initial appointment details from the API and show modal
  function fetchAndShowInitialAppointmentDetails(appointmentId) {
    fetch(`../backends/clinic-appointments.php?action=initial_appointment_details&appointment_id=${appointmentId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showInitialAppointmentDetails(data.appointment);
        } else {
          throw new Error(data.error || 'Failed to load initial appointment details');
        }
      })
      .catch(error => {
        console.error('Error fetching initial appointment details:', error);
        showToast(`Error: ${error.message}`, 'error');
      });
  }
  
  // Function to show initial appointment details modal
  function showInitialAppointmentDetails(appointment) {
    // Create modal content
    const modalContent = `
      <div class="modal fade" id="initialAppointmentDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Initial Appointment Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="appointment-status-bar mb-4">
                <div class="badge bg-${appointment.status === 'pending' ? 'warning' : appointment.status === 'approved' ? 'success' : appointment.status === 'rejected' ? 'danger' : 'info'} p-2 fs-6 w-100 text-center">
                  ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h6 class="mb-0">Client Information</h6>
                    </div>
                    <div class="card-body">
                      <div class="d-flex mb-3">
                        <div class="owner-avatar me-3" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                          ${appointment.client?.picture 
                            ? `<img src="../uploads/profiles/${appointment.client.picture}" alt="Owner Picture" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<i class="fas fa-user fs-2"></i>`
                          }
                        </div>
                        <div>
                          <h6 class="mb-1">${appointment.client?.name || 'Not provided'}</h6>
                          <p class="text-muted mb-0">${appointment.client?.email || 'Email not provided'}</p>
                          <p class="text-muted mb-0">${appointment.client?.contact || 'Contact not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h6 class="mb-0">Pet Information</h6>
                    </div>
                    <div class="card-body">
                      <div class="d-flex mb-3">
                        <div class="pet-avatar me-3" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                          ${appointment.pet?.picture 
                            ? `<img src="../uploads/pets_image/${appointment.pet.picture}" alt="Pet Picture" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<i class="fas fa-paw fs-2"></i>`
                          }
                        </div>
                        <div>
                          <h6 class="mb-1">${appointment.pet.name}</h6>
                          <p class="text-muted mb-0">${appointment.pet.type} / ${appointment.pet.breed || 'Unknown breed'}</p>
                          <p class="text-muted mb-0">${appointment.pet.gender || 'Gender not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="mb-0">Appointment Details</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-12">
                      <p><strong>Date:</strong> ${appointment.date || 'Not specified'}</p>
                      <p><strong>Time:</strong> ${appointment.time || 'Not specified'}</p>
                      <p><strong>Service:</strong> ${appointment.service_name || (typeof appointment.service === 'string' ? appointment.service : (appointment.service?.name || 'General Consultation'))}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              ${appointment.form_data ? `
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="mb-0">Initial Form Data</h6>
                </div>
                <div class="card-body">
                  <pre class="form-data-json">${JSON.stringify(appointment.form_data, null, 2)}</pre>
                </div>
              </div>
              ` : ''}

              ${appointment.alternatives && appointment.alternatives.length > 0 ? `
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="mb-0">Suggested Alternative Times</h6>
                </div>
                <div class="card-body p-0">
                  <table class="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Clinic Message</th>
                        <th>Client Status</th>
                        <th>Client Feedback</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${appointment.alternatives.map(alt => {
                        // Determine button state based on client status or status
                        let buttonText = 'Select';
                        let buttonClass = 'btn-primary';
                        let isDisabled = false;
                        
                        if (alt.client_status === 'superseded' || alt.client_status === 'Superseded') {
                          buttonText = 'Superseded';
                          buttonClass = 'btn-secondary';
                          isDisabled = true;
                        } else if (alt.client_status === 'rejected' || alt.client_status === 'Rejected') {
                          buttonText = 'Rejected';
                          buttonClass = 'btn-danger';
                          isDisabled = true;
                        } else if (alt.status === 'cancelled' || alt.status === 'Cancelled') {
                          buttonText = 'Cancelled';
                          buttonClass = 'btn-secondary';
                          isDisabled = true;
                        } else if (alt.status === 'accepted' || alt.status === 'Accepted' || 
                                  alt.status === 'confirmed' || alt.status === 'Confirmed') {
                          buttonText = 'Confirmed';
                          buttonClass = 'btn-success';
                          isDisabled = true;
                        }
                        
                        return `
                        <tr>
                          <td>${alt.date}</td>
                          <td>${alt.time}</td>
                          <td>
                            <span class="badge bg-${
                              alt.status === 'accepted' ? 'success' : 
                              alt.status === 'rejected' ? 'danger' : 
                              alt.status === 'pending' ? 'warning' : 'info'
                            }">
                              ${alt.status}
                            </span>
                          </td>
                          <td>${alt.clinic_feedback || 'No message'}</td>
                          <td>
                            <span class="badge ${
                              alt.client_status === 'accepted' ? 'bg-success' : 
                              alt.client_status === 'rejected' ? 'bg-danger' : 
                              alt.client_status === 'pending' ? 'bg-warning' : 
                              alt.client_status === 'superseded' ? 'bg-secondary' : 'bg-secondary'
                            }">
                              ${alt.client_status || 'No response'}
                            </span>
                          </td>
                          <td>${alt.client_feedback || 'No feedback'}</td>
                          <td>
                            <button class="btn btn-sm ${buttonClass} select-suggestion-btn" 
                                    data-id="${alt.id}" 
                                    data-suggestion-id="${alt.id}"
                                    ${isDisabled ? 'disabled' : ''}>
                              ${buttonText}
                            </button>
                          </td>
                        </tr>
                      `}).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              ` : ''}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              ${appointment.status.toLowerCase() !== 'confirmed' ? `
              <button type="button" class="btn btn-info suggest-time-btn" data-id="${appointment.id}">
                <i class="fas fa-calendar-alt me-2"></i>Suggest Time & Date
              </button>
              <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" id="statusDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-tasks me-2"></i>Update Status
                </button>
                <ul class="dropdown-menu" aria-labelledby="statusDropdown">
                  <li><a class="dropdown-item update-status-btn" href="#" data-id="${appointment.id}" data-status="Form Started">Form Started</a></li>
                  <li><a class="dropdown-item update-status-btn" href="#" data-id="${appointment.id}" data-status="Awaiting Review">Awaiting Review</a></li>
                  <li><a class="dropdown-item update-status-btn" href="#" data-id="${appointment.id}" data-status="Verified">Verified</a></li>
                  <li><a class="dropdown-item update-status-btn" href="#" data-id="${appointment.id}" data-status="Rejected">Rejected</a></li>
                  <li><a class="dropdown-item update-status-btn" href="#" data-id="${appointment.id}" data-status="Migrated">Migrated</a></li>
                </ul>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the modal to the container
    const modalContainer = document.getElementById('appointment-details-modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = modalContent;
      
      // Initialize the modal
      const modalElement = document.getElementById('initialAppointmentDetailsModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Add event listeners for dropdown status options
        const statusButtons = modalElement.querySelectorAll('.update-status-btn');
        if (statusButtons && statusButtons.length > 0) {
          statusButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              const appointmentId = this.getAttribute('data-id');
              const newStatus = this.getAttribute('data-status');
              
              if (confirm(`Are you sure you want to change the appointment status to "${newStatus}"?`)) {
                modal.hide();
                updateInitialAppointmentStatus(appointmentId, newStatus);
              }
            });
          });
        }
        
        // Add event listener for suggest time button
        const suggestTimeBtn = modalElement.querySelector('.suggest-time-btn');
        if (suggestTimeBtn) {
          suggestTimeBtn.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            modal.hide();
            showSuggestTimeModal(appointmentId, appointment);
          });
        }

        // Add event listeners for select suggestion buttons
        const selectSuggestionBtns = modalElement.querySelectorAll('.select-suggestion-btn');
        if (selectSuggestionBtns.length > 0) {
          selectSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
              const suggestionId = this.getAttribute('data-suggestion-id');
              if (confirm('Would you like to select this suggested time?')) {
                modal.hide();
                confirmSuggestion(suggestionId);
              }
            });
          });
        }
      }
    }
  }
  
  // Update initial appointment status
  function updateInitialAppointmentStatus(appointmentId, newStatus) {
    // Show loading toast
    showToast(`Processing status change to ${newStatus}...`, 'info');
    
    // Make API call to update the status
    fetch(`../backends/clinic-appointments.php?action=update_initial_appointment_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        status: newStatus
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast(`Initial appointment status changed to ${newStatus} successfully`);
        
        // Reload the initial appointments to reflect the change
        loadInitialAppointments();
        
        // Also reload regular appointments if needed
        if (newStatus === 'Migrated' || newStatus === 'Verified') {
          loadAppointments();
        }
      } else {
        throw new Error(data.error || `Failed to update status to ${newStatus}`);
      }
    })
    .catch(error => {
      console.error(`Error updating appointment status to ${newStatus}:`, error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }
  
  // Fetch appointment details and show reschedule form
  function fetchAndShowRescheduleForm(appointmentId) {
    fetch(`../backends/clinic-appointments.php?action=details&appointment_id=${appointmentId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showRescheduleModal(data.appointment);
        } else {
          throw new Error(data.error || 'Failed to load appointment details');
        }
      })
      .catch(error => {
        console.error('Error fetching appointment details for reschedule:', error);
        showToast(`Error: ${error.message}`, 'error');
      });
  }
  
  // Show reschedule modal with form
  function showRescheduleModal(appointment) {
    // Fetch available time slots first
    fetch(`../backends/clinic-appointments.php?action=available_slots&date=${appointment.date}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (!data.success) {
          throw new Error(data.error || 'Failed to load available time slots');
        }
        
        // Create the modal content
        const modalContent = `
          <div class="modal fade" id="rescheduleModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Reschedule Appointment</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p>Rescheduling appointment for <strong>${appointment.client_name}</strong>'s <strong>${appointment.pet_name}</strong></p>
                  
                  <form id="rescheduleForm">
                    <input type="hidden" name="appointment_id" value="${appointment.id}">
                    
                    <div class="mb-3">
                      <label for="rescheduleDate" class="form-label">New Date</label>
                      <input type="date" class="form-control" id="rescheduleDate" name="new_date" min="${new Date().toISOString().split('T')[0]}" value="${appointment.date}">
                    </div>
                    
                    <div class="mb-3">
                      <label for="rescheduleTime" class="form-label">New Time</label>
                      <select class="form-select" id="rescheduleTime" name="new_time">
                        ${data.available_slots && data.available_slots.length > 0 ? 
                          data.available_slots.map(slot => `
                            <option value="${slot}" ${appointment.time === slot ? 'selected' : ''}>${slot}</option>
                          `).join('') : 
                          '<option value="" disabled selected>No available slots for this date</option>'
                        }
                      </select>
                    </div>
                    
                    <div class="mb-3">
                      <label for="rescheduleReason" class="form-label">Reason for Rescheduling</label>
                      <textarea class="form-control" id="rescheduleReason" name="reason" rows="3" placeholder="Please provide a reason for rescheduling..."></textarea>
                    </div>
                    
                    <div class="mb-3">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="notifyClient" name="notify_client" checked>
                        <label class="form-check-label" for="notifyClient">
                          Notify client about the change
                        </label>
                      </div>
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="button" class="btn btn-primary" id="submitReschedule">Reschedule</button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Add the modal to the container
        const modalContainer = document.getElementById('appointment-details-modal-container');
        if (modalContainer) {
          modalContainer.innerHTML = modalContent;
          
          // Initialize the modal
          const modalElement = document.getElementById('rescheduleModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Add event listener to the reschedule date for getting available times
            const dateInput = document.getElementById('rescheduleDate');
            if (dateInput) {
              dateInput.addEventListener('change', function() {
                const selectedDate = this.value;
                loadAvailableTimeSlots(selectedDate);
              });
            }
            
            // Add event listener to the submit button
            const submitBtn = document.getElementById('submitReschedule');
            if (submitBtn) {
              submitBtn.addEventListener('click', function() {
                const form = document.getElementById('rescheduleForm');
                if (form) {
                  const formData = new FormData(form);
                  rescheduleAppointment(formData, modal);
                }
              });
            }
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast(`Error: ${error.message}`, 'error');
      });
  }
  
  // Submit reschedule appointment request
  function rescheduleAppointment(formData, modal) {
    // Convert FormData to an object
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // Show loading indicator
    showToast('Processing reschedule request...', 'info');
    
    // Make API call to reschedule the appointment
    fetch('../backends/clinic-appointments.php?action=suggest_initial_appointment_time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appointment_id: data.appointment_id,
        date: data.new_date,
        time: data.new_time,
        message: data.reason || 'Rescheduled by clinic staff'
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        modal.hide();
        showToast('Appointment has been rescheduled successfully');
        
        // Reload appointments to reflect the change
        loadAppointments();
        
        // Also reload initial appointments if they're being displayed
        if (document.getElementById('initial-view').classList.contains('active')) {
          loadInitialAppointments();
        }
      } else {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }
    })
    .catch(error => {
      console.error('Error rescheduling appointment:', error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }
  
  // Helper function to get status CSS class
  function getStatusClass(status) {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'confirmed';
      case 'scheduled': return 'scheduled';
      case 'completed': return 'primary';
      case 'cancelled': return 'cancelled';
      case 'verified': return 'success';
      default: return 'secondary';
    }
  }
  
  // Helper function to get attendance status CSS class
  function getAttendanceStatusClass(status) {
    switch(status) {
      case 'Present': return 'success';
      case 'Absent': return 'danger';
      case 'Late': return 'warning';
      default: return 'secondary';
    }
  }
  
  // Function to show appointment details modal
  function showAppointmentDetails(appointment) {
    // Create modal content
    const modalContent = `
      <div class="modal fade" id="appointmentDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Appointment Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="appointment-status-bar mb-4">
                <div class="badge bg-${getStatusClass(appointment.status)} p-2 fs-6 w-100 text-center">
                  ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h6 class="mb-0">Client Information</h6>
                    </div>
                    <div class="card-body">
                      <div class="d-flex mb-3">
                        <div class="owner-avatar me-3" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                          ${appointment.client?.picture 
                            ? `<img src="../uploads/profiles/${appointment.client.picture}" alt="Owner Picture" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<i class="fas fa-user fs-2"></i>`
                          }
                        </div>
                        <div>
                          <h6 class="mb-1">${appointment.client?.name || 'Not provided'}</h6>
                          <p class="text-muted mb-0">${appointment.client?.email || 'Email not provided'}</p>
                          <p class="text-muted mb-0">${appointment.client?.contact || 'Contact not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h6 class="mb-0">Pet Information</h6>
                    </div>
                    <div class="card-body">
                      <div class="d-flex mb-3">
                        <div class="pet-avatar me-3" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                          ${appointment.pet?.picture 
                            ? `<img src="../uploads/pets_image/${appointment.pet.picture}" alt="Pet Picture" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<i class="fas fa-paw fs-2"></i>`
                          }
                        </div>
                        <div>
                          <h6 class="mb-1">${appointment.pet.name}</h6>
                          <p class="text-muted mb-0">${appointment.pet.type} / ${appointment.pet.breed || 'Unknown breed'}</p>
                          <p class="text-muted mb-0">${appointment.pet.gender || 'Gender not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="mb-0">Appointment Details</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-12">
                      <p><strong>Date:</strong> ${appointment.date || 'Not specified'}</p>
                      <p><strong>Time:</strong> ${appointment.time || 'Not specified'}</p>
                      <p><strong>Service:</strong> ${appointment.service_name || (typeof appointment.service === 'string' ? appointment.service : (appointment.service?.name || 'General Consultation'))}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              ${appointment.price && typeof appointment.price === 'number' ? 
                `<p><strong>Price:</strong> ₱${appointment.price.toFixed(2)}</p>` : ''}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              
              <div class="dropdown me-2">
                <button class="btn btn-sm dropdown-toggle bg-${getAttendanceStatusClass(appointment.attendance_status)}" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false">
                  <i class="fas fa-user-check me-1"></i> ${appointment.attendance_status}
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item modal-attendance-option" href="#" data-id="${appointment.id}" data-status="Present">Present</a></li>
                  <li><a class="dropdown-item modal-attendance-option" href="#" data-id="${appointment.id}" data-status="Absent">Absent</a></li>
                  <li><a class="dropdown-item modal-attendance-option" href="#" data-id="${appointment.id}" data-status="Late">Late</a></li>
                  <li><a class="dropdown-item modal-attendance-option" href="#" data-id="${appointment.id}" data-status="Not Recorded">Not Recorded</a></li>
                </ul>
              </div>
              
              ${appointment.status !== 'cancelled' ? `
                <button type="button" class="btn btn-danger cancel-appointment-btn" data-id="${appointment.id}">
                  <i class="fas fa-times-circle me-2"></i>Cancel Appointment
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the modal to the container
    const modalContainer = document.getElementById('appointment-details-modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = modalContent;
      
      // Initialize the modal
      const modalElement = document.getElementById('appointmentDetailsModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Add event listeners to action buttons
        const cancelBtn = modalElement.querySelector('.cancel-appointment-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            if (confirm(`Are you sure you want to cancel this appointment for ${appointment.client.name}'s ${appointment.pet.name}?`)) {
              modal.hide();
              // Create a dummy row for the cancel function
              const dummyRow = document.createElement('div');
              dummyRow.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><span class="badge"></span></td>
                <td><div class="action-buttons"><button class="btn btn-sm btn-icon cancel-appointment"></button></div></td>
              `;
              cancelAppointment(appointmentId, dummyRow);
              
              // Reload appointments after a short delay
              setTimeout(() => {
                loadAppointments();
              }, 1000);
            }
          });
        }
        
        // Add attendance button listeners
        addAttendanceButtonListeners(modalElement, appointment.id);
      }
    }
  }
  
  // Add event listeners to attendance buttons
  function addAttendanceButtonListeners(modalElement, appointmentId) {
    // Get all attendance dropdown options in the modal
    const attendanceOptions = modalElement.querySelectorAll('.modal-attendance-option');
    attendanceOptions.forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        const appointmentId = this.getAttribute('data-id');
        const newStatus = this.getAttribute('data-status');
        
        // Find the dropdown button to update its text and appearance
        const dropdownButton = modalElement.querySelector('.dropdown-toggle');
        if (dropdownButton) {
          // Update the button text
          dropdownButton.textContent = newStatus;
          
          // Update button class based on new status
          dropdownButton.className = dropdownButton.className.replace(/bg-\w+/, ''); // Remove existing bg class
          const statusClass = newStatus === 'Present' ? 'bg-success' : 
                            newStatus === 'Absent' ? 'bg-danger' : 
                            newStatus === 'Late' ? 'bg-warning' : 'bg-secondary';
          dropdownButton.classList.add(statusClass);
        }
        
        // Send update to the backend
        updateAttendanceStatus(appointmentId, newStatus);
      });
    });
  }
  
  // Function to update attendance status in the backend
  function updateAttendanceStatus(appointmentId, status) {
    fetch('../backends/clinic-appointments.php?action=update_attendance_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        attendance_status: status
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast(`Attendance updated to "${status}"`);
        
        // Update the appointment in the local data
        const appointmentIndex = appointments.findIndex(a => a.id == appointmentId);
        if (appointmentIndex !== -1) {
          appointments[appointmentIndex].attendance_status = status;
          
          // If we're in list view, update the dropdown button there
          const listViewRow = document.querySelector(`#list-view tr:has([data-id="${appointmentId}"])`);
          if (listViewRow) {
            // Look for either a badge (old style) or dropdown button (new style)
            const attendanceDropdown = listViewRow.querySelector('.attendance-dropdown');
            if (attendanceDropdown) {
              // Update the dropdown button
              attendanceDropdown.textContent = status;
              
              // Update the button class
              attendanceDropdown.className = attendanceDropdown.className.replace(/bg-\w+/, '');
              const statusClass = `bg-${getAttendanceStatusClass(status)}`;
              attendanceDropdown.classList.add(statusClass);
            } else {
              // If no dropdown, try to find the badge (for backward compatibility)
              const attendanceBadge = listViewRow.querySelector('td:nth-child(6) .badge');
              if (attendanceBadge) {
                attendanceBadge.className = `badge bg-${getAttendanceStatusClass(status)}`;
                attendanceBadge.textContent = status;
              }
            }
          }
        }
      } else {
        throw new Error(data.error || 'Failed to update attendance status');
      }
    })
    .catch(error => {
      console.error('Error updating attendance status:', error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }
  
  // Fetch appointment details and show edit form (removed)
  function fetchAndShowEditForm(appointmentId) {
    // Function removed
    console.log('Edit functionality has been disabled');
  }
  
  // Show edit modal for appointment (removed)
  function showEditModal(appointment) {
    // Function removed
    console.log('Edit modal has been disabled');
  }
  
  // Function to load services for dropdown (removed)
  function loadServices() {
    // Function removed
    console.log('Loading services has been disabled');
  }
  
  // Function to update appointment (removed)
  function updateAppointment(appointmentData, modal) {
    // Function removed
    console.log('Updating appointments has been disabled');
  }
  
  // Cancel an appointment
  function cancelAppointment(appointmentId, row) {
    // Show loading or disable the button
    const cancelBtn = row.querySelector('.cancel-appointment');
    if (cancelBtn) cancelBtn.disabled = true;
    
    // Make API call to cancel the appointment
    fetch(`../backends/clinic-appointments.php?action=cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        reason: 'Cancelled by clinic staff'
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Update the UI
        const badge = row.querySelector('.badge');
        if (badge) {
          badge.className = 'badge bg-cancelled';
          badge.textContent = 'Cancelled';
        }
        
        // Show success message
        showToast('Appointment has been cancelled successfully');
        
        // Also refresh the calendar if it's visible
        if (document.getElementById('calendar-view').classList.contains('active')) {
          renderCalendar(currentCalendarDate);
        }
        
        // Update the appointment in local data
        const appointmentIndex = appointments.findIndex(a => a.id == appointmentId);
        if (appointmentIndex !== -1) {
          appointments[appointmentIndex].status = 'cancelled';
        }
      } else {
        throw new Error(data.error || 'Failed to cancel appointment');
      }
    })
    .catch(error => {
      console.error('Error cancelling appointment:', error);
      showToast(`Error: ${error.message}`, 'error');
    })
    .finally(() => {
      if (cancelBtn) cancelBtn.disabled = false;
    });
  }

  // Filter functionality
  const filterStatus = document.getElementById('filterStatus');
  const filterService = document.getElementById('filterService');
  const searchClient = document.getElementById('searchClient');
  const filterDate = document.getElementById('filterDate');
  
  // Add event listeners to filters
  [filterStatus, filterService, filterDate].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', function() {
        loadAppointments();
        
        // If initial appointments tab is active, reload those too
        if (document.getElementById('initial-view') && 
            document.getElementById('initial-view').classList.contains('active')) {
          loadInitialAppointments();
        }
      });
    }
  });
  
  // Add debounce to search to avoid too many requests
  let searchTimeout;
  searchClient.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadAppointments();
      
      // If initial appointments tab is active, reload those too
      if (document.getElementById('initial-view') && 
          document.getElementById('initial-view').classList.contains('active')) {
        loadInitialAppointments();
      }
    }, 500);
  });
  
  // Helper to convert 12-hour time to 24-hour format with seconds
  function to24Hour(time12h) {
    if (!time12h) return '00:00:00';
    time12h = time12h.trim();
    // If already in 24-hour format
    if (/^\\d{2}:\\d{2}:\\d{2}$/.test(time12h)) return time12h;
    // If in 24-hour format without seconds
    if (/^\\d{2}:\\d{2}$/.test(time12h)) return time12h + ':00';
    // If in 12-hour format
    const [time, modifier] = time12h.split(' ');
    if (!time || !modifier) return '00:00:00';
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  }
  
  // Add event listeners for client status and feedback changes
  document.querySelectorAll('.client-status-select').forEach(select => {
    select.addEventListener('change', function() {
      const suggestionId = this.dataset.suggestionId;
      const newStatus = this.value;
      updateClientStatus(suggestionId, newStatus);
    });
  });

  document.querySelectorAll('.client-feedback').forEach(textarea => {
    textarea.addEventListener('change', function() {
      const suggestionId = this.dataset.suggestionId;
      const newFeedback = this.value;
      updateClientFeedback(suggestionId, newFeedback);
    });
  });

  function updateClientStatus(suggestionId, status) {
    fetch('../backends/clinic-appointments.php?action=update_client_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggestion_id: suggestionId,
        client_status: status
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showToast('Client status updated successfully');
      } else {
        showToast(`Error: ${data.error || 'Failed to update client status'}`, 'error');
      }
    })
    .catch(error => {
      showToast(`Error: ${error.message}`, 'error');
    });
  }

  function updateClientFeedback(suggestionId, feedback) {
    fetch('../backends/clinic-appointments.php?action=update_client_feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggestion_id: suggestionId,
        client_feedback: feedback
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showToast('Client feedback updated successfully');
      } else {
        showToast(`Error: ${data.error || 'Failed to update client feedback'}`, 'error');
      }
    })
    .catch(error => {
      showToast(`Error: ${error.message}`, 'error');
    });
  }
  
  // The rest of the existing code for modals, calendar, etc.
  // ... existing code ...

  function renderCalendar(date) {
    const calendarContainer = document.getElementById('appointmentCalendar');
    if (!calendarContainer) return;

    // Get the first day of the month and the last day
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayIndex = firstDay.getDay();
    
    // Get the total number of days in the month
    const totalDays = lastDay.getDate();
    
    // Create calendar header with month navigation
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    let calendarHTML = `
      <div class="calendar-header d-flex justify-content-between align-items-center">
        <button class="btn prev-month">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h4 class="calendar-month-title mb-0">${monthNames[date.getMonth()]} ${date.getFullYear()}</h4>
        <button class="btn next-month">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-days-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div class="calendar-days">
          <!-- Calendar days will be inserted here -->
        </div>
      </div>
    `;

    // Render the HTML to the container
    calendarContainer.innerHTML = calendarHTML;

    // Add event listeners to the previous and next month buttons
    calendarContainer.querySelector('.prev-month').addEventListener('click', () => {
      currentCalendarDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      renderCalendar(currentCalendarDate);
    });

    calendarContainer.querySelector('.next-month').addEventListener('click', () => {
      currentCalendarDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      renderCalendar(currentCalendarDate);
    });

    // Fetch unavailable times for this month
    fetchUnavailableTimes(date, firstDay, lastDay, () => {
      // Populate the calendar with days after fetching unavailable times
      populateCalendarDays(date, firstDayIndex, totalDays);
    });
  }

  // Add function to fetch unavailable times for a specific month
  function fetchUnavailableTimes(date, firstDay, lastDay, callback) {
    // Format dates for API
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];
    
    // Make API call to get unavailable times
    fetch(`../backends/clinic-appointments.php?action=unavailable&date_from=${startDate}&date_to=${endDate}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Store unavailable times globally
          unavailableTimes = data.unavailableTimes || [];
          
          // Continue with callback function (populate calendar)
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          throw new Error(data.error || 'Failed to load unavailable times');
        }
      })
      .catch(error => {
        console.error('Error fetching unavailable times:', error);
        // Continue with callback anyway so calendar renders
        if (typeof callback === 'function') {
          callback();
        }
      });
  }

  // Helper function to populate calendar days
  function populateCalendarDays(date, firstDayIndex, totalDays) {
    const calendarDays = document.querySelector('.calendar-days');
    if (!calendarDays) return;

    let days = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days += '<div class="empty"></div>';
    }
    
    // Get current date to highlight current day
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      // Check if this day has appointments
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
      const dateString = formatDateForComparison(currentDate);
      const dayAppointments = appointments.filter(apt => apt.date === dateString);
      
      const hasAppointments = dayAppointments.length > 0;
      const appointmentCount = dayAppointments.length;
      
      // Check if this day has unavailable times
      const hasUnavailableTimes = isDateUnavailable(dateString);
      
      // Check if this is the current day
      const isCurrentDay = (i === currentDay && 
                           date.getMonth() === currentMonth &&
                           date.getFullYear() === currentYear);

      days += `
        <div class="day ${hasAppointments ? 'has-appointments' : ''} ${hasUnavailableTimes ? 'has-unavailable' : ''} ${isCurrentDay ? 'current-day' : ''}" data-date="${dateString}">
          <div class="day-number">${i}</div>
          ${hasUnavailableTimes ? `
            <div class="unavailable-indicator">
              <i class="fas fa-ban"></i>
            </div>` : ''
          }
          ${hasAppointments ? `
            <div class="appointment-indicator" title="${appointmentCount} appointment(s)">
              <span class="badge">${appointmentCount}</span>
            </div>` : ''
          }
        </div>
      `;
    }
    
    calendarDays.innerHTML = days;
    
    // Add click event to days with appointments
    document.querySelectorAll('.day.has-appointments').forEach(day => {
      day.addEventListener('click', function() {
        const dateString = this.getAttribute('data-date');
        showDayAppointments(dateString);
      });
    });
    
    // Add click event to days with unavailable times
    document.querySelectorAll('.day.has-unavailable').forEach(day => {
      day.addEventListener('click', function() {
        const dateString = this.getAttribute('data-date');
        showDayUnavailableTimes(dateString);
      });
    });
  }
  
  // Function to check if a date has unavailable times
  function isDateUnavailable(dateString) {
    if (!unavailableTimes || unavailableTimes.length === 0) return false;
    
    // Convert the dateString to a Date object at the start of the day
    const checkDate = new Date(dateString + 'T00:00:00');
    
    // Check each unavailable time to see if it overlaps with the given date
    return unavailableTimes.some(unavailable => {
      const unavailableDate = unavailable.date;
      return unavailableDate === dateString;
    });
  }
  
  // Function to show unavailable times for a specific day
  function showDayUnavailableTimes(dateString) {
    // Filter unavailable times for this date
    const dayUnavailableTimes = unavailableTimes.filter(time => time.date === dateString);
    
    if (dayUnavailableTimes.length === 0) return;
    
    // Format the date for display
    const displayDate = new Date(dateString);
    const formattedDate = displayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Create modal content
    let modalContent = `
      <div class="modal fade" id="dayUnavailableTimesModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Unavailable Times - ${formattedDate}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="list-group">
    `;
    
    // Add each unavailable time block
    dayUnavailableTimes.forEach(time => {
      const startTime = formatTimeForDisplay(time.startTime);
      const endTime = formatTimeForDisplay(time.endTime);
      
      modalContent += `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">${time.title}</h6>
              <p class="mb-1 text-muted">
                <i class="far fa-clock me-1"></i> ${startTime} - ${endTime}
              </p>
              ${time.notes ? `<small>${time.notes}</small>` : ''}
            </div>
            <div>
              ${time.isRecurring ? '<span class="badge bg-info">Recurring</span>' : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    modalContent += `
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the modal to the container
    const modalContainer = document.getElementById('appointment-details-modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = modalContent;
      
      // Initialize and show the modal
      const modalElement = document.getElementById('dayUnavailableTimesModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }
  
  // Helper function to format date for comparison
  function formatDateForComparison(date) {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  
  // Helper function to show appointments for a specific day
  function showDayAppointments(dateString) {
    const dayAppointments = appointments.filter(apt => apt.date === dateString);
    if (dayAppointments.length === 0) return;
    
    // Format the date for display
    const displayDate = new Date(dateString);
    const formattedDate = displayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Helper function to show toast notifications
  function showToast(message, type = 'success') {
    // Check if the toast container exists, if not create it
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create a unique ID for the toast
    const toastId = `toast-${Date.now()}`;
    
    // Get the appropriate Bootstrap color class based on type
    let bgClass = 'bg-success';
    switch(type) {
      case 'error': bgClass = 'bg-danger'; break;
      case 'warning': bgClass = 'bg-warning'; break;
      case 'info': bgClass = 'bg-info'; break;
      default: bgClass = 'bg-success';
    }
    
    // Create the toast HTML
    const toastHTML = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${bgClass} text-white">
          <strong class="me-auto">Notification</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    // Add the toast to the container
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: 5000
    });
    toast.show();
    
    // Remove the toast from the DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
  }

  // Load available time slots for a selected date
  function loadAvailableTimeSlots(date) {
    fetch(`../backends/clinic-appointments.php?action=available_slots&date=${date}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          const timeSelect = document.getElementById('rescheduleTime');
          if (timeSelect) {
            // Clear existing options
            timeSelect.innerHTML = '';
            
            // Check if we have slots
            if (data.available_slots && data.available_slots.length > 0) {
              // Add new options
              data.available_slots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timeSelect.appendChild(option);
              });
            } else {
              // If no slots are available, add a placeholder option
              const option = document.createElement('option');
              option.value = '';
              option.textContent = 'No available slots for this date';
              option.disabled = true;
              option.selected = true;
              timeSelect.appendChild(option);
            }
          }
        } else {
          throw new Error(data.error || 'Failed to load available time slots');
        }
      })
      .catch(error => {
        console.error('Error loading available time slots:', error);
        showToast(`Error: ${error.message}`, 'error');
      });
  }

  // Show modal for suggesting a new appointment time
  function showSuggestTimeModal(appointmentId, appointment) {
    // Get tomorrow's date as the minimum date for the suggestion
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    // Create the modal content
    const modalContent = `
      <div class="modal fade" id="suggestTimeModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Suggest New Appointment Time</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Suggest a new appointment time for <strong>${appointment.client?.name || 'client'}</strong>'s <strong>${appointment.pet?.name || 'pet'}</strong></p>
              
              <div class="alert alert-info mb-3">
                <div><strong>Initial Appointment:</strong></div>
                <div>Date: ${appointment.date || 'Not specified'}</div>
                <div>Time: ${appointment.time || 'Not specified'}</div>
              </div>
              
              <form id="suggestTimeForm">
                <input type="hidden" name="appointment_id" value="${appointmentId}">
                
                <div class="mb-3">
                  <label for="suggestedDate" class="form-label">Suggested Date</label>
                  <input type="date" class="form-control" id="suggestedDate" name="suggested_date" min="${minDate}" required>
                </div>
                
                <div class="mb-3">
                  <label for="suggestedTime" class="form-label">Suggested Time</label>
                  <select class="form-select" id="suggestedTime" name="suggested_time" required>
                    <option value="" disabled selected>Select a time slot</option>
                    ${generateTimeOptions()}
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="suggestionMessage" class="form-label">Message (Optional)</label>
                  <textarea class="form-control" id="suggestionMessage" name="message" rows="3" 
                    placeholder="Add a message explaining the reason for suggesting a new time..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="submitSuggestion">Send Suggestion</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the modal to the container
    const modalContainer = document.getElementById('appointment-details-modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = modalContent;
      
      // Initialize the modal
      const modalElement = document.getElementById('suggestTimeModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Add event listener to the suggestedDate field to load available times
        const dateInput = document.getElementById('suggestedDate');
        if (dateInput) {
          dateInput.addEventListener('change', function() {
            loadAvailableTimesForSuggestion(this.value);
          });
        }
        
        // Add event listener to the submit button
        const submitBtn = document.getElementById('submitSuggestion');
        if (submitBtn) {
          submitBtn.addEventListener('click', function() {
            const form = document.getElementById('suggestTimeForm');
            if (form.checkValidity()) {
              const suggestedDate = document.getElementById('suggestedDate').value;
              const suggestedTime = document.getElementById('suggestedTime').value;
              const message = document.getElementById('suggestionMessage').value;
              
              submitTimeSuggestion(appointmentId, suggestedDate, suggestedTime, message, modal);
            } else {
              form.reportValidity();
            }
          });
        }
      }
    }
  }
  
  // Generate time options for the select dropdown
  function generateTimeOptions() {
    // Create time slots from 8 AM to 6 PM
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? 'AM' : 'PM';
      
      // Add on the hour
      timeSlots.push(`${hourFormatted}:00 ${period}`);
      
      // Add half past the hour
      if (hour < 18) {
        timeSlots.push(`${hourFormatted}:30 ${period}`);
      }
    }
    
    return timeSlots.map(time => `<option value="${time}">${time}</option>`).join('');
  }
  
  // Load available times for the selected date
  function loadAvailableTimesForSuggestion(selectedDate) {
    // Here you would fetch available times from the server
    // For now, we'll just update the time dropdown with the default options
    const timeSelect = document.getElementById('suggestedTime');
    if (timeSelect) {
      timeSelect.innerHTML = '<option value="" disabled>Select a time slot</option>' + generateTimeOptions();
    }
  }
  
  // Submit the time suggestion to the server
  function submitTimeSuggestion(appointmentId, date, time, message, modal) {
    // Show loading toast
    showToast('Sending suggestion...', 'info');
    
    // Convert 12-hour format to 24-hour format for the server
    const timeParts = time.match(/(\d+):(\d+) (\w+)/);
    let hours = parseInt(timeParts[1]);
    const minutes = timeParts[2];
    const period = timeParts[3];
    
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    
    // Make API call to suggest a new time
    fetch(`../backends/clinic-appointments.php?action=suggest_initial_appointment_time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        date: date,
        time: timeFormatted,
        message: message
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        modal.hide();
        showToast('Time suggestion sent successfully');
        
        // Reload initial appointments to reflect the change
        loadInitialAppointments();
      } else {
        throw new Error(data.error || 'Failed to send time suggestion');
      }
    })
    .catch(error => {
      console.error('Error sending time suggestion:', error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }

  // Confirm a suggested time
  function confirmSuggestion(suggestionId) {
    // Show loading toast
    showToast('Processing selection...', 'info');
    
    // Make API call to confirm the suggestion
    fetch(`../backends/clinic-appointments.php?action=confirm_accepted_suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        suggestion_id: suggestionId
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast('Suggestion confirmed successfully');
        
        // Reload the initial appointments to reflect the change
        loadInitialAppointments();
        
        // Also reload regular appointments as the accepted suggestion might now appear there
        loadAppointments();
      } else {
        throw new Error(data.error || 'Failed to confirm suggestion');
      }
    })
    .catch(error => {
      console.error('Error confirming suggestion:', error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }

  // Add this function after the loadAppointments function

  // Function to show the unavailable times modal and load data
  function showUnavailableTimesModal() {
    // First fetch existing unavailable times
    fetch(`../backends/clinic-appointments.php?action=unavailable`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Store the fetched unavailable times
          unavailableTimes = data.unavailableTimes || [];
          
          // Display the unavailable times in the table
          displayUnavailableTimes(unavailableTimes);
          
          // Show the modal
          const unavailableTimesModal = new bootstrap.Modal(document.getElementById('unavailableTimesModal'));
          unavailableTimesModal.show();
          
          // Setup event listeners
          setupUnavailableTimeEventListeners();
        } else {
          throw new Error(data.error || 'Failed to load unavailable times');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast(`Error loading unavailable times: ${error.message}`, 'error');
      });
  }
  
  // Function to display unavailable times in the table
  function displayUnavailableTimes(unavailableTimes) {
    const tableBody = document.querySelector('#unavailableTimesTable tbody');
    if (!tableBody) return;
    
    // Clear the loading row
    tableBody.innerHTML = '';
    
    if (unavailableTimes.length === 0) {
      // Show a "no data" message
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="text-muted">
              <i class="fas fa-calendar-times fa-2x mb-3"></i>
              <p>No unavailable times have been set.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    // Sort unavailable times by date
    unavailableTimes.sort((a, b) => {
      return new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime);
    });
    
    // Add rows for each unavailable time
    unavailableTimes.forEach(time => {
      const row = document.createElement('tr');
      
      // Format the date for display
      const dateObj = new Date(time.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Create the time range display
      const timeRange = `${formatTimeDisplay(time.startTime)} - ${formatTimeDisplay(time.endTime)}`;
      
      row.innerHTML = `
        <td>
          <strong>${time.title}</strong>
          ${time.notes ? `<div class="small text-muted">${time.notes}</div>` : ''}
        </td>
        <td>${formattedDate}</td>
        <td>${timeRange}</td>
        <td>
          ${time.isRecurring ? 
            `<span class="badge bg-info">
              <i class="fas fa-sync-alt me-1"></i>
              ${time.recurringPattern.charAt(0).toUpperCase() + time.recurringPattern.slice(1)}
              ${time.recurUntil ? ` until ${new Date(time.recurUntil).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}` : ''}
            </span>` 
            : 
            '<span class="badge bg-secondary">One-time</span>'
          }
        </td>
        <td>
          <div class="d-flex unavailable-actions">
            <button class="btn btn-sm btn-icon edit-unavailable" data-id="${time.id}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-icon delete-unavailable delete-time" data-id="${time.id}" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  // Helper function to format time for display (convert from 24h to 12h format)
  function formatTimeDisplay(time24h) {
    const [hours, minutes] = time24h.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours, 10);
    
    if (hours12 >= 12) {
      period = 'PM';
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    
    if (hours12 === 0) {
      hours12 = 12;
    }
    
    return `${hours12}:${minutes} ${period}`;
  }
  
  // Setup event listeners for the unavailable times modal
  function setupUnavailableTimeEventListeners() {
    // Event listener for the recurring checkbox
    const isRecurringCheckbox = document.getElementById('isRecurring');
    const recurringOptions = document.getElementById('recurringOptions');
    
    if (isRecurringCheckbox && recurringOptions) {
      isRecurringCheckbox.addEventListener('change', function() {
        recurringOptions.style.display = this.checked ? 'block' : 'none';
        
        // Disable multiple days selection if recurring is checked
        if (this.checked) {
          const enableMultipleDaysCheckbox = document.getElementById('enableMultipleDays');
          if (enableMultipleDaysCheckbox && enableMultipleDaysCheckbox.checked) {
            enableMultipleDaysCheckbox.checked = false;
            document.getElementById('multipleDaysSection').style.display = 'none';
            document.getElementById('unavailableDate').disabled = false;
          }
        }
      });
    }
    
    // Event listener for the multiple days checkbox
    const enableMultipleDaysCheckbox = document.getElementById('enableMultipleDays');
    const multipleDaysSection = document.getElementById('multipleDaysSection');
    const singleDateInput = document.getElementById('unavailableDate');
    
    if (enableMultipleDaysCheckbox && multipleDaysSection) {
      enableMultipleDaysCheckbox.addEventListener('change', function() {
        multipleDaysSection.style.display = this.checked ? 'block' : 'none';
        
        // Disable/enable the single date input
        if (singleDateInput) {
          singleDateInput.disabled = this.checked;
        }
        
        // Disable recurring if multiple days is checked
        if (this.checked && isRecurringCheckbox) {
          isRecurringCheckbox.checked = false;
          recurringOptions.style.display = 'none';
        }
        
        // Initialize multiple days inputs with today's date
        if (this.checked) {
          const today = new Date().toISOString().split('T')[0];
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          document.getElementById('multipleStartDate').value = today;
          document.getElementById('multipleEndDate').value = nextWeek.toISOString().split('T')[0];
          
          updateMultipleDaysPreview();
        }
      });
    }
    
    // Event listeners for multiple days inputs
    const multipleStartDate = document.getElementById('multipleStartDate');
    const multipleEndDate = document.getElementById('multipleEndDate');
    const dayCheckboxes = document.querySelectorAll('.day-checkbox');
    
    if (multipleStartDate && multipleEndDate) {
      multipleStartDate.addEventListener('change', updateMultipleDaysPreview);
      multipleEndDate.addEventListener('change', updateMultipleDaysPreview);
      
      dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateMultipleDaysPreview);
      });
    }
    
    // Event listener for the block entire day checkbox
    const blockEntireDayCheckbox = document.getElementById('blockEntireDay');
    const timeSelectSection = document.getElementById('timeSelectSection');
    const startTimeInput = document.getElementById('unavailableStartTime');
    const endTimeInput = document.getElementById('unavailableEndTime');
    
    if (blockEntireDayCheckbox) {
      blockEntireDayCheckbox.addEventListener('change', function() {
        if (this.checked) {
          // Set times to full day
          startTimeInput.value = '00:00';
          endTimeInput.value = '23:59';
          timeSelectSection.style.opacity = '0.5';
          startTimeInput.disabled = true;
          endTimeInput.disabled = true;
        } else {
          // Enable time selection
          timeSelectSection.style.opacity = '1';
          startTimeInput.disabled = false;
          endTimeInput.disabled = false;
        }
        updatePreview();
      });
    }
    
    // Event listeners for time preset buttons
    document.querySelectorAll('.time-preset').forEach(btn => {
      btn.addEventListener('click', function() {
        const startTime = this.getAttribute('data-start');
        const endTime = this.getAttribute('data-end');
        
        if (startTimeInput && endTimeInput) {
          startTimeInput.value = startTime;
          endTimeInput.value = endTime;
          
          // Uncheck the block entire day checkbox
          if (blockEntireDayCheckbox) {
            blockEntireDayCheckbox.checked = false;
            timeSelectSection.style.opacity = '1';
            startTimeInput.disabled = false;
            endTimeInput.disabled = false;
          }
          
          updatePreview();
        }
      });
    });
    
    // Event listeners for date and time changes to update preview
    const dateInput = document.getElementById('unavailableDate');
    const titleInput = document.getElementById('unavailableTitle');
    
    [dateInput, startTimeInput, endTimeInput, titleInput].forEach(input => {
      if (input) {
        input.addEventListener('change', updatePreview);
        input.addEventListener('input', updatePreview);
      }
    });
    
    // Update preview on page load
    updatePreview();
    
    // Event listener for the add unavailable time form
    const addUnavailableTimeForm = document.getElementById('addUnavailableTimeForm');
    if (addUnavailableTimeForm) {
      addUnavailableTimeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (enableMultipleDaysCheckbox && enableMultipleDaysCheckbox.checked) {
          addMultipleDaysUnavailableTimes();
        } else {
          addUnavailableTime();
        }
      });
    }
    
    // Event listeners for edit and delete buttons
    document.querySelectorAll('.edit-unavailable').forEach(btn => {
      btn.addEventListener('click', function() {
        const timeId = this.getAttribute('data-id');
        editUnavailableTime(timeId);
      });
    });
    
    document.querySelectorAll('.delete-unavailable').forEach(btn => {
      btn.addEventListener('click', function() {
        const timeId = this.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this unavailable time slot?')) {
          deleteUnavailableTime(timeId);
        }
      });
    });
  }

  // Add this after the updatePreview function

  // Function to update the multiple days preview
  function updateMultipleDaysPreview() {
    const previewContainer = document.getElementById('multipleDaysPreview');
    if (!previewContainer) return;
    
    const startDate = document.getElementById('multipleStartDate').value;
    const endDate = document.getElementById('multipleEndDate').value;
    
    if (!startDate || !endDate) {
      previewContainer.innerHTML = 'Please select both start and end dates.';
      return;
    }
    
    // Check that end date is after start date
    if (new Date(endDate) < new Date(startDate)) {
      previewContainer.innerHTML = '<span class="text-danger">End date must be after start date.</span>';
      return;
    }
    
    // Get selected days
    const selectedDays = [];
    document.querySelectorAll('.day-checkbox:checked').forEach(checkbox => {
      selectedDays.push(parseInt(checkbox.value));
    });
    
    if (selectedDays.length === 0) {
      previewContainer.innerHTML = '<span class="text-danger">Please select at least one day of the week.</span>';
      return;
    }
    
    // Calculate dates in the range that match the selected days
    const dates = getDatesInRange(startDate, endDate, selectedDays);
    
    if (dates.length === 0) {
      previewContainer.innerHTML = 'No matching dates found in the selected range.';
      return;
    }
    
    // Show the preview
    previewContainer.innerHTML = `<strong>${dates.length} dates will be blocked:</strong> ${
      dates.length > 5 
        ? `${dates.slice(0, 5).map(d => formatDateShort(d)).join(', ')}... and ${dates.length - 5} more`
        : dates.map(d => formatDateShort(d)).join(', ')
    }`;
  }

  // Helper function to get all dates in a range that match specific days of the week
  function getDatesInRange(startStr, endStr, daysOfWeek) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dates = [];
    
    // Clone the start date
    const current = new Date(start);
    
    // Loop through each date in the range
    while (current <= end) {
      // Check if the current day of the week is in our selected days
      if (daysOfWeek.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      // Move to the next day
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  // Helper function to format date shortly
  function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Function to add unavailable times for multiple days
  function addMultipleDaysUnavailableTimes() {
    // Get form values
    const title = document.getElementById('unavailableTitle').value;
    const startDate = document.getElementById('multipleStartDate').value;
    const endDate = document.getElementById('multipleEndDate').value;
    const startTime = document.getElementById('unavailableStartTime').value;
    const endTime = document.getElementById('unavailableEndTime').value;
    const notes = document.getElementById('unavailableNotes').value;
    
    // Validate form
    if (!title || !startDate || !endDate || !startTime || !endTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Validate time range
    if (startTime >= endTime) {
      showToast('End time must be after start time', 'error');
      return;
    }
    
    // Get selected days
    const selectedDays = [];
    document.querySelectorAll('.day-checkbox:checked').forEach(checkbox => {
      selectedDays.push(parseInt(checkbox.value));
    });
    
    if (selectedDays.length === 0) {
      showToast('Please select at least one day of the week', 'error');
      return;
    }
    
    // Calculate dates in the range that match the selected days
    const dates = getDatesInRange(startDate, endDate, selectedDays);
    
    if (dates.length === 0) {
      showToast('No matching dates found in the selected range', 'error');
      return;
    }
    
    // Show loading toast
    showToast(`Adding unavailable times for ${dates.length} dates...`, 'info');
    
    // Process each date
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;
    
    dates.forEach((date, index) => {
      // Short delay to avoid overwhelming the server
      setTimeout(() => {
        // Format date for the API
        const dateStr = date.toISOString().split('T')[0];
        
        // Prepare data for API
        const unavailableTimeData = {
          title: title,
          date: dateStr,
          startTime: startTime,
          endTime: endTime,
          notes: notes,
          isRecurring: false
        };
        
        // Send to the backend API
        fetch('../backends/clinic-appointments.php?action=add_unavailable_time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unavailableTimeData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            successCount++;
          } else {
            failCount++;
            console.error('Error adding unavailable time for', dateStr, data.error);
          }
        })
        .catch(error => {
          failCount++;
          console.error('Error:', error);
        })
        .finally(() => {
          processedCount++;
          
          // When all dates are processed
          if (processedCount === dates.length) {
            // Show completion message
            showToast(`Added ${successCount} unavailable times successfully${failCount > 0 ? `, ${failCount} failed` : ''}`, successCount > 0 ? 'success' : 'error');
            
            // Reset form
            if (successCount > 0) {
              document.getElementById('addUnavailableTimeForm').reset();
              document.getElementById('enableMultipleDays').checked = false;
              document.getElementById('multipleDaysSection').style.display = 'none';
              document.getElementById('unavailableDate').disabled = false;
              document.getElementById('isRecurring').checked = false;
              document.getElementById('recurringOptions').style.display = 'none';
              document.getElementById('blockEntireDay').checked = false;
              document.getElementById('timeSelectSection').style.opacity = '1';
              document.getElementById('unavailableStartTime').disabled = false;
              document.getElementById('unavailableEndTime').disabled = false;
            }
            
            // Reload the unavailable times
            fetch('../backends/clinic-appointments.php?action=unavailable')
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  unavailableTimes = data.unavailableTimes || [];
                  displayUnavailableTimes(unavailableTimes);
                  setupUnavailableTimeEventListeners();
                }
              })
              .catch(error => {
                console.error('Error refreshing unavailable times:', error);
              });
          }
        });
      }, index * 100); // Stagger requests to avoid overwhelming the server
    });
  }

  // Function to update the preview
  function updatePreview() {
    const previewContainer = document.getElementById('unavailableTimePreview');
    if (!previewContainer) return;
    
    const dateInput = document.getElementById('unavailableDate');
    const startTimeInput = document.getElementById('unavailableStartTime');
    const endTimeInput = document.getElementById('unavailableEndTime');
    const titleInput = document.getElementById('unavailableTitle');
    
    if (dateInput.value && startTimeInput.value && endTimeInput.value) {
      // Format date for display
      const dateObj = new Date(dateInput.value);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Format times for display
      const startTime = formatTimeForDisplay(startTimeInput.value);
      const endTime = formatTimeForDisplay(endTimeInput.value);
      
      // Get title
      const title = titleInput.value || 'Unavailable';
      
      // Create preview HTML
      previewContainer.innerHTML = `
        <div class="p-2 rounded border bg-white">
          <h6 class="mb-1 text-primary">${title}</h6>
          <div class="d-flex align-items-center justify-content-center">
            <div class="me-3">
              <i class="far fa-calendar-alt me-1"></i> ${formattedDate}
            </div>
            <div>
              <i class="far fa-clock me-1"></i> ${startTime} - ${endTime}
            </div>
          </div>
        </div>
      `;
    } else {
      previewContainer.innerHTML = `<span class="badge bg-secondary p-2">Select a date and time to see preview</span>`;
    }
  }
  
  // Helper function to format time for display (HH:MM to 12h format)
  function formatTimeForDisplay(time24h) {
    if (!time24h) return '';
    
    const [hours, minutes] = time24h.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours, 10);
    
    if (hours12 >= 12) {
      period = 'PM';
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }
    
    if (hours12 === 0) {
      hours12 = 12;
    }
    
    return `${hours12}:${minutes} ${period}`;
  }
  
  // Function to add a new unavailable time
  function addUnavailableTime() {
    // Get form values
    const title = document.getElementById('unavailableTitle').value;
    const date = document.getElementById('unavailableDate').value;
    const startTime = document.getElementById('unavailableStartTime').value;
    const endTime = document.getElementById('unavailableEndTime').value;
    const notes = document.getElementById('unavailableNotes').value;
    const isRecurring = document.getElementById('isRecurring').checked;
    
    // Validate form
    if (!title || !date || !startTime || !endTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Validate time range
    if (startTime >= endTime) {
      showToast('End time must be after start time', 'error');
      return;
    }
    
    // Prepare data for API
    const unavailableTimeData = {
      title: title,
      date: date,
      startTime: startTime,
      endTime: endTime,
      notes: notes,
      isRecurring: isRecurring
    };
    
    // Add recurring data if needed
    if (isRecurring) {
      const recurringPattern = document.querySelector('input[name="recurringPattern"]:checked').value;
      const recurUntil = document.getElementById('recurUntil').value;
      
      unavailableTimeData.recurringPattern = recurringPattern;
      unavailableTimeData.recurUntil = recurUntil || null;
    }
    
    // Show loading toast
    showToast('Adding unavailable time...', 'info');
    
    // Send to the backend API
    fetch('../backends/clinic-appointments.php?action=add_unavailable_time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unavailableTimeData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast('Unavailable time added successfully');
        
        // Reset form
        document.getElementById('addUnavailableTimeForm').reset();
        document.getElementById('recurringOptions').style.display = 'none';
        
        // Reload the unavailable times
        fetch('../backends/clinic-appointments.php?action=unavailable')
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              unavailableTimes = data.unavailableTimes || [];
              displayUnavailableTimes(unavailableTimes);
              setupUnavailableTimeEventListeners();
              
              // Refresh the calendar if it's visible
              if (document.getElementById('calendar-view').classList.contains('active')) {
                renderCalendar(currentCalendarDate);
              }
            }
          })
          .catch(error => {
            console.error('Error refreshing unavailable times:', error);
          });
      } else {
        throw new Error(data.error || 'Failed to add unavailable time');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }
  
  // Function to edit an unavailable time
  function editUnavailableTime(timeId) {
    // Find the unavailable time to edit
    const timeToEdit = unavailableTimes.find(time => time.id == timeId);
    if (!timeToEdit) {
      showToast('Unavailable time not found', 'error');
      return;
    }
    
    // Create a modal for editing
    const modalContent = `
      <div class="modal fade" id="editUnavailableTimeModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Unavailable Time</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editUnavailableTimeForm">
                <input type="hidden" id="editTimeId" value="${timeId}">
                
                <div class="mb-3">
                  <label for="editTitle" class="form-label">Title/Reason</label>
                  <input type="text" class="form-control" id="editTitle" value="${timeToEdit.title}" required>
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="editDate" class="form-label">Date</label>
                      <input type="date" class="form-control" id="editDate" value="${timeToEdit.date}" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="row">
                      <div class="col-6">
                        <div class="mb-3">
                          <label for="editStartTime" class="form-label">Start</label>
                          <input type="time" class="form-control" id="editStartTime" value="${timeToEdit.startTime}" required>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="mb-3">
                          <label for="editEndTime" class="form-label">End</label>
                          <input type="time" class="form-control" id="editEndTime" value="${timeToEdit.endTime}" required>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="editNotes" class="form-label">Notes</label>
                  <textarea class="form-control" id="editNotes" rows="2">${timeToEdit.notes || ''}</textarea>
                </div>
                
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="editIsRecurring" ${timeToEdit.isRecurring ? 'checked' : ''}>
                  <label class="form-check-label" for="editIsRecurring">This is a recurring event</label>
                </div>
                
                <div id="editRecurringOptions" style="display: ${timeToEdit.isRecurring ? 'block' : 'none'};">
                  <div class="mb-3">
                    <label class="form-label">Recurrence Pattern</label>
                    <div class="d-flex">
                      <div class="form-check me-3">
                        <input class="form-check-input" type="radio" name="editRecurringPattern" id="editRecurWeekly" value="weekly" ${timeToEdit.recurringPattern === 'weekly' ? 'checked' : ''}>
                        <label class="form-check-label" for="editRecurWeekly">Weekly</label>
                      </div>
                      <div class="form-check me-3">
                        <input class="form-check-input" type="radio" name="editRecurringPattern" id="editRecurMonthly" value="monthly" ${timeToEdit.recurringPattern === 'monthly' ? 'checked' : ''}>
                        <label class="form-check-label" for="editRecurMonthly">Monthly</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="editRecurringPattern" id="editRecurYearly" value="yearly" ${timeToEdit.recurringPattern === 'yearly' ? 'checked' : ''}>
                        <label class="form-check-label" for="editRecurYearly">Yearly</label>
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="editRecurUntil" class="form-label">Recur Until</label>
                    <input type="date" class="form-control" id="editRecurUntil" value="${timeToEdit.recurUntil || ''}">
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-custom" id="saveEditBtn">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the modal to the DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalContent;
    document.body.appendChild(modalContainer);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editUnavailableTimeModal'));
    modal.show();
    
    // Add event listeners
    const editIsRecurringCheckbox = document.getElementById('editIsRecurring');
    const editRecurringOptions = document.getElementById('editRecurringOptions');
    
    if (editIsRecurringCheckbox && editRecurringOptions) {
      editIsRecurringCheckbox.addEventListener('change', function() {
        editRecurringOptions.style.display = this.checked ? 'block' : 'none';
      });
    }
    
    // Save button event listener
    document.getElementById('saveEditBtn').addEventListener('click', function() {
      // Collect form data
      const editedTimeData = {
        id: timeId,
        title: document.getElementById('editTitle').value,
        date: document.getElementById('editDate').value,
        startTime: document.getElementById('editStartTime').value,
        endTime: document.getElementById('editEndTime').value,
        notes: document.getElementById('editNotes').value,
        isRecurring: document.getElementById('editIsRecurring').checked
      };
      
      // Validate form
      if (!editedTimeData.title || !editedTimeData.date || !editedTimeData.startTime || !editedTimeData.endTime) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      // Validate time range
      if (editedTimeData.startTime >= editedTimeData.endTime) {
        showToast('End time must be after start time', 'error');
        return;
      }
      
      // Add recurring data if needed
      if (editedTimeData.isRecurring) {
        editedTimeData.recurringPattern = document.querySelector('input[name="editRecurringPattern"]:checked').value;
        editedTimeData.recurUntil = document.getElementById('editRecurUntil').value || null;
      }
      
      // Show loading toast
      showToast('Updating unavailable time...', 'info');
      
      // Send to the backend API
      fetch('../backends/clinic-appointments.php?action=update_unavailable_time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTimeData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          modal.hide();
          showToast('Unavailable time updated successfully');
          
          // Remove the modal from DOM after hiding
          modal._element.addEventListener('hidden.bs.modal', function() {
            modalContainer.remove();
          });
          
          // Reload the unavailable times
          fetch('../backends/clinic-appointments.php?action=unavailable')
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                unavailableTimes = data.unavailableTimes || [];
                displayUnavailableTimes(unavailableTimes);
                setupUnavailableTimeEventListeners();
                
                // Refresh the calendar if it's visible
                if (document.getElementById('calendar-view').classList.contains('active')) {
                  renderCalendar(currentCalendarDate);
                }
              }
            })
            .catch(error => {
              console.error('Error refreshing unavailable times:', error);
            });
        } else {
          throw new Error(data.error || 'Failed to update unavailable time');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast(`Error: ${error.message}`, 'error');
      });
    });
  }
  
  // Function to delete an unavailable time
  function deleteUnavailableTime(timeId) {
    // Show loading toast
    showToast('Deleting unavailable time...', 'info');
    
    // Send to the backend API
    fetch('../backends/clinic-appointments.php?action=delete_unavailable_time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: timeId })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast('Unavailable time deleted successfully');
        
        // Reload the unavailable times
        fetch('../backends/clinic-appointments.php?action=unavailable')
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              unavailableTimes = data.unavailableTimes || [];
              displayUnavailableTimes(unavailableTimes);
              setupUnavailableTimeEventListeners();
              
              // Refresh the calendar if it's visible
              if (document.getElementById('calendar-view').classList.contains('active')) {
                renderCalendar(currentCalendarDate);
              }
            }
          })
          .catch(error => {
            console.error('Error refreshing unavailable times:', error);
          });
      } else {
        throw new Error(data.error || 'Failed to delete unavailable time');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showToast(`Error: ${error.message}`, 'error');
    });
  }
});
