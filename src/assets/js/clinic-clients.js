let initialClientsLoaded = false; // ✅ Prevents reload on tab toggle
let initialClientsList = [];
let selectedClientPetId = null;   // ✅ Stores which pet ID was selected
let addedClientsList = []; // List for "Added" clients
let selectedClients = []; // Array to track selected clients for batch operations

// Helper function to update selected count
function updateSelectedCount() {
    const countBadge = document.querySelector('.quick-actions-bar .badge');
    if (countBadge) {
        countBadge.textContent = `${selectedClients.length} selected`;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const tabTrigger = document.querySelector('#initial-clients-tab');
    const addedClientsTabTrigger = document.querySelector('#clients-tab'); // Tab for "Added" clients
    const appointmentsTabTrigger = document.querySelector('#appointments-tab');
    const medicalRecordsTabTrigger = document.querySelector('#medical-records-tab');

    // Load initial clients when the "Initial Clients" tab is shown
    tabTrigger?.addEventListener('shown.bs.tab', function () {
        if (!initialClientsLoaded) {
            fetchInitialClients().then(renderInitialClients);
            initialClientsLoaded = true;
        }
    });

    // Load added clients when the "Added Clients" tab is shown
    addedClientsTabTrigger?.addEventListener('shown.bs.tab', function () {
        if (addedClientsList.length === 0) {
            fetchAddedClients().then(renderAddedClients);
        }
    });

    // Check if the "Added Clients" tab is already active on page load
    if (addedClientsTabTrigger && addedClientsTabTrigger.classList.contains('active')) {
        console.log("The Added Clients tab is active on load");
        if (addedClientsList.length === 0) {
            fetchAddedClients().then(renderAddedClients);
        }
    }

    // Search input handler
    const searchInput = document.getElementById('client-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            // Determine which tab is active
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab.id === 'clients') {
                // Filter added clients
                const filteredClients = searchTerm.length > 0 
                    ? addedClientsList.filter(client => 
                        client.client_name.toLowerCase().includes(searchTerm) || 
                        client.pets.some(pet => 
                            pet.pet_name.toLowerCase().includes(searchTerm) ||
                            pet.species.toLowerCase().includes(searchTerm) ||
                            pet.breed.toLowerCase().includes(searchTerm)
                        )
                    )
                    : addedClientsList;
                
                renderAddedClients(filteredClients);
            } else if (activeTab.id === 'initial-clients') {
                // Filter initial clients
                const filteredClients = searchTerm.length > 0 
                    ? initialClientsList.filter(client => 
                        client.client_name.toLowerCase().includes(searchTerm) || 
                        client.pets.some(pet => 
                            pet.pet_name.toLowerCase().includes(searchTerm) ||
                            pet.species.toLowerCase().includes(searchTerm) ||
                            pet.breed.toLowerCase().includes(searchTerm)
                        )
                    )
                    : initialClientsList;
                
                renderInitialClients(filteredClients);
            }
        });
    }

    // Handle "Select All" checkbox
    const selectAllCheckbox = document.getElementById('selectAllClients');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                
                // Get client ID from row
                const row = checkbox.closest('tr');
                if (row) {
                    const clientId = row.dataset.clientId;
                    if (clientId) {
                        if (this.checked) {
                            // Add to selected if not already there
                            if (!selectedClients.includes(clientId)) {
                                selectedClients.push(clientId);
                            }
                        } else {
                            // Remove from selected
                            selectedClients = selectedClients.filter(id => id !== clientId);
                        }
                    }
                }
            });
            
            // Update selected count display
            updateSelectedCount();
        });
    }
    
    // Handle species filter
    const speciesFilter = document.querySelector('select[option="All Species"]');
    if (speciesFilter) {
        speciesFilter.addEventListener('change', function() {
            const species = this.value;
            if (species === 'All Species') {
                // Reset filters
                if (document.querySelector('.tab-pane.active').id === 'clients') {
                    renderAddedClients(addedClientsList);
                } else {
                    renderInitialClients(initialClientsList);
                }
                return;
            }
            
            // Filter by selected species
            if (document.querySelector('.tab-pane.active').id === 'clients') {
                const filteredClients = addedClientsList.filter(client => 
                    client.pets.some(pet => pet.species === species)
                );
                renderAddedClients(filteredClients);
            } else {
                const filteredClients = initialClientsList.filter(client => 
                    client.pets.some(pet => pet.species === species)
                );
                renderInitialClients(filteredClients);
            }
        });
    }
    
    // Initialize client notes modal triggers
    initClientNotesTriggers();
    
    // Clear filters button
    const clearFiltersBtn = document.querySelector('.btn-outline-danger');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Reset search input
            const searchInput = document.getElementById('client-search');
            if (searchInput) searchInput.value = '';
            
            // Reset filter dropdowns
            const filterSelects = document.querySelectorAll('.search-filter-container select');
            filterSelects.forEach(select => {
                select.selectedIndex = 0;
            });
            
            // Reset to show all clients
            if (document.querySelector('.tab-pane.active').id === 'clients') {
                renderAddedClients(addedClientsList);
            } else {
                renderInitialClients(initialClientsList);
            }
        });
    }
});

// Helper function to update selected count
function updateSelectedCount() {
    const countBadge = document.querySelector('.quick-actions-bar .badge');
    if (countBadge) {
        countBadge.textContent = `${selectedClients.length} selected`;
    }
}

// Function to initialize client notes modal triggers
function initClientNotesTriggers() {
    // Add event listeners to "Add Note" buttons that might be in dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        // Check if we need to add a "Add Note" option to each dropdown
        if (!menu.querySelector('.add-note-btn')) {
            const addNoteItem = document.createElement('li');
            addNoteItem.innerHTML = `<a class="dropdown-item add-note-btn" href="#"><i class="bi bi-journal-text me-1"></i> Add Note</a>`;
            
            // Add it before the divider if it exists
            const divider = menu.querySelector('.dropdown-divider');
            if (divider) {
                menu.insertBefore(addNoteItem, divider);
            } else {
                menu.appendChild(addNoteItem);
            }
        }
    });
    
    // Now attach event listeners to all add-note buttons
    document.querySelectorAll('.add-note-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get client info from the row
            const row = this.closest('tr');
            if (!row) return;
            
            const clientName = row.querySelector('.user-role')?.previousElementSibling?.textContent.trim() || 'Client';
            
            // Set the modal title to include client name
            const modalTitle = document.querySelector('#clientNotesModal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = `Notes for ${clientName}`;
            }
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('clientNotesModal'));
            modal.show();
        });
    });
}

// Update client row rendering to include checkbox
function renderClientRow(client, pet, isPetRow = true) {
    const clientId = client.client_id;
    const checked = selectedClients.includes(clientId) ? 'checked' : '';
    
    if (isPetRow) {
        return `
            <tr data-client-id="${clientId}">
                <td><input type="checkbox" class="form-check-input client-select" ${checked}></td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${client.profile_pic}" class="user-avatar me-2" alt="Avatar"
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                        <div>
                            <div>${client.client_name}</div>
                            <div class="user-role">Client</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${pet.pet_picture}" class="user-avatar me-2" alt="Pet"
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                        <div>
                            <div>${pet.pet_name}</div>
                            <div class="user-role">Pet</div>
                        </div>
                    </div>
                </td>
                <td>${pet.gender}</td>
                <td>${pet.species}</td>
                <td>${pet.breed}</td>
                <td><span class="badge ${client.getStatusBadge()}">${client.status}</span></td>
                <td class="text-end">
                    <div class="dropdown">
                        <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item view-documents-btn" 
                                    href="#" 
                                    data-client-pet-id="${pet.client_pet_id}">
                                    <i class="bi bi-file-earmark me-1"></i> View Documents
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item add-note-btn" href="#">
                                    <i class="bi bi-journal-text me-1"></i> Add Note
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            ${client.status !== 'Added' ? 
                              `<li><a class="dropdown-item text-success" href="#"><i class="bi bi-plus-circle me-1"></i> Add to Current Clients</a></li>` : 
                              ''}
                            <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-1"></i> Remove Client</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    } else {
        // For rows without pets
        return `
            <tr data-client-id="${clientId}">
                <td><input type="checkbox" class="form-check-input client-select" ${checked}></td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${client.profile_pic}" class="user-avatar me-2" alt="Avatar"
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                        <div>
                            <div>${client.client_name}</div>
                            <div class="user-role">Client</div>
                        </div>
                    </div>
                </td>
                <td colspan="5" class="text-muted">No pets found.</td>
                <td><span class="badge ${client.getStatusBadge()}">${client.status}</span></td>
            </tr>
        `;
    }
}

class Initial_Client_Pet {
    constructor({ client_pet_id, pet_name, species, breed, gender, pet_picture }) {
        this.client_pet_id = client_pet_id;
        this.pet_name = pet_name;
        this.species = species;
        this.breed = breed;
        this.gender = gender;
        this.pet_picture = pet_picture;
    }
}

class Initial_Client {
    constructor({ client_id, client_name, status, profile_pic, pets = [] }) {
        this.client_id = client_id;
        this.client_name = client_name;
        this.status = status;
        this.profile_pic = profile_pic;
        this.pets = pets.map(p => new Initial_Client_Pet(p));
    }

    getStatusBadge() {
        switch (this.status) {
            case 'Not added': return 'bg-warning';
            case 'Added': return 'bg-success';
            default: return 'bg-secondary';
        }
    }
}

class Added_Client_Pet {
    constructor({ client_pet_id, pet_name, species, breed, gender, pet_picture }) {
        this.client_pet_id = client_pet_id;
        this.pet_name = pet_name;
        this.species = species;
        this.breed = breed;
        this.gender = gender;
        this.pet_picture = pet_picture;
    }
}

class Added_Client {
    constructor({ client_id, client_name, status, profile_pic, pets = [] }) {
        this.client_id = client_id;
        this.client_name = client_name;
        this.status = status;
        this.profile_pic = profile_pic;
        this.pets = pets.map(p => new Added_Client_Pet(p));
    }

    getStatusBadge() {
        switch (this.status) {
            case 'Not added': return 'bg-warning';
            case 'Added': return 'bg-success';
            default: return 'bg-secondary';
        }
    }
}

// 🟢 Fetch initial clients
function fetchInitialClients() {
    return fetch('../backends/clinic-clients.php?action=getInitialClients')
        .then(res => res.json())
        .then(data => {
            initialClientsList = data.map(item => new Initial_Client(item)); // ✅ Cache for modal
            return initialClientsList;
        })
        .catch(err => {
            console.error('Error fetching initial clients:', err);
            return [];
        });
}

function renderInitialClients(clients) {
    const tbody = document.getElementById("initialClientsTbody");
    tbody.innerHTML = "";

    if (clients.length === 0) {
        // Simple empty state message - no extra div containers
        const emptyRow = `
            <tr>
                <td colspan="8" style="text-align:center; padding:40px 0;">
                    <i class="bi bi-inbox fs-1 empty-state-icon"></i>
                    <p class="mt-2 mb-0 fw-bold">No initial clients found</p>
                    <p class="text-muted small">Initial clients will appear here</p>
                </td>
            </tr>
        `;
        tbody.innerHTML = emptyRow;
        return;
    }

    clients.forEach(client => {
        if (client.pets.length === 0) {
            // For clients without pets, use the no-pet row template
            const clientId = client.client_id;
            const checked = selectedClients.includes(clientId) ? 'checked' : '';
            
            const row = `
                <tr data-client-id="${clientId}">
                    <td><input type="checkbox" class="form-check-input client-select" ${checked}></td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${client.profile_pic}" class="user-avatar me-2" alt="Avatar"
                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                            <div>
                                <div>${client.client_name}</div>
                                <div class="user-role">Client</div>
                            </div>
                        </div>
                    </td>
                    <td colspan="5" class="text-muted">No pets found.</td>
                    <td><span class="badge ${client.getStatusBadge()}">${client.status}</span></td>
                    <td class="text-end">
                        <div class="dropdown">
                            <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item add-note-btn" href="#">
                                        <i class="bi bi-journal-text me-1"></i> Add Note
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                ${client.status !== 'Added' ? 
                                  `<li><a class="dropdown-item text-success" href="#"><i class="bi bi-plus-circle me-1"></i> Add to Current Clients</a></li>` : 
                                  ''}
                                <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-1"></i> Remove Client</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        } else {
            client.pets.forEach(pet => {
                // For clients with pets, use the pet row template
                const clientId = client.client_id;
                const checked = selectedClients.includes(clientId) ? 'checked' : '';
                
                const row = `
                    <tr data-client-id="${clientId}" data-pet-id="${pet.client_pet_id}">
                        <td><input type="checkbox" class="form-check-input client-select" ${checked}></td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${client.profile_pic}" class="user-avatar me-2" alt="Avatar"
                                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                                <div>
                                    <div>${client.client_name}</div>
                                    <div class="user-role">Client</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${pet.pet_picture}" class="user-avatar me-2" alt="Pet"
                                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                                <div>
                                    <div>${pet.pet_name}</div>
                                    <div class="user-role">Pet</div>
                                </div>
                            </div>
                        </td>
                        <td>${pet.gender}</td>
                        <td>${pet.species}</td>
                        <td>${pet.breed}</td>
                        <td><span class="badge ${client.getStatusBadge()}">${client.status}</span></td>
                        <td class="text-end">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item view-documents-btn" 
                                            href="#" 
                                            data-client-pet-id="${pet.client_pet_id}">
                                            <i class="bi bi-file-earmark me-1"></i> View Documents
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item add-note-btn" href="#">
                                            <i class="bi bi-journal-text me-1"></i> Add Note
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    ${client.status !== 'Added' ? 
                                      `<li><a class="dropdown-item text-success" href="#"><i class="bi bi-plus-circle me-1"></i> Add to Current Clients</a></li>` : 
                                      ''}
                                    <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-1"></i> Remove Client</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        }
    });

    attachDocumentListeners();
    attachClientSelectionListeners();
    initClientNotesTriggers();
}

function fetchPetDocuments(clientPetId) {
    return fetch(`../backends/clinic-clients.php?action=getPetDocuments&client_pet_id=${clientPetId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        });
}

function renderPetDocuments(documents) {
    const defaultImg = '../assets/images/doc_default.png';
    const imageIds = [
        'Booklet_Front_Page_Left',
        'Booklet_Front_Page_Right',
        'Booklet_Back_Page_Left',
        'Booklet_Back_Page_Right'
    ];

    // Reset all image sources to default
    imageIds.forEach(id => {
        const img = document.getElementById(id);
        if (img) img.src = defaultImg;
    });

    // Render actual document images
    documents.forEach(doc => {
        const typeId = doc.type.replace(/\s+/g, '_'); // Convert DB type to valid ID
        const imgEl = document.getElementById(typeId);
        if (imgEl) {
            imgEl.src = doc.file;
        } else {
            console.warn(`No image element found for type "${doc.type}" (mapped ID: ${typeId})`);
        }
    });
}

function attachDocumentListeners() {
    console.log('✅ attachDocumentListeners is running');

    document.querySelectorAll('.view-documents-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('🟢 View Documents clicked');

            const petId = parseInt(this.dataset.clientPetId);

            if (!petId) {
                console.warn('⚠️ No client_pet_id found on clicked element.');
                return;
            }

            selectedClientPetId = petId;

            // Find the client & pet from initialClientsList
            let selectedClient = null;
            let selectedPet = null;

            for (const client of initialClientsList) {
                const match = client.pets.find(p => p.client_pet_id === petId);
                if (match) {
                    selectedPet = match;
                    selectedClient = client;
                    break;
                }
            }

            if (!selectedClient || !selectedPet) {
                console.warn('⚠️ Could not find matching client or pet for petId:', petId);
                return;
            }

            // 🐾 Fill in modal info
            renderModalClientAndPetInfo(selectedClient, selectedPet);

            // 📄 Fetch documents
            fetchPetDocuments(petId)
                .then(documents => {
                    console.log('📄 Fetched documents:', documents);
                    renderPetDocuments(documents);

                    // ✅ Open the modal manually
                    const modalEl = document.getElementById('initialClientPetDocModal');
                    if (!modalEl) {
                        console.error('❌ Modal element with ID #initialClientPetDocModal not found');
                        return;
                    }

                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                    console.log('✅ Modal opened successfully');
                })
                .catch(err => {
                    console.error('❌ Failed to fetch documents:', err);
                    alert('Could not load documents.');
                });
        });
    });

    document.querySelectorAll('.dropdown-item.text-success').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();

            // Find closest row to extract clientId
            const row = btn.closest('tr');
            if (!row) return;

            const clientName = row.querySelector('.user-role')?.previousElementSibling?.textContent.trim() || 'Client';

            // Find client by matching name (or better yet, if you have a data-client-id attr, use that)
            const client = initialClientsList.find(c => c.client_name === clientName);

            if (!client) {
                console.warn('⚠️ Could not find matching client for name:', clientName);
                return;
            }

            const confirmUpdate = confirm(`Are you sure you want to mark ${client.client_name} as "Added"?`);
            if (!confirmUpdate) return;

            const success = await updateClientStatus(client.client_id);
            if (success) {
                client.status = 'Added';
                renderInitialClients(initialClientsList);
                showAlert(`Client "${client.client_name}" marked as Added.`, 'success');

                // ⏳ Wait a bit before redirecting (to let user see the alert)
                setTimeout(() => {
                    window.location.href = "clinic-clients.php?account_id=" + accountId + "&role=" + role;
                }, 1500); // 1.5 seconds
            }
        });
    });
}

function renderModalClientAndPetInfo(client, pet) {
    console.log('🧩 Rendering modal info for:');
    console.log('👤 Client:', client);
    console.log('🐶 Pet:', pet);

    // 👤 Owner info
    const ownerPicEl = document.getElementById('selected-owner-pic');
    const ownerNameInput = document.getElementById('selected-owner-name');

    if (ownerPicEl) {
        ownerPicEl.src = client.profile_pic;
        console.log('📸 Set owner picture:', client.profile_pic);
    } else {
        console.warn('⚠️ Owner picture element not found');
    }

    if (ownerNameInput) {
        ownerNameInput.value = client.client_name;
        console.log('👤 Set owner name:', client.client_name);
    } else {
        console.warn('⚠️ Owner name input not found');
    }

    // 🐶 Pet info
    const petNameInput = document.getElementById('selected-pet-name');
    const petGenderInput = document.getElementById('selected-pet-gender');
    const petSpeciesInput = document.getElementById('selected-pet-species');
    const petBreedInput = document.getElementById('selected-pet-breed');
    const petAvatarEl = document.getElementById('selected-pet-picture');

    if (petNameInput) {
        petNameInput.value = pet.pet_name;
        console.log('🐶 Pet name:', pet.pet_name);
    } else {
        console.warn('⚠️ Pet name input not found');
    }

    if (petGenderInput) {
        petGenderInput.value = pet.gender;
        console.log('🚻 Pet gender:', pet.gender);
    } else {
        console.warn('⚠️ Pet gender input not found');
    }

    if (petSpeciesInput) {
        petSpeciesInput.value = pet.species;
        console.log('🧬 Pet species:', pet.species);
    } else {
        console.warn('⚠️ Pet species input not found');
    }

    if (petBreedInput) {
        petBreedInput.value = pet.breed;
        console.log('🔬 Pet breed:', pet.breed);
    } else {
        console.warn('⚠️ Pet breed input not found');
    }

    if (petAvatarEl) {
        petAvatarEl.src = pet.pet_picture;
        console.log('📸 Set pet picture:', pet.pet_picture);
    } else {
        console.warn('⚠️ Pet picture element not found (id: "selected-pet-picture")');
    }
}

function updateClientStatus(clientId) {
    return fetch('../backends/clinic-clients.php?action=updateClientStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ client_id: clientId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Client status updated to "Added".');
                return true;
            } else {
                console.error('❌ Failed to update status:', data.error);
                return false;
            }
        })
        .catch(err => {
            console.error('❌ Error updating client status:', err);
            return false;
        });
}

function fetchAddedClients() {
    return fetch('../backends/clinic-clients.php?action=getClientsAdded')
        .then(res => res.json())
        .then(data => {
            console.log('Fetched added clients:', data);
            addedClientsList = data.map(item => new Added_Client(item)); // ✅ Cache for "Added" clients
            return addedClientsList;
        })
        .catch(err => {
            console.error('Error fetching added clients:', err);
            return [];
        });
}

// Render "Added" clients and pets
function renderAddedClients(clients) {
    const tbody = document.getElementById("addedClientsTbody");
    tbody.innerHTML = "";

    if (clients.length === 0) {
        // Simple empty state message - no extra div containers
        const emptyRow = `
            <tr>
                <td colspan="8" style="text-align:center; padding:40px 0;">
                    <i class="bi bi-inbox fs-1 empty-state-icon"></i>
                    <p class="mt-2 mb-0 fw-bold">No clients found</p>
                    <p class="text-muted small">Added clients will appear here</p>
                </td>
            </tr>
        `;
        tbody.innerHTML = emptyRow;
        return;
    }

    console.log('Rendering added clients:', clients);

    clients.forEach(client => {
        if (client.pets.length === 0) {
            // For clients without pets, use the no-pet row template
            const clientId = client.client_id;
            const checked = selectedClients.includes(clientId) ? 'checked' : '';
            
            const row = `
                <tr data-client-id="${clientId}">
                    <td><input type="checkbox" class="form-check-input client-select" ${checked}></td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${client.profile_pic}" class="user-avatar me-2" alt="Avatar"
                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                            <div>
                                <div>${client.client_name}</div>
                                <div class="user-role">Client</div>
                            </div>
                        </div>
                    </td>
                    <td colspan="5" class="text-muted">No pets found.</td>
                    <td><span class="badge ${client.getStatusBadge()}">${client.status}</span></td>
                    <td class="text-end">
                        <div class="dropdown">
                            <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item add-note-btn" href="#">
                                        <i class="bi bi-journal-text me-1"></i> Add Note
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-1"></i> Remove Client</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        } else {
            client.pets.forEach(pet => {
                // For clients with pets, use the pet row template
                const clientId = client.client_id;
                const checked = selectedClients.includes(clientId) ? 'checked' : '';
                
                const row = `
                    <tr data-client-id="${clientId}" data-pet-id="${pet.client_pet_id}">
                        <td><input type="checkbox" class="form-check-input client-select" ${checked}></td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${client.profile_pic}" class="user-avatar me-2" alt="Avatar"
                                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                                <div>
                                    <div>${client.client_name}</div>
                                    <div class="user-role">Client</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${pet.pet_picture}" class="user-avatar me-2" alt="Pet"
                                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">
                                <div>
                                    <div>${pet.pet_name}</div>
                                    <div class="user-role">Pet</div>
                                </div>
                            </div>
                        </td>
                        <td>${pet.gender}</td>
                        <td>${pet.species}</td>
                        <td>${pet.breed}</td>
                        <td><span class="badge ${client.getStatusBadge()}">${client.status}</span></td>
                        <td class="text-end">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item view-documents-btn" 
                                           href="#" 
                                           data-client-pet-id="${pet.client_pet_id}">
                                           <i class="bi bi-file-earmark me-1"></i> View Documents
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item add-note-btn" href="#">
                                            <i class="bi bi-journal-text me-1"></i> Add Note
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-1"></i> Remove Client</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        }
    });

    attachDocumentListeners();
    attachClientSelectionListeners();
    initClientNotesTriggers();
}

// Function to attach event listeners to client selection checkboxes
function attachClientSelectionListeners() {
    document.querySelectorAll('.client-select').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            if (!row) return;
            
            const clientId = row.dataset.clientId;
            if (clientId) {
                if (this.checked) {
                    // Add to selected if not already there
                    if (!selectedClients.includes(clientId)) {
                        selectedClients.push(clientId);
                    }
                } else {
                    // Remove from selected
                    selectedClients = selectedClients.filter(id => id !== clientId);
                }
                
                // Update the display count of selected clients
                updateSelectedCount();
            }
        });
    });
}





