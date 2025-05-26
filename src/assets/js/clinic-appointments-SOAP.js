document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const activeRoomsContainer = document.getElementById('activeRooms');
    const soapContainer = document.getElementById('soapContainer');
    const currentRoomTitle = document.getElementById('currentRoomTitle');
    const closeRoomBtn = document.getElementById('closeRoomBtn');
    const soapForm = document.getElementById('soapForm');
    const clearFormButton = document.getElementById('clearForm');
    const roomIdInput = document.getElementById('roomId');
    
    // DOM elements for custom SOAP forms
    const createCustomSoapBtn = document.getElementById('createCustomSoapBtn');
    const templateSelectPrompt = document.getElementById('templateSelectPrompt');
    const dynamicSoapForm = document.getElementById('dynamicSoapForm');
    const createSoapFormModal = document.getElementById('createSoapFormModal') ? 
        new bootstrap.Modal(document.getElementById('createSoapFormModal')) : null;
    const addCustomQuestionModal = document.getElementById('addCustomQuestionModal') ? 
        new bootstrap.Modal(document.getElementById('addCustomQuestionModal')) : null;
    const customFormRoomId = document.getElementById('customFormRoomId');
    const questionCategoryId = document.getElementById('questionCategoryId');
    const questionCategoryName = document.getElementById('questionCategoryName');
    const customQuestionType = document.getElementById('customQuestionType');
    const customOptionsContainer = document.getElementById('customOptionsContainer');
    const addCustomQuestionBtn = document.getElementById('addCustomQuestionBtn');
    const saveSoapFormBtn = document.getElementById('saveSoapFormBtn');
    
    // DOM elements for show/hide SOAP form
    const roomOverviewCard = document.getElementById('roomOverviewCard');
    const soapFormContainer = document.getElementById('soapFormContainer');
    const showSoapFormBtn = document.getElementById('showSoapFormBtn');
    const hideSoapFormBtn = document.getElementById('hideSoapFormBtn');
    
    // Overview elements
    const overviewPatientName = document.getElementById('overviewPatientName');
    const overviewPatientSpecies = document.getElementById('overviewPatientSpecies');
    const overviewPatientBreed = document.getElementById('overviewPatientBreed');
    const overviewOwnerName = document.getElementById('overviewOwnerName');
    const overviewAppointmentDate = document.getElementById('overviewAppointmentDate');
    const overviewStatus = document.getElementById('overviewStatus');
    
    // Client Search Elements
    const clientSearchInput = document.getElementById('clientSearchInput');
    const clientSearchBtn = document.getElementById('clientSearchBtn');
    const clientSearchResults = document.getElementById('clientSearchResults');
    
    // Initialize Bootstrap Modal for Client Search
    const addClientModal = document.getElementById('addClientModal') ? 
        new bootstrap.Modal(document.getElementById('addClientModal')) : null;
    
    // Initialize storage
    let appointmentRooms = [];
    let clients = [];
    let currentRoom = null;
    
    // Storage for custom SOAP questions
    let customQuestions = {
        1: [], // Subjective
        2: [], // Objective
        3: [], // Assessment
        4: []  // Plan
    };
    
    // Show/Hide SOAP Form button handlers
    if (showSoapFormBtn) {
        showSoapFormBtn.addEventListener('click', function() {
            roomOverviewCard.style.display = 'none';
            soapFormContainer.style.display = 'block';
        });
    }
    
    if (hideSoapFormBtn) {
        hideSoapFormBtn.addEventListener('click', function() {
            soapFormContainer.style.display = 'none';
            roomOverviewCard.style.display = 'block';
        });
    }
    
    // Event listener for create custom SOAP form button
    if (createCustomSoapBtn) {
        createCustomSoapBtn.addEventListener('click', function() {
            // Reset the form
            resetCustomSoapForm();
            
            // Set the current room ID
            customFormRoomId.value = currentRoom;
            
            // Open the modal
            createSoapFormModal.show();
        });
    }
    
    // API base URL - adjust this to match your environment
    const API_BASE_URL = '../backends';
    
    // Event listener for custom question type change
    if (customQuestionType) {
        customQuestionType.addEventListener('change', function() {
            // Show options container if the question type requires options
            const requiresOptions = ['select', 'checkbox', 'radio'].includes(this.value);
            customOptionsContainer.style.display = requiresOptions ? 'block' : 'none';
        });
    }
    
    // Event listeners for add question buttons
    document.querySelectorAll('.add-question-btn').forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-category');
            const categoryName = this.getAttribute('data-category-name');
            
            // Set the category in the modal
            questionCategoryId.value = categoryId;
            questionCategoryName.textContent = categoryName;
            
            // Reset the form
            document.getElementById('customQuestionForm').reset();
            customOptionsContainer.style.display = 'none';
            
            // Open the modal
            addCustomQuestionModal.show();
        });
    });
    
    // Event listener for add question button in modal
    if (addCustomQuestionBtn) {
        addCustomQuestionBtn.addEventListener('click', function() {
            const categoryId = questionCategoryId.value;
            const questionText = document.getElementById('customQuestionText').value;
            const questionType = document.getElementById('customQuestionType').value;
            const required = document.getElementById('customQuestionRequired').checked;
            
            // Validate the form
            if (!questionText) {
                alert('Please enter question text');
                return;
            }
            
            // Get options if applicable
            let options = null;
            if (['select', 'checkbox', 'radio'].includes(questionType)) {
                const optionsText = document.getElementById('customQuestionOptions').value;
                if (!optionsText) {
                    alert('Please enter at least one option');
                    return;
                }
                
                // Parse options from textarea
                options = optionsText.split('\n')
                    .map(opt => opt.trim())
                    .filter(opt => opt); // Filter out empty lines
                    
                if (options.length === 0) {
                    alert('Please enter at least one option');
                    return;
                }
            }
            
            // Add the question to the correct category
            const question = {
                category_id: parseInt(categoryId),
                question_text: questionText,
                question_type: questionType,
                is_required: required ? 1 : 0,
                display_order: customQuestions[categoryId].length,
                options: options
            };
            
            customQuestions[categoryId].push(question);
            
            // Update the UI
            renderCustomQuestions();
            
            // Close the modal
            addCustomQuestionModal.hide();
        });
    }
    
    // Event listener for save SOAP form button
    if (saveSoapFormBtn) {
        saveSoapFormBtn.addEventListener('click', async function() {
            const roomId = customFormRoomId.value;
            
            // Check if we have at least one question
            const totalQuestions = Object.values(customQuestions).reduce((total, questions) => total + questions.length, 0);
            
            if (totalQuestions === 0) {
                alert('Please add at least one question to the SOAP form');
                return;
            }
            
            // Create the template data
            const templateData = {
                questions: []
            };
            
            // Add all questions to the template data
            for (const categoryId in customQuestions) {
                templateData.questions = templateData.questions.concat(customQuestions[categoryId]);
            }
            
            try {
                showAlert('Creating custom SOAP form...', 'info');
                
                // Save the template
                const result = await api.roomTemplates.create(roomId, templateData);
                
                if (result.success) {
                    // Close the modal
                    createSoapFormModal.hide();
                    
                    // Load the template
                    await loadRoomTemplate(roomId);
                    
                    showAlert('Custom SOAP form created successfully!', 'success');
                } else {
                    showAlert('Failed to create custom SOAP form. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error creating custom SOAP form:', error);
                showAlert('Error creating custom SOAP form: ' + error.message, 'danger');
            }
        });
    }
    
    // Function to reset the custom SOAP form
    function resetCustomSoapForm() {
        // Clear all questions
        customQuestions = {
            1: [], // Subjective
            2: [], // Objective
            3: [], // Assessment
            4: []  // Plan
        };
        
        // Update the UI
        renderCustomQuestions();
    }
    
    // Function to render custom questions in the form
    function renderCustomQuestions() {
        // Clear all question lists
        document.querySelectorAll('.soap-question-list').forEach(list => {
            list.innerHTML = '';
        });
        
        // Render questions for each category
        for (const categoryId in customQuestions) {
            const questions = customQuestions[categoryId];
            const categoryName = getCategoryName(categoryId);
            const listId = categoryName.toLowerCase() + 'Questions';
            const list = document.getElementById(listId);
            
            if (!list) continue;
            
            questions.forEach((question, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'soap-question-item mb-2 p-2 border rounded';
                
                let options = '';
                if (question.options && question.options.length > 0) {
                    options = `<small class="text-muted">Options: ${question.options.join(', ')}</small>`;
                }
                
                questionElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${question.question_text}</strong>
                            ${question.is_required ? '<span class="text-danger">*</span>' : ''}
                            <div><small class="text-muted">Type: ${question.question_type}</small></div>
                            ${options}
                        </div>
                        <button type="button" class="btn btn-sm btn-danger remove-question" data-category="${categoryId}" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                list.appendChild(questionElement);
            });
        }
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-question').forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-category');
                const index = parseInt(this.getAttribute('data-index'));
                
                // Remove the question
                customQuestions[categoryId].splice(index, 1);
                
                // Update display order for remaining questions
                customQuestions[categoryId].forEach((question, idx) => {
                    question.display_order = idx;
                });
                
                // Update the UI
                renderCustomQuestions();
            });
        });
    }
    
    // Helper function to get category name
    function getCategoryName(categoryId) {
        const categories = {
            '1': 'Subjective',
            '2': 'Objective',
            '3': 'Assessment',
            '4': 'Plan'
        };
        
        return categories[categoryId] || 'Unknown';
    }
    
    // Function to load a room's template
    async function loadRoomTemplate(roomId) {
        try {
            // Show loading message
            templateSelectPrompt.innerHTML = '<p class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></p>';
            
            // Fetch the template for this room
            const template = await api.roomTemplates.get(roomId);
            
            if (!template.has_template) {
                // No template found for this room
                templateSelectPrompt.style.display = 'block';
                dynamicSoapForm.style.display = 'none';
                return;
            }
            
            // Template found, render it
            templateSelectPrompt.style.display = 'none';
            dynamicSoapForm.style.display = 'block';
            
            // Group questions by category
            const questionsByCategory = {};
            template.questions.forEach(question => {
                if (!questionsByCategory[question.category_name]) {
                    questionsByCategory[question.category_name] = [];
                }
                questionsByCategory[question.category_name].push(question);
            });
            
            // Clear the form container
            dynamicSoapForm.innerHTML = '';
            
            // Create form elements for each category
            for (const category in questionsByCategory) {
                // Create category section
                const categorySection = document.createElement('div');
                categorySection.className = 'card mb-3';
                categorySection.innerHTML = `
                    <div class="card-header bg-info text-white">
                        <h5>${category}</h5>
                    </div>
                    <div class="card-body" id="category-${category.toLowerCase()}">
                    </div>
                `;
                
                dynamicSoapForm.appendChild(categorySection);
                
                const categoryBody = categorySection.querySelector('.card-body');
                
                // Add questions for this category
                questionsByCategory[category].forEach(question => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'mb-3';
                    
                    // Create the input based on question type
                    let inputHtml = '';
                    const questionValue = ''; // No saved value yet
                    const requiredAttr = question.is_required ? 'required' : '';
                    
                    switch (question.question_type) {
                        case 'text':
                            inputHtml = `
                                <input type="text" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        case 'textarea':
                            inputHtml = `
                                <textarea class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    rows="3"
                                    ${requiredAttr}>${questionValue}</textarea>
                            `;
                            break;
                            
                        case 'number':
                            inputHtml = `
                                <input type="number" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        case 'select':
                            let options = '';
                            if (question.options && Array.isArray(question.options)) {
                                options = question.options.map(opt => 
                                    `<option value="${opt}">${opt}</option>`
                                ).join('');
                            }
                            
                            inputHtml = `
                                <select class="form-select soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    ${requiredAttr}>
                                    <option value="">Select an option</option>
                                    ${options}
                                </select>
                            `;
                            break;
                            
                        case 'checkbox':
                            if (question.options && Array.isArray(question.options)) {
                                inputHtml = '<div>';
                                question.options.forEach(opt => {
                                    inputHtml += `
                                        <div class="form-check">
                                            <input class="form-check-input soap-checkbox" 
                                                type="checkbox" 
                                                id="question-${question.question_id}-${opt}" 
                                                data-question-id="${question.question_id}"
                                                value="${opt}">
                                            <label class="form-check-label" for="question-${question.question_id}-${opt}">
                                                ${opt}
                                            </label>
                                        </div>
                                    `;
                                });
                                inputHtml += '</div>';
                            }
                            break;
                            
                        case 'radio':
                            if (question.options && Array.isArray(question.options)) {
                                inputHtml = '<div>';
                                question.options.forEach(opt => {
                                    inputHtml += `
                                        <div class="form-check">
                                            <input class="form-check-input soap-question" 
                                                type="radio" 
                                                name="question-${question.question_id}" 
                                                id="question-${question.question_id}-${opt}" 
                                                data-question-id="${question.question_id}"
                                                value="${opt}"
                                                ${requiredAttr}>
                                            <label class="form-check-label" for="question-${question.question_id}-${opt}">
                                                ${opt}
                                            </label>
                                        </div>
                                    `;
                                });
                                inputHtml += '</div>';
                            }
                            break;
                            
                        case 'date':
                            inputHtml = `
                                <input type="date" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        default:
                            inputHtml = `
                                <input type="text" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                    }
                    
                    questionDiv.innerHTML = `
                        <label for="question-${question.question_id}" class="form-label">
                            ${question.question_text}
                            ${question.is_required ? '<span class="text-danger">*</span>' : ''}
                        </label>
                        ${inputHtml}
                    `;
                    
                    categoryBody.appendChild(questionDiv);
                });
            }
            
            // Add a save button
            const saveButton = document.createElement('div');
            saveButton.className = 'text-center mt-3';
            saveButton.innerHTML = `
                <button type="button" class="btn btn-primary btn-lg save-responses-btn">
                    <i class="fas fa-save"></i> Save Responses
                </button>
            `;
            
            dynamicSoapForm.appendChild(saveButton);
            
            // Add event listener for save button
            document.querySelector('.save-responses-btn').addEventListener('click', function() {
                saveSoapResponses(roomId);
            });
        } catch (error) {
            console.error('Error loading room template:', error);
            templateSelectPrompt.innerHTML = `
                <div class="alert alert-danger">
                    <p>Error loading custom SOAP form: ${error.message}</p>
                    <button type="button" class="btn btn-outline-primary" id="retryLoadTemplateBtn">Retry</button>
                </div>
            `;
            
            // Add event listener for retry button
            document.getElementById('retryLoadTemplateBtn').addEventListener('click', function() {
                loadRoomTemplate(roomId);
            });
        }
    }
    
    // Function to collect and save SOAP responses
    async function saveSoapResponses(roomId) {
        try {
            const responses = [];
            
            // Collect regular input responses
            document.querySelectorAll('.soap-question').forEach(input => {
                const questionId = input.getAttribute('data-question-id');
                
                // Skip radio buttons that aren't checked
                if (input.type === 'radio' && !input.checked) {
                    return;
                }
                
                responses.push({
                    question_id: questionId,
                    response_text: input.value
                });
            });
            
            // Collect checkbox group responses
            const checkboxGroups = {};
            document.querySelectorAll('.soap-checkbox').forEach(checkbox => {
                const questionId = checkbox.getAttribute('data-question-id');
                
                if (!checkbox.checked) return;
                
                if (!checkboxGroups[questionId]) {
                    checkboxGroups[questionId] = [];
                }
                
                checkboxGroups[questionId].push(checkbox.value);
            });
            
            // Add checkbox group responses
            for (const questionId in checkboxGroups) {
                responses.push({
                    question_id: questionId,
                    response_text: checkboxGroups[questionId].join(',')
                });
            }
            
            // Save responses to API
            await api.soapResponses.save(roomId, responses);
            
            showAlert('SOAP responses saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving SOAP responses:', error);
            showAlert('Error saving SOAP responses: ' + error.message, 'danger');
        }
    }
    
    // Add room template loading to the openRoom function
    const originalOpenRoom = openRoom;
    openRoom = async function(roomId) {
        // Call the original function first
        await originalOpenRoom.call(this, roomId);
        
        // Load the room template
        await loadRoomTemplate(roomId);
    };
    
    // API helper functions
    const api = {
        // Rooms API
        rooms: {
            getAll: async function(status = null) {
                try {
                    const url = `${API_BASE_URL}/clinic-appointments-SOAP.php/rooms${status ? `?status=${status}` : ''}`;
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    let rooms = [];
                    try {
                        rooms = await response.json();
                        
                        // Log received data for debugging
                        console.log('Raw rooms data from server:', rooms);
                        
                        // Validate and clean the received data
                        if (!Array.isArray(rooms)) {
                            console.error('Expected array of rooms, got:', typeof rooms);
                            rooms = [];
                        }
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                        const text = await response.text();
                        console.error('Response text:', text);
                        throw new Error('Failed to parse room data as JSON');
                    }
                    
                    // Normalize and transform the data
                    return rooms.map(room => {
                        // Ensure we have required fields with defaults
                        const normalizedRoom = {
                            id: room.room_id || room.id || 'room_' + Date.now(),
                            room_id: room.room_id || room.id || 'room_' + Date.now(),
                            patientName: room.patientName || room.patient_name || 'Unnamed Patient',
                            clientName: room.clientName || room.client_name || room.owner_name || 'N/A',
                            status: room.status || 'active',
                            createdAt: room.created_at || room.createdAt || new Date().toISOString(),
                            appointment_id: room.appointment_id || null,
                            patientSpecies: room.patientSpecies || room.patient_species || room.species || '',
                            patientBreed: room.patientBreed || room.patient_breed || room.breed || '',
                            patientAge: room.patientAge || room.patient_age || room.age || '',
                            patientGender: room.patientGender || room.patient_gender || room.gender || ''
                        };
                        
                        // Handle soap_data consistently
                        if (room.soap_data) {
                            try {
                                // If soap_data exists but is a string, try to parse it
                                if (typeof room.soap_data === 'string') {
                                    normalizedRoom.soap_data = JSON.parse(room.soap_data);
                                } else {
                                    normalizedRoom.soap_data = room.soap_data;
                                }
                            } catch (e) {
                                console.error('Error parsing soap_data:', e);
                                normalizedRoom.soap_data = null;
                            }
                        }
                        
                        return normalizedRoom;
                    });
                } catch (error) {
                    console.error('Error fetching rooms:', error);
                    // Return empty array if API fails
                    return [];
                }
            },
            
            create: async function(roomData) {
                console.log('API create room called with data:', roomData);
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/rooms`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(roomData)
                    });
                    
                    // Get the raw response text first for debugging
                    const responseText = await response.text();
                    console.log('Raw API response:', responseText);
                    
                    // Try to parse as JSON
                    let responseData;
                    try {
                        responseData = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError);
                        throw new Error('Invalid JSON response from server');
                    }
                    
                    if (!response.ok) {
                        console.error('Server returned an error:', response.status, responseData);
                        throw new Error(responseData.error || response.statusText);
                    }
                    
                    return responseData;
                } catch (error) {
                    console.error('Error creating room:', error);
                    return { success: false, message: 'Room creation failed. Please try again.' };
                }
            },
            
            update: async function(roomId, roomData) {
                try {
                    // Send only database-relevant fields to the API
                    // Make sure to send status to trigger the database trigger
                    const apiData = {
                        status: roomData.status
                    };
                    
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/rooms?id=${roomId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(apiData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error updating room:', error);
                    return { success: false, message: 'Room update failed. Please try again.' };
                }
            },
            
            delete: async function(roomId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/rooms?id=${roomId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error deleting room:', error);
                    return { success: false, message: 'Room deletion failed. Please try again.' };
                }
            }
        },
        
        // Clients API
        clients: {
            search: async function(searchTerm) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/clients?search=${searchTerm}`);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Server response error:', errorText);
                        
                        // If there's a 500 error and it's in JSON format, try to parse it and display a more helpful error
                        if (response.status === 500 && errorText.includes('{')) {
                            try {
                                const errorObj = JSON.parse(errorText);
                                if (errorObj.error && errorObj.message) {
                                    throw new Error(`Server error: ${errorObj.message}`);
                                }
                            } catch (jsonParseError) {
                                // If we can't parse the error as JSON, just continue with the generic error
                                console.warn('Could not parse error as JSON:', jsonParseError);
                            }
                        }
                        
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    // Parse response as JSON
                    try {
                        const data = await response.json();
                        return data;
                    } catch (jsonError) {
                        console.error('JSON parse error:', jsonError);
                        const responseText = await response.text();
                        console.error('Response text:', responseText);
                        throw new Error('Failed to parse server response as JSON');
                    }
                } catch (error) {
                    console.error('Error searching clients:', error);
                    
                    // Show error details in console for debugging
                    if (error.message.includes('JSON')) {
                        console.error('This appears to be a JSON parsing error. Check if the server is returning valid JSON.');
                    }
                    
                    // Show a user-friendly error
                    showAlert(`Error searching for clients: ${error.message}`, 'danger');
                    
                    // Return empty array if API fails
                    return [];
                }
            },
            
            getAll: async function() {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/clients?all=true`);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Server response error:', errorText);
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    // Parse response as JSON
                    try {
                        const data = await response.json();
                        return data;
                    } catch (jsonError) {
                        console.error('JSON parse error:', jsonError);
                        throw new Error('Failed to parse server response as JSON');
                    }
                } catch (error) {
                    console.error('Error fetching all clients:', error);
                    
                    // Return empty array if API fails
                    return [];
                }
            },
            
            // New method to get detailed patient data
            getPatientDetails: async function(petId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/clients?pet_id=${petId}`);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Server response error:', errorText);
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                    showAlert(`Error retrieving patient details: ${error.message}`, 'warning');
                    return null;
                }
            }
        },
        
        // SOAP Templates API
        soapTemplates: {
            getAll: async function(clinicId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-templates?clinic_id=${clinicId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching SOAP templates:', error);
                    throw error;
                }
            },
            
            getById: async function(templateId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-templates?template_id=${templateId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const templates = await response.json();
                    return templates.length > 0 ? templates[0] : null;
                } catch (error) {
                    console.error('Error fetching SOAP template:', error);
                    throw error;
                }
            },
            
            create: async function(templateData) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-templates`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(templateData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error creating SOAP template:', error);
                    throw error;
                }
            },
            
            update: async function(templateId, templateData) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-templates?template_id=${templateId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(templateData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error updating SOAP template:', error);
                    throw error;
                }
            },
            
            delete: async function(templateId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-templates?template_id=${templateId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error deleting SOAP template:', error);
                    throw error;
                }
            }
        },
        
        // SOAP Questions API
        soapQuestions: {
            getByTemplate: async function(templateId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-questions?template_id=${templateId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching SOAP questions:', error);
                    throw error;
                }
            },
            
            create: async function(questionData) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-questions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(questionData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error creating SOAP question:', error);
                    throw error;
                }
            },
            
            update: async function(questionId, questionData) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-questions?question_id=${questionId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(questionData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error updating SOAP question:', error);
                    throw error;
                }
            },
            
            delete: async function(questionId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-questions?question_id=${questionId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error deleting SOAP question:', error);
                    throw error;
                }
            }
        },
        
        // SOAP Responses API
        soapResponses: {
            getByRoom: async function(roomId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-responses?room_id=${roomId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching SOAP responses:', error);
                    throw error;
                }
            },
            
            save: async function(roomId, responses) {
                try {
                    const responseData = {
                        room_id: roomId,
                        responses: responses
                    };
                    
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/soap-responses`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(responseData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error saving SOAP responses:', error);
                    throw error;
                }
            }
        },
        
        // Room Templates API
        roomTemplates: {
            get: async function(roomId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/room-templates?room_id=${roomId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching room template:', error);
                    throw error;
                }
            },
            
            create: async function(roomId, templateData) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/room-templates`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            room_id: roomId,
                            template_data: templateData
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error creating room template:', error);
                    throw error;
                }
            }
        }
    };
    
    // Function to load and display SOAP template for a room
    async function loadSoapTemplate(roomId, templateId) {
        try {
            // Get the template questions
            const questions = await api.soapQuestions.getByTemplate(templateId);
            
            // Get any existing responses for this room
            let responses = [];
            try {
                responses = await api.soapResponses.getByRoom(roomId);
            } catch (error) {
                console.warn('No existing responses found for this room');
            }
            
            // Create a map of existing responses for quick lookup
            const responseMap = {};
            responses.forEach(response => {
                responseMap[response.question_id] = response.response_text;
            });
            
            // Group questions by category
            const questionsByCategory = {};
            questions.forEach(question => {
                if (!questionsByCategory[question.category_name]) {
                    questionsByCategory[question.category_name] = [];
                }
                questionsByCategory[question.category_name].push(question);
            });
            
            // Get the form container
            const formContainer = document.getElementById('dynamicSoapForm');
            formContainer.innerHTML = '';
            
            // Create form elements for each category
            for (const category in questionsByCategory) {
                // Create category section
                const categorySection = document.createElement('div');
                categorySection.className = 'card mb-3';
                categorySection.innerHTML = `
                    <div class="card-header bg-info text-white">
                        <h5>${category}</h5>
                    </div>
                    <div class="card-body" id="category-${category.toLowerCase()}">
                    </div>
                `;
                
                formContainer.appendChild(categorySection);
                
                const categoryBody = categorySection.querySelector('.card-body');
                
                // Add questions for this category
                questionsByCategory[category].forEach(question => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'mb-3';
                    
                    // Create the input based on question type
                    let inputHtml = '';
                    const questionValue = responseMap[question.question_id] || '';
                    const requiredAttr = question.is_required ? 'required' : '';
                    
                    switch (question.question_type) {
                        case 'text':
                            inputHtml = `
                                <input type="text" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        case 'textarea':
                            inputHtml = `
                                <textarea class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    rows="3"
                                    ${requiredAttr}>${questionValue}</textarea>
                            `;
                            break;
                            
                        case 'number':
                            inputHtml = `
                                <input type="number" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        case 'select':
                            let options = '';
                            if (question.options && Array.isArray(question.options)) {
                                options = question.options.map(opt => 
                                    `<option value="${opt}" ${questionValue === opt ? 'selected' : ''}>${opt}</option>`
                                ).join('');
                            }
                            
                            inputHtml = `
                                <select class="form-select soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    ${requiredAttr}>
                                    <option value="">Select an option</option>
                                    ${options}
                                </select>
                            `;
                            break;
                            
                        case 'checkbox':
                            if (question.options && Array.isArray(question.options)) {
                                // Parse saved values as array
                                const savedValues = questionValue ? questionValue.split(',') : [];
                                
                                inputHtml = '<div>';
                                question.options.forEach(opt => {
                                    const isChecked = savedValues.includes(opt) ? 'checked' : '';
                                    inputHtml += `
                                        <div class="form-check">
                                            <input class="form-check-input soap-checkbox" 
                                                type="checkbox" 
                                                id="question-${question.question_id}-${opt}" 
                                                data-question-id="${question.question_id}"
                                                value="${opt}"
                                                ${isChecked}>
                                            <label class="form-check-label" for="question-${question.question_id}-${opt}">
                                                ${opt}
                                            </label>
                                        </div>
                                    `;
                                });
                                inputHtml += '</div>';
                            }
                            break;
                            
                        case 'radio':
                            if (question.options && Array.isArray(question.options)) {
                                inputHtml = '<div>';
                                question.options.forEach(opt => {
                                    const isChecked = questionValue === opt ? 'checked' : '';
                                    inputHtml += `
                                        <div class="form-check">
                                            <input class="form-check-input soap-question" 
                                                type="radio" 
                                                name="question-${question.question_id}" 
                                                id="question-${question.question_id}-${opt}" 
                                                data-question-id="${question.question_id}"
                                                value="${opt}"
                                                ${isChecked}
                                                ${requiredAttr}>
                                            <label class="form-check-label" for="question-${question.question_id}-${opt}">
                                                ${opt}
                                            </label>
                                        </div>
                                    `;
                                });
                                inputHtml += '</div>';
                            }
                            break;
                            
                        case 'date':
                            inputHtml = `
                                <input type="date" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        default:
                            inputHtml = `
                                <input type="text" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                    }
                    
                    questionDiv.innerHTML = `
                        <label for="question-${question.question_id}" class="form-label">
                            ${question.question_text}
                            ${question.is_required ? '<span class="text-danger">*</span>' : ''}
                        </label>
                        ${inputHtml}
                    `;
                    
                    categoryBody.appendChild(questionDiv);
                });
            }
            
            // Show the dynamic form
            formContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading SOAP template:', error);
            showAlert('Failed to load SOAP template. Please try again.', 'danger');
        }
    }
    
    // Function to save SOAP responses
    async function saveSoapResponses(roomId) {
        try {
            const responses = [];
            
            // Collect regular input responses
            document.querySelectorAll('.soap-question').forEach(input => {
                const questionId = input.getAttribute('data-question-id');
                
                // Skip radio buttons that aren't checked
                if (input.type === 'radio' && !input.checked) {
                    return;
                }
                
                responses.push({
                    question_id: questionId,
                    response_text: input.value
                });
            });
            
            // Collect checkbox group responses (these need special handling)
            const checkboxGroups = {};
            document.querySelectorAll('.soap-checkbox').forEach(checkbox => {
                const questionId = checkbox.getAttribute('data-question-id');
                
                if (!checkbox.checked) return;
                
                if (!checkboxGroups[questionId]) {
                    checkboxGroups[questionId] = [];
                }
                
                checkboxGroups[questionId].push(checkbox.value);
            });
            
            // Add checkbox group responses
            for (const questionId in checkboxGroups) {
                responses.push({
                    question_id: questionId,
                    response_text: checkboxGroups[questionId].join(',')
                });
            }
            
            // Save responses to the API
            await api.soapResponses.save(roomId, responses);
            
            showAlert('SOAP responses saved successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error saving SOAP responses:', error);
            showAlert('Failed to save SOAP responses. Please try again.', 'danger');
            return false;
        }
    }
    
    // Load data on initialization
    async function initializeData() {
        try {
            // Try to load active rooms from API
            const dbRooms = await api.rooms.getAll();
            
            appointmentRooms = dbRooms;
            
            // Now load patient details for active appointment-based rooms
            await loadAllPatientDetails();
            
            // Display active rooms
            displayActiveRooms();
        } catch (error) {
            console.error('Error initializing data:', error);
            
            appointmentRooms = [];
            clients = [];
            
            displayActiveRooms();
            showAlert('Failed to load data from server.', 'warning');
        }
    }
    
    // New function to load patient details for all rooms at initialization
    async function loadAllPatientDetails() {
        // Show a loading indicator
        showAlert('Loading patient information...', 'info');
        
        // Only process rooms with appointment_id and active status
        const roomsToProcess = appointmentRooms.filter(room => 
            room.status === 'active' && room.appointment_id);
        
        if (roomsToProcess.length === 0) {
            // Clear the loading message if no rooms to process
            const alertElements = document.querySelectorAll('.alert-info');
            alertElements.forEach(element => {
                if (element.textContent.includes('Loading patient information')) {
                    element.remove();
                }
            });
            return;
        }
        
        // Process each room to get patient details
        for (const room of roomsToProcess) {
            try {
                // Get patient ID from appointment
                let petId = null;
                
                // Try to get the pet_id for database lookup
                try {
                    const appointmentSql = `SELECT ccp.pet_id 
                                          FROM clinic_client_appointment cca
                                          JOIN clinic_client_pets ccp ON cca.client_pet_id = ccp.client_pet_id
                                          WHERE cca.appointment_id = ${room.appointment_id}`;
                    
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/execute-query`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: appointmentSql })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.length > 0) {
                            petId = data[0].pet_id;
                        }
                    }
                } catch (error) {
                    console.warn(`Could not get pet_id for room ${room.id}:`, error);
                    continue; // Skip to next room
                }
                
                // If we found a pet ID, get patient details
                if (petId) {
                    const patientDetails = await api.clients.getPatientDetails(petId);
                    
                    if (patientDetails) {
                        // Find the room in the array and update it
                        const roomIndex = appointmentRooms.findIndex(r => r.id === room.id);
                        if (roomIndex !== -1) {
                            // Update the room with patient details
                            appointmentRooms[roomIndex].patientName = patientDetails.name || appointmentRooms[roomIndex].patientName;
                            appointmentRooms[roomIndex].patientSpecies = patientDetails.species || '';
                            appointmentRooms[roomIndex].patientBreed = patientDetails.breed || '';
                            appointmentRooms[roomIndex].clientName = patientDetails.owner_name || appointmentRooms[roomIndex].clientName;
                            appointmentRooms[roomIndex].pet_id = petId; // Store pet_id for future use
                        }
                    }
                }
            } catch (error) {
                console.error(`Error getting details for room ${room.id}:`, error);
                // Continue processing other rooms even if one fails
            }
        }
        
        // Clear the loading message
        const alertElements = document.querySelectorAll('.alert-info');
        alertElements.forEach(element => {
            if (element.textContent.includes('Loading patient information')) {
                element.remove();
            }
        });
    }
    
    // Initialize data on page load
    initializeData();
    
    // Client Search Button Click Handler
    clientSearchBtn.addEventListener('click', function() {
        const searchTerm = clientSearchInput.value.trim().toLowerCase();
        if (!searchTerm) {
            showAlert('Please enter a search term', 'warning');
            return;
        }
        
        searchClients(searchTerm);
    });
    
    // Handle search on Enter key
    clientSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clientSearchBtn.click();
        }
    });
    
    // Search clients function
    async function searchClients(searchTerm) {
        clientSearchResults.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        try {
            // Fetch clients from API
            const results = await api.clients.search(searchTerm);
            
            // Display the results
            displaySearchResults(results);
        } catch (error) {
            console.error('Error during client search:', error);
            clientSearchResults.innerHTML = `
                <div class="alert alert-danger">
                    <h5>An error occurred while searching for clients</h5>
                    <p>${error.message}</p>
                    <p>Please try again later or contact system administrator.</p>
                </div>`;
        }
    }
    
    // Create a new appointment room with provided details
    async function createAppointmentRoom(patientName, client, patientSpecies = '', patientBreed = '') {
        console.log('createAppointmentRoom called with:', { patientName, client, patientSpecies, patientBreed });
        
        if (!patientName || !client) {
            console.error('Missing required data:', { patientName, client });
            showAlert('Missing required patient or client data', 'danger');
            return;
        }
        
        const roomId = 'room_' + Date.now();
        const newRoom = {
            id: roomId,
            patientName: patientName,
            clientId: client.id,
            clientName: client.name,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        // Add species and breed if available
        if (patientSpecies) {
            newRoom.patientSpecies = patientSpecies;
        }
        if (patientBreed) {
            newRoom.patientBreed = patientBreed;
        }
        
        try {
            // Create room via API with only database-needed fields
            const apiData = {
                id: roomId,
                createdAt: new Date().toISOString(), // Server will convert this
                status: 'active'
            };
            
            console.log('Sending API data:', apiData);
            
            const result = await api.rooms.create(apiData);
            console.log('API response:', result);
            
            // Add to local array with full client data
            appointmentRooms.push(newRoom);
            console.log('Room added to appointmentRooms array, new length:', appointmentRooms.length);
            
            // Clear input and update display
            if (addClientModal) {
                addClientModal.hide();
            } else {
                console.warn('addClientModal is not defined');
            }
            
            displayActiveRooms();
            
            // Automatically open the new room
            console.log('Opening room:', roomId);
            openRoom(roomId);
            
            showAlert(`Appointment room created for ${patientName}`, 'success');
        } catch (error) {
            console.error('Error creating room:', error);
            showAlert('Failed to create appointment room. Please try again.', 'danger');
        }
    }
    
    // Create a new appointment room from an existing appointment
    async function createAppointmentRoomFromAppointment(patientName, client, appointmentId, patientSpecies = '', patientBreed = '') {
        // Validate required fields
        if (!patientName) {
            console.error('Missing patient name');
            showAlert('Patient name is required to create a room', 'danger');
            return;
        }
        
        if (!appointmentId) {
            console.error('Missing appointment ID');
            showAlert('Appointment ID is required to create a room', 'danger');
            return;
        }
        
        // Ensure client is at least a minimal object
        if (!client || typeof client !== 'object') {
            console.warn('Invalid client object, creating a placeholder');
            client = {
                id: 'unknown',
                name: 'Unknown Client'
            };
        }
        
        const roomId = 'room_' + Date.now();
        const newRoom = {
            id: roomId,
            appointment_id: appointmentId,  // Store the reference to the appointment
            patientName: patientName,
            clientId: client.id || 'unknown',
            clientName: client.name || 'Unknown Client',
            createdAt: new Date().toISOString(),
            status: 'active'
            // No longer sending soapData to backend
        };
        
        // Add species and breed if available
        if (patientSpecies) {
            newRoom.patientSpecies = patientSpecies;
        }
        if (patientBreed) {
            newRoom.patientBreed = patientBreed;
        }
        
        console.log('Creating room with data:', newRoom);
        
        try {
            // Create room via API - sending only the data needed for the database
            const apiData = {
                id: roomId,
                appointment_id: appointmentId,
                createdAt: new Date().toISOString(), // Server will convert this
                status: 'active'
            };
            
            console.log('Sending API data:', apiData);
            
            const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiData)
            });
            
            // Get the raw response text first for debugging
            const responseText = await response.text();
            console.log('Raw API response:', responseText);
            
            // Try to parse as JSON
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                showAlert('Invalid response from server. Check console for details.', 'danger');
                return;
            }
            
            if (!response.ok) {
                console.error('Server returned an error:', response.status, responseData);
                showAlert(`Server error: ${responseData.error || response.statusText}`, 'danger');
                return;
            }
            
            // Add to local array with full data including client-side only fields
            appointmentRooms.push(newRoom);
            
            // Save to local storage for persistence
            saveRoomsToStorage();
            
            // Clear input and update display
            addClientModal.hide();
            displayActiveRooms();
            
            // Automatically open the new room
            openRoom(roomId);
            
            showAlert(`Appointment room created for ${patientName}`, 'success');
        } catch (error) {
            console.error('Error creating room:', error);
            showAlert('Failed to create appointment room. Please check console for details.', 'danger');
        }
    }
    
    // Close room button handler
    closeRoomBtn.addEventListener('click', function() {
        if (soapForm.dataset.hasChanges === 'true') {
            if (!confirm('You have unsaved changes. Are you sure you want to close this room?')) {
                return;
            }
        }
        closeCurrentRoom();
    });
    
    // Track form changes
    const formInputs = soapForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            soapForm.dataset.hasChanges = 'true';
        });
        input.addEventListener('input', function() {
            soapForm.dataset.hasChanges = 'true';
        });
    });
    
    // Form submission handler
    soapForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return false;
        }
        
        // Get current room ID
        const roomId = roomIdInput.value;
        const roomIndex = appointmentRooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
            showAlert('Room not found. Please try again.', 'danger');
            return false;
        }
        
        // Check if we have pet_id from the database query
        const petId = document.getElementById('petIdField') ? 
            document.getElementById('petIdField').value : null;
        
        // Collect form data
        const soapData = {
            timestamp: new Date().toISOString(),
            pet_id: petId, // Store pet_id when available for improved data consistency
            patient: {
                name: document.getElementById('patientName').value,
                species: document.getElementById('patientSpecies').value,
                breed: document.getElementById('patientBreed').value,
                age: document.getElementById('patientAge').value,
                gender: document.getElementById('patientGender').value
            },
            owner: document.getElementById('ownerName').value,
            appointmentDate: document.getElementById('appointmentDate').value,
            soap: {
                subjective: {
                    mainNotes: document.getElementById('subjectiveNotes').value
                },
                objective: {
                    vitals: {
                        temperature: document.getElementById('temperature').value,
                        pulse: document.getElementById('pulse').value,
                        respiration: document.getElementById('respiration').value,
                        weight: document.getElementById('weight').value
                    },
                    examination: document.getElementById('objectiveNotes').value
                },
                assessment: {
                    mainNotes: document.getElementById('assessmentNotes').value
                },
                plan: {
                    treatment: document.getElementById('treatmentPlan').value,
                    diagnostic: document.getElementById('diagnosticPlan').value,
                    clientEducation: document.getElementById('clientEducation').value
                }
            }
        };
        
        try {
            // Determine if this is an appointment-based room or standalone
            const isAppointmentBased = appointmentRooms[roomIndex].appointment_id ? true : false;
            
            // Create updated room data based on the room type - store SOAP data client-side only
            let updatedRoomData = {
                ...appointmentRooms[roomIndex],
                status: 'active',
                lastUpdated: new Date().toISOString()
            };
            
            // Always update the patientName and clientName regardless of room type
            updatedRoomData.patientName = document.getElementById('patientName').value;
            updatedRoomData.patientSpecies = document.getElementById('patientSpecies').value;
            updatedRoomData.patientBreed = document.getElementById('patientBreed').value;
            updatedRoomData.clientName = document.getElementById('ownerName').value;
            
            // Update room status via API (without SOAP data)
            await api.rooms.update(roomId, {
                status: 'active'
            });
            
            // Store SOAP data in local data structure only
            if (isAppointmentBased) {
                // For appointment-based rooms
                appointmentRooms[roomIndex] = {
                    ...updatedRoomData,
                    soap_data: soapData
                };
            } else {
                // For standalone rooms, preserve patient and client info
                const existingSoapData = appointmentRooms[roomIndex].soap_data || {};
                
                appointmentRooms[roomIndex] = {
                    ...updatedRoomData,
                    soap_data: {
                        patientName: document.getElementById('patientName').value,
                        patientSpecies: document.getElementById('patientSpecies').value,
                        patientBreed: document.getElementById('patientBreed').value,
                        pet_id: petId, // Store pet_id when available
                        clientId: existingSoapData.clientId || appointmentRooms[roomIndex].clientId,
                        clientName: document.getElementById('ownerName').value,
                        originalSoapData: soapData
                    }
                };
            }
            
            // Reset form change tracking
            soapForm.dataset.hasChanges = 'false';
            
            // Show success message
            showAlert('SOAP note saved successfully!', 'success');
            
            // Update active rooms display
            displayActiveRooms();
        } catch (error) {
            console.error('Error saving SOAP note:', error);
            showAlert('Failed to save SOAP note. Please try again.', 'danger');
        }
        
        return false;
    });
    
    // Clear form button handler
    clearFormButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the form? All unsaved data will be lost.')) {
            // Keep the patient name from the room
            const patientName = document.getElementById('patientName').value;
            
            soapForm.reset();
            
            // Restore the patient name and room ID
            document.getElementById('patientName').value = patientName;
            roomIdInput.value = currentRoom;
            
            removeValidationErrors();
            soapForm.dataset.hasChanges = 'true';
        }
    });
    
    // Form validation function
    function validateForm() {
        let isValid = true;
        removeValidationErrors();
        
        // Required fields
        const requiredFields = [
            { id: 'patientName', label: 'Patient Name' },
            { id: 'patientSpecies', label: 'Species' },
            { id: 'ownerName', label: 'Owner Name' },
            { id: 'appointmentDate', label: 'Appointment Date' }
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                showValidationError(element, `${field.label} is required`);
                isValid = false;
            }
        });
        
        // At least one of the SOAP sections needs to have content
        const soapSections = [
            document.getElementById('subjectiveNotes'),
            document.getElementById('objectiveNotes'),
            document.getElementById('assessmentNotes'),
            document.getElementById('treatmentPlan')
        ];
        
        const hasSoapContent = soapSections.some(section => section.value.trim() !== '');
        
        if (!hasSoapContent) {
            showAlert('At least one SOAP section must be filled out', 'danger');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show validation error for a field
    function showValidationError(element, message) {
        element.classList.add('is-invalid');
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback';
        feedbackDiv.textContent = message;
        
        element.parentNode.appendChild(feedbackDiv);
    }
    
    // Remove all validation errors
    function removeValidationErrors() {
        document.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });
    }
    
    // Display alert message
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    // Display active rooms
    function displayActiveRooms() {
        console.log('displayActiveRooms called, activeRoomsContainer:', activeRoomsContainer);
        
        if (!activeRoomsContainer) {
            console.error('activeRoomsContainer not found in the DOM');
            return;
        }
        
        activeRoomsContainer.innerHTML = '';
        
        // Filter active rooms
        const activeRooms = appointmentRooms.filter(room => room.status === 'active');
        console.log('Active rooms count:', activeRooms.length);
        
        if (activeRooms.length === 0) {
            activeRoomsContainer.innerHTML = '<p class="text-muted">No active appointment rooms. Create one to start.</p>';
            return;
        }
        
        // Debug rooms data
        console.log('Active rooms:', activeRooms);
        
        // Sort rooms by creation date (newest first)
        activeRooms.sort((a, b) => {
            // Handle possible invalid dates
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            
            // If either date is invalid, use timestamp comparison
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return b.id ? b.id.toString().localeCompare(a.id ? a.id.toString() : '') : -1;
            }
            
            return dateB - dateA;
        });
        
        activeRooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-card card';
            roomElement.style.width = '180px';
            
            // Add 'active' class if this is the current room
            if (currentRoom === room.id) {
                roomElement.classList.add('active-room');
            }
            
            // Status indicator based on SOAP completion
            let statusClass = 'bg-warning';
            let statusText = 'Pending';
            
            if (room.soap_data) {
                statusClass = 'bg-success';
                statusText = 'Completed';
            }
            
            // Check if this room is from a confirmed appointment
            const isFromAppointment = room.appointment_id ? true : false;
            const appointmentBadge = isFromAppointment ? 
                '<span class="badge bg-info mb-1">Scheduled</span>' : '';
            
            // Get safe values for display - handle undefined/null values
            const patientName = room.patientName || 'Unnamed Patient';
            const clientName = room.clientName || 'N/A';
            const createdAt = room.createdAt || null;
            
            roomElement.innerHTML = `
                <div class="card-body">
                    <h6 class="card-title">${patientName}</h6>
                    <p class="card-text">
                        <small class="text-muted">Owner: ${clientName}</small><br>
                        <small class="text-muted">Created: ${formatDate(createdAt)}</small>
                    </p>
                    ${appointmentBadge}
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-primary open-room" data-room-id="${room.id}">Open</button>
                    <button class="btn btn-sm btn-danger close-room" data-room-id="${room.id}">Close</button>
                </div>
            `;
            
            activeRoomsContainer.appendChild(roomElement);
            
            // Add event listeners
            roomElement.querySelector('.open-room').addEventListener('click', function() {
                openRoom(room.id);
            });
            
            roomElement.querySelector('.close-room').addEventListener('click', function() {
                completeRoom(room.id);
            });
        });
        
        console.log('displayActiveRooms completed, rooms rendered:', activeRooms.length);
    }
    
    // Open a room
    async function openRoom(roomId) {
        const room = appointmentRooms.find(r => r.id === roomId);
        if (!room) return;
        
        // Check if there are unsaved changes in the current room
        if (currentRoom && soapForm.dataset.hasChanges === 'true') {
            if (!confirm('You have unsaved changes. Are you sure you want to open another room?')) {
                return;
            }
        }
        
        // Set current room
        currentRoom = roomId;
        roomIdInput.value = roomId;
        
        // Hide the appointment rooms card - select the card that contains activeRooms
        const appointmentRoomsCard = document.querySelector('#activeRooms').closest('.card');
        appointmentRoomsCard.style.display = 'none';
        
        // Determine if this is an appointment-based room or standalone
        const isAppointmentBased = room.appointment_id ? true : false;
        
        // For appointment-based rooms, we may need to get patient info differently
        let patientName = room.patientName || 'Unnamed Patient';
        let patientSpecies = room.patientSpecies || '';
        let patientBreed = room.patientBreed || '';
        let clientName = room.clientName || 'N/A';
        let petId = null;
        // Show loading indicator
        showAlert('Loading patient data...', 'info');
        
        if (isAppointmentBased) {
            // For appointment-based rooms, use the properties directly if available
            patientName = room.patientName || '';
            patientSpecies = room.patientSpecies || '';
            patientBreed = room.patientBreed || '';
            clientName = room.clientName || '';
            
            // Try to get the pet_id for database lookup
            try {
                const appointmentSql = `SELECT ccp.pet_id 
                                      FROM clinic_client_appointment cca
                                      JOIN clinic_client_pets ccp ON cca.client_pet_id = ccp.client_pet_id
                                      WHERE cca.appointment_id = ${room.appointment_id}`;
                
                const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/execute-query`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: appointmentSql })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        petId = data[0].pet_id;
                    }
                }
            } catch (error) {
                console.warn('Could not get pet_id from appointment:', error);
            }
            
            currentRoomTitle.textContent = `Room: ${patientName} (Scheduled)`;
        } else {
            // For standalone rooms, extract info from soap_data
            if (room.soap_data && typeof room.soap_data === 'object') {
                patientName = room.soap_data.patientName || '';
                patientSpecies = room.soap_data.patientSpecies || '';
                patientBreed = room.soap_data.patientBreed || '';
                clientName = room.soap_data.clientName || '';
                
                // Check if pet_id is stored
                if (room.soap_data.pet_id) {
                    petId = room.soap_data.pet_id;
                }
            }
            
            currentRoomTitle.textContent = `Room: ${patientName}`;
        }
        
        // Reset form and fill with room data
        soapForm.reset();
        
        // Try to get detailed patient data from database if we have a pet_id
        let patientDetails = null;
        if (petId) {
            try {
                patientDetails = await api.clients.getPatientDetails(petId);
                
                if (patientDetails) {
                    // Store pet_id in form
                    document.getElementById('petIdField').value = petId;
                    
                    // Update with more accurate data from the database
                    patientName = patientDetails.name || patientName;
                    patientSpecies = patientDetails.species || patientSpecies;
                    patientBreed = patientDetails.breed || patientBreed;
                    clientName = patientDetails.owner_name || clientName;
                    
                    // Update the room data in the appointmentRooms array so it will display correctly on cards
                    const roomIndex = appointmentRooms.findIndex(r => r.id === roomId);
                    if (roomIndex !== -1) {
                        appointmentRooms[roomIndex].patientName = patientName;
                        appointmentRooms[roomIndex].patientSpecies = patientSpecies;
                        appointmentRooms[roomIndex].patientBreed = patientBreed;
                        appointmentRooms[roomIndex].clientName = clientName;
                        
                        // Save the updated data to local storage
                        saveRoomsToStorage();
                    }
                    
                    // Add a note about previous appointments
                    if (patientDetails.appointment_history && patientDetails.appointment_history.length > 0) {
                        // Filter out current appointment from history if present
                        const currentAppointmentId = room.appointment_id;
                        const filteredHistory = patientDetails.appointment_history.filter(apt => {
                            // Don't show the current appointment in history
                            return apt.room_id !== roomId && (!currentAppointmentId || apt.appointment_id !== currentAppointmentId);
                        });
                        
                        // Only create history section if there are previous appointments
                        if (filteredHistory.length > 0) {
                            // Create the appointment history section
                            let historySection = document.getElementById('appointmentHistorySection');
                            
                            if (!historySection) {
                                // Create the appointment history section
                                historySection = document.createElement('div');
                                historySection.id = 'appointmentHistorySection';
                                historySection.className = 'card mb-3';
                                historySection.innerHTML = `
                                    <div class="card-header bg-info text-white">
                                        <h5>Previous Visits</h5>
                                    </div>
                                    <div class="card-body">
                                        <ul id="appointmentHistoryList" class="list-group"></ul>
                                    </div>
                                `;
                                
                                // Insert before the first SOAP section
                                const firstSoapSection = document.querySelector('.card.mb-3:has(.bg-info)');
                                if (firstSoapSection) {
                                    firstSoapSection.parentNode.insertBefore(historySection, firstSoapSection);
                                } else {
                                    // Fallback: add to the end of the form
                                    document.getElementById('soapForm').appendChild(historySection);
                                }
                            }
                            
                            // Fill the history list
                            const historyList = document.getElementById('appointmentHistoryList');
                            historyList.innerHTML = '';
                            
                            filteredHistory.forEach(appointment => {
                                const li = document.createElement('li');
                                li.className = 'list-group-item';
                                
                                // Format the date nicely
                                let formattedDate = 'Unknown date';
                                try {
                                    if (appointment.appointment_date) {
                                        const date = new Date(appointment.appointment_date);
                                        formattedDate = date.toLocaleDateString();
                                    }
                                } catch (e) {
                                    console.error('Error formatting appointment date:', e);
                                }
                                
                                // Include service name if available
                                const serviceName = appointment.service_name || 'General visit';
                                
                                li.innerHTML = `
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <strong>${formattedDate}</strong> - ${serviceName}
                                        </div>
                                        <button class="btn btn-sm btn-outline-primary view-history-btn" 
                                            data-room-id="${appointment.room_id}">
                                            View Notes
                                        </button>
                                    </div>
                                `;
                                historyList.appendChild(li);
                            });
                            
                            // Add event listeners to history buttons
                            document.querySelectorAll('.view-history-btn').forEach(btn => {
                                btn.addEventListener('click', function() {
                                    const historyRoomId = this.getAttribute('data-room-id');
                                    // TODO: Implement viewing previous SOAP notes
                                    console.log('View history for room:', historyRoomId);
                                    showAlert('Previous visit notes feature coming soon!', 'info');
                                });
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to get detailed patient info:', error);
            }
        }
        
        // Fill overview card
        overviewPatientName.textContent = patientName;
        overviewPatientSpecies.textContent = patientSpecies || 'Not specified';
        overviewPatientBreed.textContent = patientBreed || 'Not specified';
        overviewOwnerName.textContent = clientName;
        
        // Set appointment date
        let appointmentDate = '';
        if (room.soap_data && room.soap_data.appointmentDate) {
            appointmentDate = room.soap_data.appointmentDate;
        } else {
            appointmentDate = new Date().toISOString().split('T')[0];
        }
        overviewAppointmentDate.textContent = appointmentDate;
        
        // Set room status
        overviewStatus.textContent = room.status.charAt(0).toUpperCase() + room.status.slice(1);
        overviewStatus.className = `badge ${room.status === 'active' ? 'bg-primary' : 'bg-secondary'}`;
        
        if (room.soap_data) {
            // Determine what kind of soap_data we have
            const data = isAppointmentBased 
                ? room.soap_data 
                : (room.soap_data.originalSoapData || room.soap_data);
            
            if (data) {
                // Fill form with existing SOAP data
                
                // Patient info
                document.getElementById('patientName').value = patientName || (data.patient ? data.patient.name : '');
                document.getElementById('patientSpecies').value = patientSpecies || (data.patient ? data.patient.species : '');
                document.getElementById('patientBreed').value = patientBreed || (data.patient ? data.patient.breed : '');
                document.getElementById('patientAge').value = data.patient ? data.patient.age : '';
                document.getElementById('patientGender').value = data.patient ? data.patient.gender : '';
                
                // Owner info
                document.getElementById('ownerName').value = clientName || data.owner || '';
                document.getElementById('appointmentDate').value = data.appointmentDate || '';
                
                // SOAP sections - main notes
                if (data.soap) {
                    document.getElementById('subjectiveNotes').value = data.soap.subjective ? data.soap.subjective.mainNotes || '' : '';
                    
                    if (data.soap.objective) {
                        if (data.soap.objective.vitals) {
                            document.getElementById('temperature').value = data.soap.objective.vitals.temperature || '';
                            document.getElementById('pulse').value = data.soap.objective.vitals.pulse || '';
                            document.getElementById('respiration').value = data.soap.objective.vitals.respiration || '';
                            document.getElementById('weight').value = data.soap.objective.vitals.weight || '';
                        }
                        document.getElementById('objectiveNotes').value = data.soap.objective.examination || '';
                    }
                    
                    document.getElementById('assessmentNotes').value = data.soap.assessment ? data.soap.assessment.mainNotes || '' : '';
                    
                    if (data.soap.plan) {
                        document.getElementById('treatmentPlan').value = data.soap.plan.treatment || '';
                        document.getElementById('diagnosticPlan').value = data.soap.plan.diagnostic || '';
                        document.getElementById('clientEducation').value = data.soap.plan.clientEducation || '';
                    }
                }
            }
        } else {
            // Set basic info for a new room
            document.getElementById('patientName').value = patientName;
            
            // Set species and breed if available
            if (patientSpecies) {
                document.getElementById('patientSpecies').value = patientSpecies;
            }
            
            if (patientBreed) {
                document.getElementById('patientBreed').value = patientBreed;
            }
            
            // Find client info
            if (room.clientId) {
                document.getElementById('ownerName').value = clientName;
            }
            
            // Set today's date as default appointment date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('appointmentDate').value = today;
        }
        
        // Show the SOAP container and Overview card, hide SOAP form
        soapContainer.style.display = 'block';
        roomOverviewCard.style.display = 'block';
        soapFormContainer.style.display = 'none';
        
        // Reset change tracking
        soapForm.dataset.hasChanges = 'false';
        
        // Update active rooms display but keep it hidden
        displayActiveRooms();
        
        // Clear loading message
        const alertElements = document.querySelectorAll('.alert-info');
        alertElements.forEach(element => {
            if (element.textContent.includes('Loading patient data')) {
                element.remove();
            }
        });
        
        // Scroll to form
        soapContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Close current room
    function closeCurrentRoom() {
        currentRoom = null;
        soapContainer.style.display = 'none';
        roomOverviewCard.style.display = 'none';
        soapFormContainer.style.display = 'none';
        soapForm.reset();
        soapForm.dataset.hasChanges = 'false';
        
        // Show the appointment rooms card again
        const roomsCard = document.querySelector('#activeRooms').closest('.card');
        roomsCard.style.display = 'block';
    }
    
    // Complete and archive a room
    async function completeRoom(roomId) {
        if (!confirm('Are you sure you want to close this appointment room?')) {
            return;
        }
        
        const roomIndex = appointmentRooms.findIndex(room => room.id === roomId);
        if (roomIndex === -1) return;
        
        // If this is the currently open room, close it
        if (currentRoom === roomId) {
            closeCurrentRoom();
        }
        
        try {
            // Update room status - the database trigger will handle the appointment status update
            const updatedRoomData = {
                ...appointmentRooms[roomIndex],
                status: 'completed',
                completedAt: new Date().toISOString()
            };
            
            // Update room via API - this will trigger the after_appointment_room_update trigger
            await api.rooms.update(roomId, updatedRoomData);
            
            // Update local data
            appointmentRooms[roomIndex] = updatedRoomData;
            
            // Update display
            displayActiveRooms();
            
            showAlert('Appointment room closed successfully.', 'info');
        } catch (error) {
            console.error('Error closing room:', error);
            showAlert('Failed to close appointment room. Please try again.', 'danger');
        }
    }
    
    // Format date
    function formatDate(dateString) {
        if (!dateString) return 'Not available';
        
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Not available';
            }
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Not available';
        }
    }
    
    // Delete a record
    async function deleteRecord(recordId) {
        if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            try {
                // Delete via API
                await api.rooms.delete(recordId);
                
                // Update local data
                appointmentRooms = appointmentRooms.filter(room => room.id !== recordId);
                
                // Update displays
                displayAppointmentHistory();
                displayActiveRooms();
                
                showAlert('Record deleted successfully.', 'success');
            } catch (error) {
                console.error('Error deleting record:', error);
                showAlert('Failed to delete record. Please try again.', 'danger');
            }
        }
    }
    
    // Display appointment history in modal
    function displayAppointmentHistory() {
        const historyContent = document.getElementById('appointmentHistoryContent');
        historyContent.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch all rooms (both active and completed)
        api.rooms.getAll()
            .then(rooms => {
                historyContent.innerHTML = '';
                
                // Store in local variable
                appointmentRooms = rooms;
                
                if (rooms.length === 0) {
                    historyContent.innerHTML = '<p class="text-center">No appointment records found.</p>';
                    return;
                }
                
                // Sort rooms by creation date (newest first)
                rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                rooms.forEach(room => {
                    // Skip rooms without SOAP data
                    if (!room.soapData) return;
                    
                    const recordElement = document.createElement('div');
                    recordElement.className = 'soap-record';
                    
                    const createdDate = new Date(room.createdAt);
                    const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
                    
                    const data = room.soapData;
                    
                    recordElement.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>${data.patient.name} (${data.patient.species})</h5>
                            <div>
                                <span class="badge ${room.status === 'active' ? 'bg-primary' : 'bg-secondary'}">${room.status}</span>
                                <span class="badge bg-dark">${formattedDate}</span>
                                <button class="btn btn-sm btn-danger ms-2 delete-record" data-id="${room.id}">Delete</button>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Owner:</strong> ${data.owner}</p>
                                <p><strong>Appointment Date:</strong> ${data.appointmentDate}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Breed:</strong> ${data.patient.breed || 'N/A'}</p>
                                <p><strong>Age:</strong> ${data.patient.age || 'N/A'} | <strong>Gender:</strong> ${data.patient.gender || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="soap-section">
                            <h6>S - Subjective</h6>
                            <p>${data.soap.subjective.mainNotes || 'None recorded'}</p>
                        </div>
                        
                        <div class="soap-section">
                            <h6>O - Objective</h6>
                            <div class="row mb-2">
                                <div class="col-md-3"><small>Temp: ${data.soap.objective.vitals.temperature || 'N/A'}°F</small></div>
                                <div class="col-md-3"><small>Pulse: ${data.soap.objective.vitals.pulse || 'N/A'} bpm</small></div>
                                <div class="col-md-3"><small>Resp: ${data.soap.objective.vitals.respiration || 'N/A'} rpm</small></div>
                                <div class="col-md-3"><small>Weight: ${data.soap.objective.vitals.weight || 'N/A'} kg</small></div>
                            </div>
                            <p>${data.soap.objective.examination || 'None recorded'}</p>
                        </div>
                        
                        <div class="soap-section">
                            <h6>A - Assessment</h6>
                            <p>${data.soap.assessment.mainNotes || 'None recorded'}</p>
                        </div>
                        
                        <div class="soap-section">
                            <h6>P - Plan</h6>
                            <p><strong>Treatment:</strong> ${data.soap.plan.treatment || 'None recorded'}</p>
                            <p><strong>Diagnostics:</strong> ${data.soap.plan.diagnostic || 'None recorded'}</p>
                            <p><strong>Client Education:</strong> ${data.soap.plan.clientEducation || 'None recorded'}</p>
                        </div>
                    `;
                    
                    historyContent.appendChild(recordElement);
                    
                    // Add event listener for delete button
                    const deleteButton = recordElement.querySelector('.delete-record');
                    deleteButton.addEventListener('click', function() {
                        const recordId = this.getAttribute('data-id');
                        deleteRecord(recordId);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading appointment history:', error);
                historyContent.innerHTML = '<div class="alert alert-danger">Failed to load appointment history. Please try again later.</div>';
            });
    }
    
    // Add event listener for modal opening
    const historyModal = document.getElementById('appointmentHistoryModal');
    historyModal.addEventListener('show.bs.modal', function() {
        displayAppointmentHistory();
    });
    
    // Reset client search when modal opens
    document.getElementById('addClientModal').addEventListener('show.bs.modal', function() {
        // Clear previous search
        clientSearchInput.value = '';
        
        // Show loading indicator
        clientSearchResults.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Load all clients by default
        loadAllClients();
    });
    
    // Function to load all clients
    async function loadAllClients() {
        try {
            const allClients = await api.clients.getAll();
            displaySearchResults(allClients);
        } catch (error) {
            console.error('Error loading all clients:', error);
            clientSearchResults.innerHTML = `
                <div class="alert alert-danger">
                    <p>Could not load client list. ${error.message}</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="loadAllClients()">Try Again</button>
                </div>`;
        }
    }
    
    // Function to display search results
    function displaySearchResults(results) {
        clientSearchResults.innerHTML = '';
        
        if (!results || results.length === 0) {
            clientSearchResults.innerHTML = '<div class="alert alert-info">No clients found. Please contact the administrator to add new clients.</div>';
            return;
        }
        
        // Store clients for later use
        clients = results;
        
        // Create results table
        const table = document.createElement('table');
        table.className = 'table table-hover';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Patients / Appointments</th>
            </tr>
        `;
        
        const tbody = document.createElement('tbody');
        
        results.forEach(client => {
            const tr = document.createElement('tr');
            
            // Check if client has confirmed appointments with room_status "Not Created"
            const hasAppointments = client.appointments && client.appointments.length > 0;
            
            // Patient list and/or appointment list
            let patientsHtml = '';
            
            if (hasAppointments) {
                // Display appointments that need rooms
                patientsHtml += '<div class="mb-3"><strong>Confirmed Appointments:</strong></div>';
                
                client.appointments.forEach(appointment => {
                    try {
                        // Find the matching patient from the patient list
                        const patient = client.patients.find(p => p.id === appointment.pet_id) || {};
                        
                        // Ensure all needed fields have fallback values
                        const petName = appointment.pet_name || 'Unnamed Pet';
                        const serviceName = appointment.service_name || 'Unspecified Service';
                        const formattedDate = appointment.formatted_date || 'Date not set';
                        const formattedTime = appointment.formatted_time || 'Time not set';
                        
                        patientsHtml += `
                            <div class="card mb-2">
                                <div class="card-body p-2">
                                    <h6 class="card-title">${petName}</h6>
                                    <p class="card-text mb-1">
                                        <small>${serviceName} | ${formattedDate} at ${formattedTime}</small>
                                    </p>
                                    <button class="btn btn-sm btn-success create-room-from-appointment" 
                                        data-client-id="${client.id}" 
                                        data-appointment-id="${appointment.appointment_id}"
                                        data-pet-name="${petName}"
                                        data-pet-species="${patient.species || ''}"
                                        data-pet-breed="${patient.breed || ''}">
                                        Create Room
                                    </button>
                                </div>
                            </div>
                        `;
                    } catch (cardError) {
                        console.error('Error creating appointment card:', cardError, appointment);
                        // Include a fallback card when there's an error
                        patientsHtml += `
                            <div class="card mb-2 border-danger">
                                <div class="card-body p-2">
                                    <h6 class="card-title">Appointment</h6>
                                    <p class="card-text mb-1">
                                        <small>Error displaying appointment details</small>
                                    </p>
                                </div>
                            </div>
                        `;
                    }
                });
                
                // Add separator if there are also regular patients
                if (client.patients && client.patients.length > 0) {
                    patientsHtml += '<hr>';
                }
            }
            
            // Regular patients list
            if (client.patients && client.patients.length > 0) {
                patientsHtml += '<div class="mb-2"><strong>Patients:</strong></div>';
                patientsHtml += '<div class="d-flex flex-wrap patient-cards-container" id="patient-cards-' + client.id + '"></div>';
            } else if (!hasAppointments) {
                patientsHtml = '<em class="text-muted">No patients</em>';
            }
            
            tr.innerHTML = `
                <td>${client.name}</td>
                <td>
                    ${client.phone ? `<div><i class="fas fa-phone-alt"></i> ${client.phone}</div>` : ''}
                    ${client.email ? `<div><i class="fas fa-envelope"></i> ${client.email}</div>` : ''}
                </td>
                <td>${patientsHtml}</td>
            `;
            
            tbody.appendChild(tr);
            
            // If client has patients, add them to the container with attached event listeners
            if (client.patients && client.patients.length > 0) {
                // We need to add the cards after the tr is added to the DOM
                setTimeout(() => {
                    const patientCardsContainer = document.getElementById('patient-cards-' + client.id);
                    
                    if (patientCardsContainer) {
                        client.patients.forEach(patient => {
                            const cardDiv = document.createElement('div');
                            cardDiv.className = 'card me-2 mb-2 patient-card';
                            cardDiv.style.minWidth = '150px';
                            cardDiv.style.maxWidth = '200px';
                            
                            const patientName = patient.name || 'Unnamed Pet';
                            const patientSpecies = patient.species || '';
                            const patientBreed = patient.breed || '';
                            
                            cardDiv.innerHTML = `
                                <div class="card-body p-2">
                                    <h6 class="card-title">${patientName}</h6>
                                    <p class="card-text mb-1">
                                        <small>${patientSpecies} ${patientBreed}</small>
                                    </p>
                                    <button class="btn btn-sm btn-primary w-100">Create Room</button>
                                </div>
                            `;
                            
                            const button = cardDiv.querySelector('button');
                            button.onclick = function() {
                                console.log('Direct onclick handler called for', patientName);
                                createAppointmentRoom(patientName, client, patientSpecies, patientBreed);
                            };
                            
                            patientCardsContainer.appendChild(cardDiv);
                        });
                    } else {
                        console.error('Patient cards container not found for client ID:', client.id);
                    }
                }, 50); // Increased timeout to ensure DOM is ready
            }
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        clientSearchResults.appendChild(table);
        
        // Add event listeners for create room from appointment buttons
        // This properly attaches click handlers to any appointment buttons that were just created
        document.querySelectorAll('.create-room-from-appointment').forEach(btn => {
            btn.addEventListener('click', function() {
                const clientId = this.getAttribute('data-client-id');
                const appointmentId = this.getAttribute('data-appointment-id');
                const patientName = this.getAttribute('data-pet-name');
                const patientSpecies = this.getAttribute('data-pet-species');
                const patientBreed = this.getAttribute('data-pet-breed');
                
                // Find client
                const client = clients.find(c => c.id === clientId);
                
                // Check if client exists, if not create a minimal client object
                if (!client) {
                    console.warn(`Client with ID ${clientId} not found in clients array. Creating minimal client object.`);
                    const minimalClient = {
                        id: clientId,
                        name: 'Client #' + clientId  // Fallback name
                    };
                    
                    // Create appointment room with appointment ID
                    createAppointmentRoomFromAppointment(patientName, minimalClient, appointmentId, patientSpecies, patientBreed);
                } else {
                    // Create appointment room with appointment ID
                    createAppointmentRoomFromAppointment(patientName, client, appointmentId, patientSpecies, patientBreed);
                }
            });
        });
    }
    
    // Add handlers for custom SOAP form
    if (createCustomSoapBtn) {
        createCustomSoapBtn.addEventListener('click', function() {
            // Open the custom SOAP form modal
            const createSoapFormModal = new bootstrap.Modal(document.getElementById('createSoapFormModal'));
            createSoapFormModal.show();
            
            // Set the current room ID in the form
            document.getElementById('customFormRoomId').value = currentRoom;
            
            // Reset form if needed
            resetCustomSoapForm();
        });
    }
    
    // Initialize room-specific API functionality
    if (typeof api !== 'undefined') {
        // Add room templates API 
        api.roomTemplates = {
            get: async function(roomId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/room-templates?room_id=${roomId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching room template:', error);
                    throw error;
                }
            },
            
            create: async function(roomId, templateData) {
                try {
                    const response = await fetch(`${API_BASE_URL}/clinic-appointments-SOAP.php/room-templates`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            room_id: roomId,
                            template_data: templateData
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error creating room template:', error);
                    throw error;
                }
            }
        };
    }
    
    // Add question type change listener
    if (customQuestionType) {
        customQuestionType.addEventListener('change', function() {
            // Show options container if the question type requires options
            const requiresOptions = ['select', 'checkbox', 'radio'].includes(this.value);
            document.getElementById('customOptionsContainer').style.display = requiresOptions ? 'block' : 'none';
        });
    }
    
    // Add listeners for add question buttons
    document.querySelectorAll('.add-question-btn').forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-category');
            const categoryName = this.getAttribute('data-category-name');
            
            // Set the category in the modal
            document.getElementById('questionCategoryId').value = categoryId;
            document.getElementById('questionCategoryName').textContent = categoryName;
            
            // Reset the form
            document.getElementById('customQuestionForm').reset();
            document.getElementById('customOptionsContainer').style.display = 'none';
            
            // Open the modal
            const addCustomQuestionModal = new bootstrap.Modal(document.getElementById('addCustomQuestionModal'));
            addCustomQuestionModal.show();
        });
    });
    
    // Global custom questions storage
    window.customQuestions = {
        1: [], // Subjective
        2: [], // Objective
        3: [], // Assessment
        4: []  // Plan
    };
    
    // Function to reset the custom SOAP form
    window.resetCustomSoapForm = function() {
        // Clear all questions
        window.customQuestions = {
            1: [], // Subjective
            2: [], // Objective
            3: [], // Assessment
            4: []  // Plan
        };
        
        // Update the UI
        renderCustomQuestions();
    };
    
    // Function to render custom questions in the form
    function renderCustomQuestions() {
        // Clear all question lists
        document.querySelectorAll('.soap-question-list').forEach(list => {
            list.innerHTML = '';
        });
        
        // Render questions for each category
        for (const categoryId in window.customQuestions) {
            const questions = window.customQuestions[categoryId];
            const categoryName = getCategoryName(categoryId);
            const listId = categoryName.toLowerCase() + 'Questions';
            const list = document.getElementById(listId);
            
            if (!list) continue;
            
            questions.forEach((question, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'soap-question-item mb-2 p-2 border rounded';
                
                let options = '';
                if (question.options && question.options.length > 0) {
                    options = `<small class="text-muted">Options: ${question.options.join(', ')}</small>`;
                }
                
                questionElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${question.question_text}</strong>
                            ${question.is_required ? '<span class="text-danger">*</span>' : ''}
                            <div><small class="text-muted">Type: ${question.question_type}</small></div>
                            ${options}
                        </div>
                        <button type="button" class="btn btn-sm btn-danger remove-question" data-category="${categoryId}" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                list.appendChild(questionElement);
            });
        }
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-question').forEach(button => {
            button.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-category');
                const index = parseInt(this.getAttribute('data-index'));
                
                // Remove the question
                window.customQuestions[categoryId].splice(index, 1);
                
                // Update display order for remaining questions
                window.customQuestions[categoryId].forEach((question, idx) => {
                    question.display_order = idx;
                });
                
                // Update the UI
                renderCustomQuestions();
            });
        });
    }
    
    // Helper function to get category name
    function getCategoryName(categoryId) {
        const categories = {
            '1': 'Subjective',
            '2': 'Objective',
            '3': 'Assessment',
            '4': 'Plan'
        };
        
        return categories[categoryId] || 'Unknown';
    }
    
    // Add event listener for add question button in modal
    if (addCustomQuestionBtn) {
        addCustomQuestionBtn.addEventListener('click', function() {
            const categoryId = document.getElementById('questionCategoryId').value;
            const questionText = document.getElementById('customQuestionText').value;
            const questionType = document.getElementById('customQuestionType').value;
            const required = document.getElementById('customQuestionRequired').checked;
            
            // Validate the form
            if (!questionText) {
                alert('Please enter question text');
                return;
            }
            
            // Get options if applicable
            let options = null;
            if (['select', 'checkbox', 'radio'].includes(questionType)) {
                const optionsText = document.getElementById('customQuestionOptions').value;
                if (!optionsText) {
                    alert('Please enter at least one option');
                    return;
                }
                
                // Parse options from textarea
                options = optionsText.split('\n')
                    .map(opt => opt.trim())
                    .filter(opt => opt); // Filter out empty lines
                    
                if (options.length === 0) {
                    alert('Please enter at least one option');
                    return;
                }
            }
            
            // Add the question to the correct category
            const question = {
                category_id: parseInt(categoryId),
                question_text: questionText,
                question_type: questionType,
                is_required: required ? 1 : 0,
                display_order: window.customQuestions[categoryId].length,
                options: options
            };
            
            window.customQuestions[categoryId].push(question);
            
            // Update the UI
            renderCustomQuestions();
            
            // Close the modal
            const addCustomQuestionModal = bootstrap.Modal.getInstance(document.getElementById('addCustomQuestionModal'));
            if (addCustomQuestionModal) {
                addCustomQuestionModal.hide();
            }
        });
    }
    
    // Reusing saveSoapFormBtn from the top of the file
    if (saveSoapFormBtn) {
        saveSoapFormBtn.addEventListener('click', async function() {
            const roomId = document.getElementById('customFormRoomId').value;
            
            // Check if we have at least one question
            const totalQuestions = Object.values(window.customQuestions).reduce((total, questions) => total + questions.length, 0);
            
            if (totalQuestions === 0) {
                alert('Please add at least one question to the SOAP form');
                return;
            }
            
            // Create the template data
            const templateData = {
                questions: []
            };
            
            // Add all questions to the template data
            for (const categoryId in window.customQuestions) {
                templateData.questions = templateData.questions.concat(window.customQuestions[categoryId]);
            }
            
            try {
                showAlert('Creating custom SOAP form...', 'info');
                
                // Save the template
                const result = await api.roomTemplates.create(roomId, templateData);
                
                if (result.success) {
                    // Close the modal
                    const createSoapFormModal = bootstrap.Modal.getInstance(document.getElementById('createSoapFormModal'));
                    if (createSoapFormModal) {
                        createSoapFormModal.hide();
                    }
                    
                    // Load the template
                    await loadRoomTemplate(roomId);
                    
                    showAlert('Custom SOAP form created successfully!', 'success');
                } else {
                    showAlert('Failed to create custom SOAP form. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error creating custom SOAP form:', error);
                showAlert('Error creating custom SOAP form: ' + error.message, 'danger');
            }
        });
    }
    
    // Function to load a room's template
    window.loadRoomTemplate = async function(roomId) {
        const templateSelectPrompt = document.getElementById('templateSelectPrompt');
        const dynamicSoapForm = document.getElementById('dynamicSoapForm');
        
        try {
            // Show loading message
            templateSelectPrompt.innerHTML = '<p class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></p>';
            
            // Fetch the template for this room
            const template = await api.roomTemplates.get(roomId);
            
            if (!template.has_template) {
                // No template found for this room
                templateSelectPrompt.style.display = 'block';
                dynamicSoapForm.style.display = 'none';
                return;
            }
            
            // Template found, render it
            templateSelectPrompt.style.display = 'none';
            dynamicSoapForm.style.display = 'block';
            
            // Group questions by category
            const questionsByCategory = {};
            template.questions.forEach(question => {
                if (!questionsByCategory[question.category_name]) {
                    questionsByCategory[question.category_name] = [];
                }
                questionsByCategory[question.category_name].push(question);
            });
            
            // Clear the form container
            dynamicSoapForm.innerHTML = '';
            
            // Create form elements for each category
            for (const category in questionsByCategory) {
                // Create category section
                const categorySection = document.createElement('div');
                categorySection.className = 'card mb-3';
                categorySection.innerHTML = `
                    <div class="card-header bg-info text-white">
                        <h5>${category}</h5>
                    </div>
                    <div class="card-body" id="category-${category.toLowerCase()}">
                    </div>
                `;
                
                dynamicSoapForm.appendChild(categorySection);
                
                const categoryBody = categorySection.querySelector('.card-body');
                
                // Add questions for this category
                questionsByCategory[category].forEach(question => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'mb-3';
                    
                    // Create the input based on question type
                    let inputHtml = '';
                    const questionValue = ''; // No saved value yet
                    const requiredAttr = question.is_required ? 'required' : '';
                    
                    switch (question.question_type) {
                        case 'text':
                            inputHtml = `
                                <input type="text" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        case 'textarea':
                            inputHtml = `
                                <textarea class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    rows="3"
                                    ${requiredAttr}>${questionValue}</textarea>
                            `;
                            break;
                            
                        case 'number':
                            inputHtml = `
                                <input type="number" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        case 'select':
                            let options = '';
                            if (question.options && Array.isArray(question.options)) {
                                options = question.options.map(opt => 
                                    `<option value="${opt}">${opt}</option>`
                                ).join('');
                            }
                            
                            inputHtml = `
                                <select class="form-select soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    ${requiredAttr}>
                                    <option value="">Select an option</option>
                                    ${options}
                                </select>
                            `;
                            break;
                            
                        case 'checkbox':
                            if (question.options && Array.isArray(question.options)) {
                                inputHtml = '<div>';
                                question.options.forEach(opt => {
                                    inputHtml += `
                                        <div class="form-check">
                                            <input class="form-check-input soap-checkbox" 
                                                type="checkbox" 
                                                id="question-${question.question_id}-${opt}" 
                                                data-question-id="${question.question_id}"
                                                value="${opt}">
                                            <label class="form-check-label" for="question-${question.question_id}-${opt}">
                                                ${opt}
                                            </label>
                                        </div>
                                    `;
                                });
                                inputHtml += '</div>';
                            }
                            break;
                            
                        case 'radio':
                            if (question.options && Array.isArray(question.options)) {
                                inputHtml = '<div>';
                                question.options.forEach(opt => {
                                    inputHtml += `
                                        <div class="form-check">
                                            <input class="form-check-input soap-question" 
                                                type="radio" 
                                                name="question-${question.question_id}" 
                                                id="question-${question.question_id}-${opt}" 
                                                data-question-id="${question.question_id}"
                                                value="${opt}"
                                                ${requiredAttr}>
                                            <label class="form-check-label" for="question-${question.question_id}-${opt}">
                                                ${opt}
                                            </label>
                                        </div>
                                    `;
                                });
                                inputHtml += '</div>';
                            }
                            break;
                            
                        case 'date':
                            inputHtml = `
                                <input type="date" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                            break;
                            
                        default:
                            inputHtml = `
                                <input type="text" class="form-control soap-question" 
                                    id="question-${question.question_id}" 
                                    data-question-id="${question.question_id}"
                                    value="${questionValue}"
                                    ${requiredAttr}>
                            `;
                    }
                    
                    questionDiv.innerHTML = `
                        <label for="question-${question.question_id}" class="form-label">
                            ${question.question_text}
                            ${question.is_required ? '<span class="text-danger">*</span>' : ''}
                        </label>
                        ${inputHtml}
                    `;
                    
                    categoryBody.appendChild(questionDiv);
                });
            }
            
            // Add a save button
            const saveButton = document.createElement('div');
            saveButton.className = 'text-center mt-3';
            saveButton.innerHTML = `
                <button type="button" class="btn btn-primary btn-lg save-responses-btn">
                    <i class="fas fa-save"></i> Save Responses
                </button>
            `;
            
            dynamicSoapForm.appendChild(saveButton);
            
            // Add event listener for save button
            document.querySelector('.save-responses-btn').addEventListener('click', function() {
                saveSoapResponses(roomId);
            });
        } catch (error) {
            console.error('Error loading room template:', error);
            templateSelectPrompt.innerHTML = `
                <div class="alert alert-danger">
                    <p>Error loading custom SOAP form: ${error.message}</p>
                    <button type="button" class="btn btn-outline-primary" id="retryLoadTemplateBtn">Retry</button>
                </div>
            `;
            
            // Add event listener for retry button
            document.getElementById('retryLoadTemplateBtn').addEventListener('click', function() {
                loadRoomTemplate(roomId);
            });
        }
    };
    
    // Function to collect and save SOAP responses
    async function saveSoapResponses(roomId) {
        try {
            const responses = [];
            
            // Collect regular input responses
            document.querySelectorAll('.soap-question').forEach(input => {
                const questionId = input.getAttribute('data-question-id');
                
                // Skip radio buttons that aren't checked
                if (input.type === 'radio' && !input.checked) {
                    return;
                }
                
                responses.push({
                    question_id: questionId,
                    response_text: input.value
                });
            });
            
            // Collect checkbox group responses
            const checkboxGroups = {};
            document.querySelectorAll('.soap-checkbox').forEach(checkbox => {
                const questionId = checkbox.getAttribute('data-question-id');
                
                if (!checkbox.checked) return;
                
                if (!checkboxGroups[questionId]) {
                    checkboxGroups[questionId] = [];
                }
                
                checkboxGroups[questionId].push(checkbox.value);
            });
            
            // Add checkbox group responses
            for (const questionId in checkboxGroups) {
                responses.push({
                    question_id: questionId,
                    response_text: checkboxGroups[questionId].join(',')
                });
            }
            
            // Save responses to API
            await api.soapResponses.save(roomId, responses);
            
            showAlert('SOAP responses saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving SOAP responses:', error);
            showAlert('Error saving SOAP responses: ' + error.message, 'danger');
        }
    }
    
    // Extend openRoom to load room templates
    if (typeof originalOpenRoom === 'undefined') {
        const originalOpenRoom = window.openRoom;
        if (originalOpenRoom) {
            window.openRoom = async function(roomId) {
                // Call the original function first
                await originalOpenRoom.call(this, roomId);
                
                // Load the room template
                await loadRoomTemplate(roomId);
            };
        }
    }
    
    // Add event listeners for select patient buttons
    document.querySelectorAll('.select-patient').forEach(btn => {
        btn.addEventListener('click', function(event) {
            console.log('Select patient button clicked - direct handler');
            event.preventDefault();
            
            
            const clientId = this.getAttribute('data-client-id');
            const patientName = this.getAttribute('data-patient-name');
            const patientSpecies = this.getAttribute('data-patient-species');
            const patientBreed = this.getAttribute('data-patient-breed');
            
            console.log('Button data attributes:', {
                clientId, patientName, patientSpecies, patientBreed
            });
            
            // Find client
            const client = clients.find(c => {
                const cId = c.id ? c.id.toString() : '';
                console.log('Comparing client IDs:', cId, 'vs', clientId);
                return cId === clientId;
            });
            
            console.log('Client found:', client);
            
            if (!client) {
                console.error('Client not found with ID:', clientId);
                showAlert('Error: Client not found. Please refresh and try again.', 'danger');
                return;
            }
            
            // Create appointment room with direct call
            console.log('Directly calling createAppointmentRoom');
            createAppointmentRoom(patientName, client, patientSpecies, patientBreed);
        });
    });
    
    // Add event listeners for create room from appointment buttons
    document.querySelectorAll('.create-room-from-appointment').forEach(btn => {
        btn.addEventListener('click', function(event) {
            console.log('Create room from appointment button clicked - direct handler');
            event.preventDefault();
            
            const clientId = this.getAttribute('data-client-id');
            const appointmentId = this.getAttribute('data-appointment-id');
            const patientName = this.getAttribute('data-pet-name');
            const patientSpecies = this.getAttribute('data-pet-species');
            const patientBreed = this.getAttribute('data-pet-breed');
            
            console.log('Appointment button data:', {
                clientId, appointmentId, patientName, patientSpecies, patientBreed
            });
            
            // Find client
            const client = clients.find(c => {
                const cId = c.id ? c.id.toString() : '';
                return cId === clientId;
            });
            
            console.log('Client found for appointment:', client);
            
            // Check if client exists, if not create a minimal client object
            if (!client) {
                console.warn(`Client with ID ${clientId} not found in clients array. Creating minimal client object.`);
                const minimalClient = {
                    id: clientId,
                    name: 'Client #' + clientId  // Fallback name
                };
                
                // Create appointment room with appointment ID
                console.log('Calling createAppointmentRoomFromAppointment with minimal client');
                createAppointmentRoomFromAppointment(patientName, minimalClient, appointmentId, patientSpecies, patientBreed);
            } else {
                // Create appointment room with appointment ID
                console.log('Calling createAppointmentRoomFromAppointment with found client');
                createAppointmentRoomFromAppointment(patientName, client, appointmentId, patientSpecies, patientBreed);
            }
        });
    });
});


