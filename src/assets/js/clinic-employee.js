// Function to hide buttons when an option is selected
function hideUploadAndSelfieButtons() {
    document.querySelector(".modal-body button:nth-child(1)").style.display = "none"; // Upload button
    document.querySelector(".modal-body button:nth-child(2)").style.display = "none"; // Selfie button
}

// Function to reset the buttons when modal opens
function resetUploadAndSelfieButtons() {
    document.querySelector(".modal-body button:nth-child(1)").style.display = "block"; // Upload button
    document.querySelector(".modal-body button:nth-child(2)").style.display = "block"; // Selfie button
}

// Add event listener to reset buttons when modal is opened
document.getElementById('imageModal').addEventListener('shown.bs.modal', resetUploadAndSelfieButtons);

// Image Preview and Upload
function previewImage(event) {
    hideUploadAndSelfieButtons();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            const imageData = reader.result;
            // Set the preview image's source
            document.getElementById('imgPreview').src = imageData;
            // Save the image data to the hidden input (Base64)
            document.getElementById('profile_pic_data').value = imageData;
            // Close the modal after preview is ready
            const modal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
            if (modal) modal.hide();
        };
        reader.readAsDataURL(file);
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
    document.getElementById('imgPreview').src = dataURL;
    document.getElementById('profile_pic_data').value = dataURL; // Store in hidden input

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


// Debounce function to optimize performance
function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Function to update the dropdown dynamically
function updateDropdown(inputValue, dropdownId, dataList) {
    let dropdown = $(`#${dropdownId}`);
    dropdown.empty();

    if (inputValue.length > 0) {
        let filteredList = dataList.filter(item => item.toLowerCase().includes(inputValue.toLowerCase()));

        if (filteredList.length > 0) {
            dropdown.show().css({ opacity: 1 }).html(
                filteredList.map(item => `<div class="dropdown-item">${item}</div>`).join("")
            );
        } else {
            dropdown.hide().css({ opacity: 0 });
        }
    } else {
        dropdown.hide().css({ opacity: 0 });
    }
}

// Function to attach event handlers efficiently
function attachDropdownHandler(inputId, dropdownId, dataList) {
    const inputField = $(`#${inputId}`);
    const dropdown = $(`#${dropdownId}`);

    // Use debounce for optimized input handling
    inputField.on("input", debounce(function () {
        updateDropdown($(this).val(), dropdownId, dataList);
    }, 250));

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
}

$(document).ready(function () {
    attachDropdownHandler("barangay", "barangayDropdown", barangays);
    attachDropdownHandler("city", "cityDropdown", cities);
    attachDropdownHandler("municipality", "municipalityDropdown", municipalities);
    attachDropdownHandler("province", "provinceDropdown", provinces);
    attachDropdownHandler("region", "regionDropdown", regions); // Added region support
});

function checkUsername() {
    let username = document.getElementById("username").value;
    let feedback = document.getElementById("username-feedback");

    if (username.length < 4) {
        feedback.textContent = "Username must be at least 4 characters long.";
        return;
    }

    fetch(`../backends/clinic-employee.php?action=check_username&username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                feedback.textContent = "Username is already taken.";
                feedback.classList.add("text-danger");
                feedback.classList.remove("text-success");
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

    if (!password.match(passwordRequirements)) {
        passwordFeedback.textContent = "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.";
    } else {
        passwordFeedback.textContent = "";
    }

    if (password !== confirmPassword) {
        confirmPasswordFeedback.textContent = "Passwords do not match.";
    } else {
        confirmPasswordFeedback.textContent = "";
    }
}

// Ensure buttons are hidden on page load
document.addEventListener("DOMContentLoaded", function () {
    hideButtons("#first-phone-buttons");
    hideButtons("#first-email-buttons");

    document.getElementById("first-phone").removeAttribute("readonly");
    document.getElementById("first-email").removeAttribute("readonly");
});

// Function to hide buttons with a fade effect
function hideButtons(selector) {
    document.querySelectorAll(`${selector} button`).forEach((btn) => {
        btn.style.opacity = "0";
        setTimeout(() => (btn.style.display = "none"), 200);
    });
}

// Function to show buttons with a smooth transition
function showButtons(selector) {
    document.querySelectorAll(`${selector} button`).forEach((btn) => {
        btn.style.display = "inline-block";
        setTimeout(() => (btn.style.opacity = "1"), 50);
    });
}

// Function to update input layout when a second entry is added
function updateLayoutOnAdd(type) {
    let firstWrapper = document.querySelector(`#first-${type}`).closest(".col-md-12");
    let firstButtons = document.querySelector(`#first-${type}-buttons`);

    firstWrapper.classList.replace("col-md-12", "col-md-9");
    firstWrapper.style.display = "flex"; // Ensure flex display
    firstWrapper.style.flexGrow = "1";  // Add flex-grow to the first input field
    firstButtons.style.display = "flex";
    setTimeout(() => (firstButtons.style.opacity = "1"), 50);
}

// Function to reset layout when all additional entries are removed
function resetLayout(type) {
    let firstWrapper = document.querySelector(`#first-${type}`).closest(".col-md-9");
    let firstButtons = document.querySelector(`#first-${type}-buttons`);

    if (document.querySelectorAll(`#additional-${type}s .${type}-input`).length === 0) {
        firstWrapper.classList.replace("col-md-9", "col-md-12");
        firstWrapper.style.flexGrow = "0"; // Remove flex-grow when resetting layout
        firstButtons.style.opacity = "0";
        setTimeout(() => (firstButtons.style.display = "none"), 200);
    }
}

// Function to show buttons only after a valid input and a second entry is added
function checkAndShowButtons() {
    let phoneValid = /^09\d{9}$/.test(document.querySelector("#first-phone").value.trim());
    let emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.querySelector("#first-email").value.trim());

    // Check phone field independently
    if (phoneValid && document.querySelectorAll("#additional-phones .phone-input").length > 0) {
        showButtons("#first-phone-buttons");
    }
    // Check email field independently
    if (emailValid && document.querySelectorAll("#additional-emails .email-input").length > 0) {
        showButtons("#first-email-buttons");
    } 
}


// Function to set a field as read-only
function makeReadOnly(fieldId) {
    document.getElementById(fieldId).setAttribute("readonly", true);
}

// Function to allow editing again
function alwaysEditable(fieldId) {
    let inputField = document.getElementById(fieldId);
    inputField.removeAttribute("readonly");
    inputField.focus();
}

// Check for duplicate values in inputs
function isDuplicate(value, selector) {
    let count = [...document.querySelectorAll(selector)].filter(input => input.value === value).length;
    return count > 1;
}

// Validate and Add Phone
function validateAndAddPhone() {
    let phoneInput = document.querySelector("#first-phone");
    let phoneValue = phoneInput.value.trim();

    if (!/^09\d{9}$/.test(phoneValue)) {
        alert("Please enter a valid Philippine phone number (must start with 09 and be 11 digits long) before adding another.");
        return;
    }

    if (isDuplicate(phoneValue, "#phone-container input")) {
        alert("Phone number already exists. Please enter a unique number.");
        return;
    }

    makeReadOnly("first-phone");
    addPhoneNumber();
    checkAndShowButtons();
    updateLayoutOnAdd("phone");
}

// Validate and Add Email
function validateAndAddEmail() {
    let emailInput = document.querySelector("#first-email");
    let emailValue = emailInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        alert("Please enter a valid email address before adding another.");
        return;
    }

    if (isDuplicate(emailValue, "#email-container input")) {
        alert("Email address already exists. Please enter a unique email.");
        return;
    }

    makeReadOnly("first-email");
    addEmail();
    checkAndShowButtons();
    updateLayoutOnAdd("email");
}

// Function to dynamically add phone input fields
function addPhoneNumber() {
    let additionalPhones = document.getElementById("additional-phones");
    let uniqueId = "phone-" + new Date().getTime();
    let newPhoneDiv = document.createElement("div");
    newPhoneDiv.classList.add("row", "phone-input", "mt-2"); // Added "d-flex"

    newPhoneDiv.innerHTML = `
        <div class="col-md-12 d-flex align-items-center"> <!-- Applied flex-grow -->
            <div class="form-floating flex-grow-1">
                <input type="tel" class="form-control border-warning" id="${uniqueId}" name="mobile_number[]" placeholder="Mobile Number" required pattern="^09\\d{9}$" onblur="makeReadOnly('${uniqueId}')">
                <label>Mobile Number</label>
            </div>
            <div class="d-flex align-items-center ms-2">
                <button type="button" class="btn btn-sm btn-warning text-white me-1 shadow-sm" onclick="alwaysEditable('${uniqueId}')"><i class="fas fa-edit"></i></button>
                <button type="button" class="btn btn-sm btn-danger text-white me-1 shadow-sm" onclick="removeField(this, 'phone')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
    additionalPhones.appendChild(newPhoneDiv);
}

// Function to dynamically add email input fields
function addEmail() {
    let additionalEmails = document.getElementById("additional-emails");
    let uniqueId = "email-" + new Date().getTime();
    let newEmailDiv = document.createElement("div");
    newEmailDiv.classList.add("row", "email-input", "mt-2"); // Added "d-flex"

    newEmailDiv.innerHTML = `
        <div class="col-md-12 d-flex align-items-center"> <!-- Applied flex-grow -->
            <div class="form-floating flex-grow-1">
                <input type="email" class="form-control border-warning" id="${uniqueId}" name="email[]" placeholder="Email Address" required onblur="makeReadOnly('${uniqueId}')">
                <label>Email Address</label>
            </div>
            <div class="d-flex align-items-center ms-2">
                <button type="button" class="btn btn-sm btn-warning text-white me-1 shadow-sm" onclick="alwaysEditable('${uniqueId}')"><i class="fas fa-edit"></i></button>
                <button type="button" class="btn btn-sm btn-danger text-white me-1 shadow-sm" onclick="removeField(this, 'email')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;

    additionalEmails.appendChild(newEmailDiv);
}



// Remove added fields and reset layout when necessary
function removeField(button, type) {
    let entry = button.closest(".row");
    entry.remove();
    checkAndShowButtons();
    resetLayout(type);
}

// Delete all entries and reset fields
function deleteAllEntries() {
    document.getElementById("first-phone").value = "";
    document.getElementById("first-email").value = "";
    document.getElementById("additional-phones").innerHTML = "";
    document.getElementById("additional-emails").innerHTML = "";

    hideButtons("#first-phone-buttons");
    hideButtons("#first-email-buttons");

    document.getElementById("first-phone").removeAttribute("readonly");
    document.getElementById("first-email").removeAttribute("readonly");

    updateLayoutOnAdd("phone");
    updateLayoutOnAdd("email");
}

(function () {
    const OwnerMapHandler = {
        map: null,
        currentMarker: null
    };

    document.getElementById("toggleOwnerMap").addEventListener("change", function () {
        let mapContainer = document.getElementById("owner_mapContainer");

        if (this.checked) {
            mapContainer.style.display = "block";

            if (!OwnerMapHandler.map) {
                OwnerMapHandler.map = L.map("owner_leafletMap").setView([0, 0], 2); // Default global view
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; OpenStreetMap contributors",
                    crossOrigin: "anonymous"
                }).addTo(OwnerMapHandler.map);
            }

            // Center the map on the user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;
                    OwnerMapHandler.map.setView([lat, lng], 13);
                }, function (error) {
                    console.error("Geolocation error:", error.message);
                    alert("Unable to fetch location. Please click on the map to set your location.");
                }, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }

            // Allow user to add a pin by clicking the map
            OwnerMapHandler.map.on("click", function (event) {
                if (!event || !event.latlng) {
                    console.error("Invalid event data received:", event);
                    return;
                }
                addPin(event.latlng.lat, event.latlng.lng);
            });
        } else {
            mapContainer.style.display = "none";
        }
    });

    function addPin(lat, lng) {
        console.log("Adding pin at:", lat, lng); // Debugging
        updateHiddenInputs(lat, lng);

        if (OwnerMapHandler.currentMarker) {
            OwnerMapHandler.map.removeLayer(OwnerMapHandler.currentMarker);
        }

        OwnerMapHandler.currentMarker = L.marker([lat, lng], { draggable: true })
            .addTo(OwnerMapHandler.map)
            .bindPopup(createConfirmationPopup())
            .openPopup();

        OwnerMapHandler.currentMarker.on("dragend", function () {
            let newLat = OwnerMapHandler.currentMarker.getLatLng().lat;
            let newLng = OwnerMapHandler.currentMarker.getLatLng().lng;
            console.log("Marker moved to:", newLat, newLng);
            updateHiddenInputs(newLat, newLng);
            OwnerMapHandler.currentMarker.bindPopup(createConfirmationPopup()).openPopup();
        });
    }

    function updateHiddenInputs(lat, lng) {
        document.getElementById("owner_xCoord").value = lng;
        document.getElementById("owner_yCoord").value = lat;
    }

    function createConfirmationPopup() {
        return `
            <div style="text-align: center;">
                <p><strong>Is this the location?</strong></p>
                <button type="button" onclick="confirmOwnerLocation(true, event)" class="btn btn-sm btn-success">Yes</button>
                <button type="button" onclick="confirmOwnerLocation(false, event)" class="btn btn-sm btn-danger">No</button>
            </div>
        `;
    }

    window.confirmOwnerLocation = function (isConfirmed, event) {
        event?.preventDefault();
        event?.stopPropagation();

        if (isConfirmed && OwnerMapHandler.currentMarker) {
            OwnerMapHandler.currentMarker.dragging.disable();
            OwnerMapHandler.currentMarker.closePopup();

            let lat = OwnerMapHandler.currentMarker.getLatLng().lat;
            let lng = OwnerMapHandler.currentMarker.getLatLng().lng;
            updateHiddenInputs(lat, lng);
            
            notifyUser("Location confirmed!");

            OwnerMapHandler.currentMarker.bindPopup(createChangeLocationPopup()).openPopup();
        } else {
            OwnerMapHandler.currentMarker.dragging.enable();
        }
    };

    function notifyUser(message, isError = false, event) {
        event?.preventDefault();
        event?.stopPropagation();

        let notification = document.createElement("div");
        notification.textContent = message;
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.left = "50%";
        notification.style.transform = "translateX(-50%)";
        notification.style.padding = "10px 20px";
        notification.style.color = "#fff";
        notification.style.backgroundColor = isError ? "#d9534f" : "#5cb85c";
        notification.style.borderRadius = "5px";
        notification.style.zIndex = "1000";
        notification.style.boxShadow = "0px 2px 10px rgba(0, 0, 0, 0.2)";
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function createChangeLocationPopup() {
        return `
            <div style="text-align: center;">
                <p><strong>Do you want to change location?</strong></p>
                <button type="button" onclick="changeOwnerLocation(true, event)" class="btn btn-sm btn-success">Yes</button>
                <button type="button" onclick="changeOwnerLocation(false, event)" class="btn btn-sm btn-danger">No</button>
            </div>
        `;
    }

    window.changeOwnerLocation = function (isConfirmed, event) {
        event?.preventDefault();
        event?.stopPropagation();

        if (isConfirmed) {
            OwnerMapHandler.currentMarker.dragging.enable();
            OwnerMapHandler.currentMarker.bindPopup(createConfirmationPopup()).openPopup();
            notifyUser("You can now move the pin.");
        } else {
            notifyUser("Pin remains at the confirmed location.");
            OwnerMapHandler.currentMarker.closePopup();
        }
    };

    // Prevent form submission if no coordinates are set
    document.querySelector("form").addEventListener("submit", function (event) {
        let ownerLat = document.getElementById("owner_yCoord").value;
        let ownerLng = document.getElementById("owner_xCoord").value;

        if (!ownerLat || !ownerLng) {
            alert("Please select a location for the owner.");
            event.preventDefault(); // Prevent form submission
            return;
        }

        console.log("Form is being submitted with coordinates:", ownerLat, ownerLng);
    });

})();

// Function to handle document file uploads
function handleFileUpload(inputId, imgPreviewId, hiddenInputId) {
    console.log(`Setting up file upload handler for: ${inputId}, ${imgPreviewId}, ${hiddenInputId}`);
    
    const fileInput = document.getElementById(inputId);
    if (!fileInput) {
        console.error(`File input element not found: ${inputId}`);
        return;
    }
    
    const imgPreview = document.getElementById(imgPreviewId);
    if (!imgPreview) {
        console.error(`Image preview element not found: ${imgPreviewId}`);
        return;
    }
    
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!hiddenInput) {
        console.error(`Hidden input element not found: ${hiddenInputId}`);
        return;
    }
    
    console.log(`All elements found for ${inputId}, attaching event listener`);
    
    fileInput.addEventListener("change", function(event) {
        console.log(`File input change detected for ${inputId}`);
        const file = event.target.files[0];
        if (file) {
            console.log(`File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert(`Invalid file type. Please upload JPEG, JPG, or PNG file for ${inputId}`);
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`File too large. Maximum file size is 5MB for ${inputId}`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log(`File read successfully for ${inputId}`);
                imgPreview.src = e.target.result; // Update image preview
                imgPreview.style.display = 'block'; // Ensure the preview is visible
                hiddenInput.value = e.target.result; // Store Base64 in hidden input
            };
            
            reader.onerror = function(e) {
                console.error(`Error reading file for ${inputId}:`, e);
                alert("Error reading file. Please try again.");
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// Function to clear hidden inputs within a given section
function clearHiddenInputs(sectionId) {
    const section = document.getElementById(sectionId);
    const hiddenInputs = section.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => input.value = '');
}

// Role selection: toggle document sections and clear hidden inputs when role changes
document.getElementById('role_type').addEventListener('change', function() {
    const role = this.value;
    // Get document sections
    const receptionistSection = document.getElementById('receptionist-docs');
    const veterinarianSection = document.getElementById('veterinarian-docs');
    
    // Hide both sections initially
    receptionistSection.style.display = 'none';
    veterinarianSection.style.display = 'none';

    // Clear hidden inputs from both sections
    clearHiddenInputs('receptionist-docs');
    clearHiddenInputs('veterinarian-docs');

    // Show the section that matches the selected role
    if (role === 'receptionist') {
        receptionistSection.style.display = 'block';
    } else if (role === 'veterinarian') {
        veterinarianSection.style.display = 'block';
    }
});

// Add form submission handler to ensure data is correctly sent to the backend
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, initializing employee form handlers");
    
    // Receptionist uploads - updated IDs to match the actual HTML IDs
    handleFileUpload("fileInput1", "imgPreview1", "hiddenInput1");
    handleFileUpload("fileInput2", "imgPreview2", "hiddenInput2");

    // Veterinarian uploads - updated IDs to match the actual HTML IDs
    handleFileUpload("fileVetInput1", "imgVetPreview1", "hiddenInputVet1");
    handleFileUpload("fileVetInput2", "imgVetPreview2", "hiddenInputVet2");
    handleFileUpload("fileVetInput3", "imgVetPreview3", "hiddenInputVet3");
    handleFileUpload("fileVetInput4", "imgVetPreview4", "hiddenInputVet4");
    
    // Check if the form exists
    const employeeForm = document.getElementById("employeeRegistrationForm");
    console.log("Form element found:", employeeForm ? true : false);
    
    if (employeeForm) {
        console.log("Adding submit event listener to employee registration form");
        
        employeeForm.addEventListener("submit", function(event) {
            console.log("Form submission initiated");
            
            // Prevent default initially to validate
            event.preventDefault();
            
            // Flag to track validation
            let isValid = true;

            // Validate coordinates
            let ownerLat = document.getElementById("owner_yCoord")?.value;
            let ownerLng = document.getElementById("owner_xCoord")?.value;
            console.log("Coordinates: ", ownerLat, ownerLng);

            if (!ownerLat || !ownerLng) {
                alert("Please select a location for the employee.");
                isValid = false;
            }
            
            // Validate passwords
            let password = document.getElementById("owner-password")?.value;
            let confirmPassword = document.getElementById("confirm-password")?.value;
            console.log("Passwords match:", password === confirmPassword);
            
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                isValid = false;
            }
            
            // Validate username
            let usernameFeedback = document.getElementById("username-feedback");
            if (usernameFeedback && usernameFeedback.textContent.includes("already taken")) {
                alert("Please choose a different username.");
                isValid = false;
            }

            // Get role type
            let roleSelect = document.getElementById("role_type");
            let role = roleSelect ? roleSelect.value : null;
            console.log("Selected role:", role);
            
            // Check required documents based on role
            if (role === "receptionist") {
                // Log document inputs - updated to match actual HTML IDs
                console.log("Certificate of Attendance:", document.getElementById("fileInput1")?.files?.[0] || "None");
                console.log("Hidden input 1:", document.getElementById("hiddenInput1")?.value ? "Has data" : "Empty");
                
                console.log("S2 License:", document.getElementById("fileInput2")?.files?.[0] || "None");
                console.log("Hidden input 2:", document.getElementById("hiddenInput2")?.value ? "Has data" : "Empty");
                
                // Check certificate of attendance
                if (!document.getElementById("fileInput1")?.files?.[0] && 
                    !document.getElementById("hiddenInput1")?.value) {
                    alert("Please upload Certificate of Attendance.");
                    isValid = false;
                }
                
                // Check S2 license
                if (!document.getElementById("fileInput2")?.files?.[0] && 
                    !document.getElementById("hiddenInput2")?.value) {
                    alert("Please upload S2 License.");
                    isValid = false;
                }
            }
            else if (role === "veterinarian") {
                // Log veterinarian document inputs - updated to match actual HTML IDs
                console.log("Animal Welfare Cert:", document.getElementById("fileVetInput1")?.files?.[0] || "None");
                console.log("PRC License:", document.getElementById("fileVetInput2")?.files?.[0] || "None");
                console.log("PTR:", document.getElementById("fileVetInput3")?.files?.[0] || "None");
                console.log("Appointment Order:", document.getElementById("fileVetInput4")?.files?.[0] || "None");
                
                // Check animal welfare certificate
                if (!document.getElementById("fileVetInput1")?.files?.[0] && 
                    !document.getElementById("hiddenInputVet1")?.value) {
                    alert("Please upload Certificate of Attendance (Animal Welfare Seminar).");
                    isValid = false;
                }
                
                // Check PRC license
                if (!document.getElementById("fileVetInput2")?.files?.[0] && 
                    !document.getElementById("hiddenInputVet2")?.value) {
                    alert("Please upload PRC License.");
                    isValid = false;
                }
                
                // Check PTR
                if (!document.getElementById("fileVetInput3")?.files?.[0] && 
                    !document.getElementById("hiddenInputVet3")?.value) {
                    alert("Please upload Professional Tax Receipt (PTR).");
                    isValid = false;
                }
                
                // Check appointment order
                if (!document.getElementById("fileVetInput4")?.files?.[0] && 
                    !document.getElementById("hiddenInputVet4")?.value) {
                    alert("Please upload Appointment Order.");
                    isValid = false;
                }
            }

            console.log("Form validation result:", isValid ? "Valid" : "Invalid");
            
            if (isValid) {
                // Set form to submit to the correct endpoint
                employeeForm.action = "../backends/clinic-employee.php?action=insert_employee";
                employeeForm.method = "POST";
                employeeForm.enctype = "multipart/form-data";
                console.log("Submitting form to:", employeeForm.action);
                employeeForm.submit();
            }
        });
    } else {
        console.error("Employee registration form not found in the DOM");
    }
});

function openImageModal() {
    // Remove any existing backdrop before opening imageModal
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

    // Show imageModal without backdrop
    var imageModal = new bootstrap.Modal(document.getElementById("imageModal"), {
        backdrop: false,
        keyboard: false
    });

    imageModal.show();

    // Lower z-index of addEmployeeModal and increase imageModal z-index
    document.getElementById("addEmployeeModal").style.zIndex = "1045";
    document.getElementById("imageModal").style.zIndex = "1050";

    // Ensure addEmployeeModal stays interactive
    document.getElementById("addEmployeeModal").classList.add("show");
}

// Ensure proper cleanup when closing modals
document.addEventListener("DOMContentLoaded", function () {
    function openImageModal() {
        // Get the modals
        let addEmployeeModal = document.getElementById("addEmployeeModal");
        let imageModal = document.getElementById("imageModal");

        // Ensure addEmployeeModal backdrop stays by setting a higher z-index
        let backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
            backdrop.style.zIndex = "1040"; // Keep it behind the modals
        }

        // Show imageModal without removing the backdrop
        var imageModalInstance = new bootstrap.Modal(imageModal, {
            backdrop: false, // Prevents Bootstrap from removing the backdrop
            keyboard: false
        });

        imageModalInstance.show();

        // Adjust z-index so imageModal appears on top
        addEmployeeModal.style.zIndex = "1050"; // Keep first modal behind
        imageModal.style.zIndex = "1060"; // Bring second modal to the front
    }

    // Ensure first modal remains in place when second modal closes
    document.getElementById("imageModal").addEventListener("hidden.bs.modal", function () {
        let backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
            backdrop.style.zIndex = "1045"; // Restore backdrop behind first modal
        }

        document.getElementById("addEmployeeModal").style.zIndex = "1050"; // Ensure first modal stays visible
    });

    // Attach function to "Change Image" button
    document.querySelector("#changeImageButton").addEventListener("click", openImageModal);
});

$(document).ready(function(){
    $.ajax({
        url: '../backends/clinic-employee.php?action=get_employee_profiles', // Updated URL to use the integrated endpoint
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var container = $('#profiles-container');

            container.empty(); // Clear any existing content
  
            if (data.length === 0) {
                container.append(`
                    <div class="col-12 text-center">
                        <div class="alert alert-info shadow-sm" role="alert">
                            No approved employees found.
                        </div>
                    </div>
                `);
                return;
            }
  
            $.each(data, function(index, profile) {
                var employeeId = profile.employee_id ? profile.employee_id : "Not Assigned"; // Handle missing employee_id
                var imageUrl = profile.pic_url ? profile.pic_url : 'path/to/default_image.jpg';
                var card = `
                    <div class="col-md-4">
                        <div class="card text-center bg-warning text-white shadow-lg">
                            <div class="card-body">
                                <img src="${imageUrl}" class="rounded-circle mb-3" alt="Profile Picture" width="100" height="100">
                                <h5 class="card-title">${profile.full_name}</h5>
                                <p class="card-text">${profile.role_name}</p>
                                <div class="bg-light text-dark p-3 rounded">
                                    <p class="mb-1"><strong>Employee ID:</strong> ${employeeId}</p>
                                    <p class="mb-1"><strong>Status:</strong> ${profile.applicant_status}</p>
                                </div>
                                <a href="#" class="text-white text-decoration-underline">View details</a>
                            </div>
                        </div>
                    </div>
                `;
                container.append(card);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error fetching profiles: " + error);
            $('#profiles-container').html(`
                <div class="col-12 text-center">
                    <div class="alert alert-danger shadow-sm" role="alert">
                        Error fetching employee profiles. Please try again later.
                    </div>
                </div>
            `);
        }
    });
});
  