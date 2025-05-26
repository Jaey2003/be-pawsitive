let selectedPetId = null;

document.addEventListener("DOMContentLoaded", function () {
    const petGrid = document.getElementById("petGrid");
    const petDetail = document.getElementById("petDetail");
    const backButton = document.getElementById("backButton");
    const searchInput = document.getElementById("pets");
    const searchButton = document.querySelector("#pets + button");
    let petsData = [];
    let selectedPet = null;

    // =========================
    // FETCHING & RENDERING
    // =========================

    function fetchPets(searchTerm = '', filters = {}) {
        const payload = {
            action: "get_pets"
        };

        if (searchTerm.trim()) {
            payload.search = searchTerm.trim();
        }
        
        // Add filter parameters if provided
        if (filters.species) payload.species = filters.species;
        if (filters.gender) payload.gender = filters.gender;
        if (filters.status) payload.status = filters.status;
        if (filters.sort) payload.sort = filters.sort;

        fetch('../backends/account-pets.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                petsData = data;
                renderPetCards(data);
            })
            .catch(err => console.error("Error fetching pets:", err));
    }


    function renderPetCards(pets) {
        if (!Array.isArray(pets) || pets.length === 0) {
            petGrid.innerHTML = "<p>No pets found.</p>";
            return;
        }

        petGrid.innerHTML = pets.map((pet, index) => createPetCard(pet, index)).join('');
        attachPetCardEvents();
        attachStatusClickEvents();
    }

    function createPetCard(pet, index) {
        const imageSrc = pet.pet_picture?.trim() || 'dog.png';
        const genderClass = pet.gender?.toLowerCase() === 'male' ? 'bg-male' : 'bg-female';

        return `
        <div class="col-sm-6 col-md-4 col-lg-3">
          <div class="card shadow-sm pet-card" data-index="${index}">
            <div class="pet-card-bg ${genderClass}">
              <img src="../uploads/pets_image/${imageSrc}" alt="${pet.name}" class="img-fluid">
            </div>
            <div class="card-body text-center">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">${pet.name}</h5>
                <span class="status-badge clickable-status" data-pet-id="${pet.pet_id}">${pet.status || 'Not Registered'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function attachPetCardEvents() {
        document.querySelectorAll('.pet-card').forEach(card => {
            const index = card.getAttribute('data-index');
            card.addEventListener('click', () => {
                selectedPet = petsData[index];
                document.getElementById('petListView').style.display = 'none';
                document.getElementById('petDetail').style.display = 'block';
                updateDetailView(selectedPet);
            });
        });
    }

    function attachStatusClickEvents() {
        document.querySelectorAll('.clickable-status').forEach(badge => {
            badge.addEventListener('click', handleStatusClick);
        });
    }

    function handleStatusClick(e) {
        e.stopPropagation();
        const petId = this.getAttribute("data-pet-id");
    
        selectedPetId = petId;
    
        fetch('../backends/account-pets.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'get_status',
                pet_id: petId
            })
        })
        .then(res => res.json())
        .then(data => {
            const status = data.status;
    
            // Hide all modal sections/buttons first
            document.getElementById('registeredModalContent').classList.add('d-none');
            document.getElementById('notRegisteredModalContent').classList.add('d-none');
            document.getElementById('viewProfileLink').classList.add('d-none');
            document.getElementById('registerAnotherClinicLink').classList.add('d-none');
            document.getElementById('petRegistrationLink').classList.add('d-none');
    
            // Switch UI based on status
            switch (status) {
                case 'Registered':
                    document.getElementById('registeredModalContent').classList.remove('d-none');
                    document.getElementById('viewProfileLink').classList.remove('d-none');
                    document.getElementById('registerAnotherClinicLink').classList.remove('d-none');
                    break;
    
                case 'Not Registered':
                default:
                    document.getElementById('notRegisteredModalContent').classList.remove('d-none');
                    document.getElementById('petRegistrationLink').classList.remove('d-none');
    
                    break;
            }
    
            // Optional: continue with session logic
            storePetInSession(petId, status);
        })
        .catch(err => console.error('Status check error:', err));
    }       

    function storePetInSession(petId, status, redirectUrl = null) {
    
        // Step 1: Fetch current session pet ID
        fetch('../backends/account-pets.php?action=get_session_pet', {
            method: 'GET',
            credentials: 'same-origin'
        })
            .then(res => res.json())
            .then(currentSession => {
                console.log('Current session pet ID:', currentSession.pet_id);
    
                // Step 2: Check if selected pet is already in session
                if (currentSession.pet_id == petId) {
    
                    if (redirectUrl) {
                        console.log('Redirecting to:', redirectUrl);
                        window.location.href = redirectUrl;
                    } else {
                        console.log('Showing modal for pet with status:', status);
                        new bootstrap.Modal(document.getElementById('PetStatusModal')).show();
                    }                    
                    return; // Skip session update
                }
    
                // Step 3: If different, proceed to store new pet in session
                fetch('../backends/account-pets.php?ts=' + new Date().getTime(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'store_session',
                        pet_id: petId
                    }),
                    credentials: 'same-origin'
                })
                    .then(res => {
                        console.log('Fetch response received.');
                        return res.json();
                    })
                    .then(sessionRes => {
                        console.log('Parsed session response:', sessionRes);
    
                        if (!sessionRes.success) {
                            console.error('Failed to store pet in session:', sessionRes);
                            return alert('Failed to store pet in session.');
                        }
    
                        // ✅ Step 4: Confirm session is updated
                        fetch('../backends/account-pets.php?action=get_session_pet', {
                            method: 'GET',
                            credentials: 'same-origin'
                        })
                            .then(res => res.json())
                            .then(updatedSession => {
                                console.log('✅ Session updated. Current session pet ID is now:', updatedSession.pet_id);
    
                                if (redirectUrl) {
                                    console.log('Redirecting to:', redirectUrl);
                                    window.location.href = redirectUrl;
                                } else if (status === 'Registered') {
                                    new bootstrap.Modal(document.getElementById('PetStatusModal')).show();
                                } else {
                                    console.log('Pet not registered. Showing modal.');
                                    new bootstrap.Modal(document.getElementById('PetStatusModal')).show();
                                }
                            })
                            .catch(err => console.error('Error verifying session update:', err));
                    })
                    .catch(err => console.error('Session error:', err));
            })
            .catch(err => console.error('Error fetching session pet ID:', err));
    }       
    
    // =========================
    // DETAIL / MODAL VIEWS
    // =========================

    function updateDetailView(pet) {
        const basePath = "../uploads/pets_image/";
        document.getElementById("detailImage").src = pet.pet_picture?.trim()
            ? basePath + pet.pet_picture
            : basePath + "dog.png";
        document.getElementById("detailImage").alt = pet.name;

        document.getElementById("detailName").textContent = pet.name;
        document.getElementById("detailNameText").textContent = pet.name;
        document.getElementById("detailGender").textContent = pet.gender || "Not Specified";
        document.getElementById("detailSpecies").textContent = pet.species;
        document.getElementById("detailBreed").textContent = pet.breed || "Not Specified";
    }

    function updateModalView(pet) {
        const basePath = "../uploads/pets_image/";
        document.getElementById("updatepetImagePreview").src = pet.pet_picture?.trim()
            ? basePath + pet.pet_picture
            : basePath + "dog.png";

        document.getElementById("pet-id").value = pet.pet_id;
        document.getElementById("pet-Name").value = pet.name || "";
        document.getElementById("pet-Gender").value = pet.gender || "Select gender";
        document.getElementById("pet-Species").value = pet.species || "Select species";
        document.getElementById("pet-Breed").value = pet.breed || "";
    }

    // =========================
    // NEW FEATURE HANDLERS
    // =========================

    // Health Records
    function fetchHealthRecords(petId) {
        // This would fetch health records from the server
        console.log(`Fetching health records for pet ID: ${petId}`);
        // For demonstration, we'll just show empty states in the UI
    }

    // Gallery Management
    function fetchPetGallery(petId) {
        // This would fetch pet photos from the server
        console.log(`Fetching gallery for pet ID: ${petId}`);
        // For demonstration, we'll just show empty states in the UI
    }

    // Document Management
    function fetchPetDocuments(petId) {
        // This would fetch pet documents from the server
        console.log(`Fetching documents for pet ID: ${petId}`);
        // For demonstration, we'll just show empty states in the UI
    }

    // Appointment History
    function fetchAppointmentHistory(petId) {
        // This would fetch appointment history from the server
        console.log(`Fetching appointment history for pet ID: ${petId}`);
        // For demonstration, we'll just show empty states in the UI
    }

    // Advanced Filtering
    function applyFilters() {
        const species = document.getElementById('filterSpecies').value;
        const gender = document.getElementById('filterGender').value;
        const status = document.getElementById('filterStatus').value;
        const sort = document.getElementById('sortPets').value;
        
        fetchPets(searchInput.value, {
            species: species,
            gender: gender,
            status: status,
            sort: sort
        });
    }

    // =========================
    // EVENT LISTENERS
    // =========================

    backButton.addEventListener("click", () => {
        document.getElementById('petDetail').style.display = 'none';
        document.getElementById('petListView').style.display = 'block';
    });

    document.getElementById("editProfileButton").addEventListener("click", () => {
        if (!selectedPet) return console.error("No pet selected.");
        updateModalView(selectedPet);
        new bootstrap.Modal(document.getElementById("updatePetModal")).show();
    });

    searchInput.addEventListener("keyup", e => {
        if (e.key === "Enter") fetchPets(e.target.value);
    });

    if (searchButton) {
        searchButton.addEventListener("click", () => fetchPets(searchInput.value));
    }

    searchInput.addEventListener("input", e => {
        if (e.target.value.trim() === "") fetchPets();
    });

    // Modal open events for new features
    document.addEventListener('show.bs.modal', function (event) {
        // Only proceed if we have a selected pet
        if (!selectedPet) return;
        
        const modal = event.target;
        
        // Handle different modal types
        if (modal.id === 'healthRecordsModal') {
            fetchHealthRecords(selectedPet.pet_id);
        } else if (modal.id === 'petGalleryModal') {
            fetchPetGallery(selectedPet.pet_id);
        } else if (modal.id === 'petDocumentsModal') {
            fetchPetDocuments(selectedPet.pet_id);
        } else if (modal.id === 'appointmentHistoryModal') {
            fetchAppointmentHistory(selectedPet.pet_id);
        }
    });

    // Advanced filter handling
    if (document.getElementById('applyFilters')) {
        document.getElementById('applyFilters').addEventListener('click', applyFilters);
    }
    
    if (document.getElementById('resetFilters')) {
        document.getElementById('resetFilters').addEventListener('click', () => {
            // Reset filter form
            document.getElementById('filterSpecies').value = '';
            document.getElementById('filterGender').value = '';
            document.getElementById('filterStatus').value = '';
            document.getElementById('sortPets').value = 'name_asc';
            
            // Fetch pets without filters
            fetchPets();
        });
    }

    // Initial load
    fetchPets();
    window.storePetInSession = storePetInSession;
});


function setupImagePreview(triggerButtonId, fileInputId, previewImageId) {
    const triggerButton = document.getElementById(triggerButtonId);
    const fileInput = document.getElementById(fileInputId);
    const previewImage = document.getElementById(previewImageId);

    if (triggerButton && fileInput && previewImage) {
        triggerButton.addEventListener('click', function () {
            fileInput.click();
        });

        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Setup for the add modal:
setupImagePreview('uploadImageButton', 'petImage', 'petImagePreview');

// Setup for the update modal:
setupImagePreview('upload-ImageButton', 'pet-Image', 'updatepetImagePreview');

function accountPetAction(actionId, accountId, role) {
    switch (actionId) {
        case 'updatePetForm':
            const updatePetForm = document.getElementById('updatePetForm');
            if (!updatePetForm) return;

            updatePetForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const formData = new FormData();
                formData.append('action', 'update_pet');
                formData.append('petId', document.getElementById('pet-id').value);
                formData.append('petName', document.getElementById('pet-Name').value);
                formData.append('petGender', document.getElementById('pet-Gender').value);
                formData.append('petSpecies', document.getElementById('pet-Species').value);
                formData.append('petBreed', document.getElementById('pet-Breed').value);

                const petImageInput = document.getElementById('pet-Image');
                if (petImageInput && petImageInput.files[0]) {
                    formData.append('petImage', petImageInput.files[0]);
                }

                fetch('../backends/account-pets.php', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);

                        if (data.success) {
                            const modalEl = document.getElementById('updatePetModal');
                            const modalInstance = bootstrap.Modal.getInstance(modalEl);
                            if (modalInstance) modalInstance.hide();

                            updatePetForm.reset();
                            const preview = document.getElementById('petImagePreview');
                            if (preview) preview.src = "../assets/images/dog.png";

                            showAlert(data.message || 'Pet updated successfully!', 'success', 2000);

                            setTimeout(() => {
                                window.location.href = `pets.php?account_id=${accountId}&role=${role}`;
                            }, 2000);
                        } else {
                            showAlert(data.message || 'Update failed.', 'danger');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert('An error occurred while updating the pet.', 'danger');
                    });
            });
            break;

        case 'addPetForm':
            const addPetForm = document.getElementById('addPetForm');
            if (!addPetForm) return;

            addPetForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const formData = new FormData();
                formData.append('action', 'add_pet');
                formData.append('petName', document.getElementById('petName').value);
                formData.append('petGender', document.getElementById('petGender').value);
                formData.append('petSpecies', document.getElementById('petSpecies').value);
                formData.append('petBreed', document.getElementById('petBreed').value);

                const petImageInput = document.getElementById('petImage');
                if (petImageInput && petImageInput.files[0]) {
                    formData.append('petImage', petImageInput.files[0]);
                }

                fetch('../backends/account-pets.php', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);

                        if (data.success) {
                            const modalEl = document.getElementById('addPetModal');
                            const modalInstance = bootstrap.Modal.getInstance(modalEl);
                            if (modalInstance) modalInstance.hide();

                            addPetForm.reset();
                            const preview = document.getElementById('petImagePreview');
                            if (preview) preview.src = "../assets/images/dog.png";

                            // ✅ Show success alert
                            showAlert(data.message || 'Pet added successfully!', 'success', 2000);

                            // ⏳ Delay redirect
                            setTimeout(() => {
                                window.location.href = `pets.php?account_id=${accountId}&role=${role}`;
                            }, 2000);
                        } else {
                            showAlert(data.message || 'Failed to add pet.', 'danger');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert('An error occurred while adding the pet.', 'danger');
                    });
            });
            break;

        default:
            console.warn(`No handler defined for action ID: ${actionId}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    accountPetAction('updatePetForm', accountId, role);
    accountPetAction('addPetForm', accountId, role);
});


