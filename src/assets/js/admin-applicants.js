document.addEventListener("DOMContentLoaded", function () {
    const statusFilterOptions = document.querySelectorAll(".filter-option");
    const typeFilterOptions = document.querySelectorAll(".type-filter-option");
    const applicantsTableBody = document.querySelector("#applicantsTable tbody");
    const applicantHeader = document.getElementById("applicantHeader");

    let selectedStatus = "all";
    let selectedType = "all";

    // Mark the "All Types" option as active by default
    document.querySelector('.type-filter-option[data-filter="all"]').classList.add('active');
    // Mark the "All" status option as active by default
    document.querySelector('.filter-option[data-filter="all"]').classList.add('active');

    function updateHeader() {
        let statusText = selectedStatus !== "all" ? selectedStatus : "All";
        let typeText = selectedType !== "all" ? (selectedType.charAt(0).toUpperCase() + selectedType.slice(1)) : "All Types";
        applicantHeader.textContent = `Applicants > ${typeText} (${statusText})`;
    }

    function fetchApplicants() {
        // Force fresh API request with timestamp to avoid caching
        fetch(`../backends/admin-applicants.php?status=${selectedStatus}&type=${selectedType}&timestamp=${new Date().getTime()}`)
            .then(response => response.text())
            .then(data => {
                console.log("Raw Response:", data); // Debugging

                try {
                    const jsonData = JSON.parse(data);
                    console.log("Parsed JSON:", jsonData); // Debugging

                    if (!jsonData.success) {
                        console.error("Server Error:", jsonData.error);
                        applicantsTableBody.innerHTML = "<tr><td colspan='5' class='text-center text-danger'>Error fetching applicants</td></tr>";
                        return;
                    }

                    applicantsTableBody.innerHTML = ""; // Clear table

                    if (jsonData.data.length > 0) {
                        jsonData.data.forEach(applicant => {
                            // Extract applicant data
                            const applicantData = applicant.applicant || {};
                            const applicantAddress = applicantData.address || {};
                            
                            // Extract petitioner data
                            const petitionerData = applicant.petitioner || {};
                            const petitionerAddress = petitionerData.address || {};
                            
                            // Extract clinic data
                            const clinicData = applicant.clinic || {};
                            const clinicAddress = clinicData.address || {};

                            // Prevent undefined values
                            const applicantprofilePic = applicantData.profile_pic || "../assets/images/profile.jpg";
                            const applicantfullName = applicantData.full_name || "No Name";
                            function capitalizeFirstLetter(str) {
                                return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
                            }

                            const applicantRole = capitalizeFirstLetter(applicantData.role);

                            const applicantFirstname = applicantData.first_name || "Not provided";
                            const applicantMiddlename = applicantData.middle_name || "Not provided";
                            const applicantLastname = applicantData.last_name || "Not provided";
                            const applicantNameExtension = applicantData.name_extension || "Not provided";

                            const applicantEmails = applicantData.emails || "Not provided";
                            const applicantContacts = applicantData.contact_numbers || "Not provided";

                            const applicantLot = applicantAddress.lot_number || "Not provided";
                            const applicantStreetNum = applicantAddress.street_number || "Not provided";
                            const applicantStreetName = applicantAddress.street_name || "Not provided";
                            const applicantSitio = applicantAddress.sitio || "Not provided";
                            const applicantBarangay = applicantAddress.barangay || "Not provided";
                            const applicantCity = applicantAddress.city || "Not provided";
                            const applicantMunicipality = applicantAddress.municipality || "Not provided";
                            const applicantProvince = applicantAddress.province || "Not provided";
                            const applicantRegion = applicantAddress.region || "Not provided";
                    
                            const applicant_lat = parseFloat(applicantAddress.latitude);
                            const applicant_lng = parseFloat(applicantAddress.longitude);

                            const applicantDocumentsArray = applicantData.documents || [];
                            const applicantDocuments = JSON.stringify(applicantDocumentsArray);

                            const petitionerPic = petitionerData.profile_pic || "../assets/images/profile.jpg";
                            const petitionerName = petitionerData.full_name || "No Name";

                            const petitionerRole = capitalizeFirstLetter(petitionerData.role);

                            const petitionerFirstname = petitionerData.first_name || "Not provided";
                            const petitionerMiddlename = petitionerData.middle_name || "Not provided";
                            const petitionerLastname = petitionerData.last_name || "Not provided";
                            const petitionerNameExtension = petitionerData.name_extension || "Not provided";

                            const petitionerEmails = petitionerData.emails || "Not provided";
                            const petitionerContacts = petitionerData.contact_numbers || "Not provided";

                            const petitionerLot = petitionerAddress.lot_number || "Not provided";
                            const petitionerStreetNum = petitionerAddress.street_number || "Not provided";
                            const petitionerStreetName = petitionerAddress.street_name || "Not provided";
                            const petitionerSitio = petitionerAddress.sitio || "Not provided";
                            const petitionerBarangay = petitionerAddress.barangay || "Not provided";
                            const petitionerCity = petitionerAddress.city || "Not provided";
                            const petitionerMunicipality = petitionerAddress.municipality || "Not provided";
                            const petitionerProvince = petitionerAddress.province || "Not provided";
                            const petitionerRegion = petitionerAddress.region || "Not provided";

                            const petitioner_lat = parseFloat(petitionerAddress.latitude);
                            const petitioner_lng = parseFloat(petitionerAddress.longitude);

                            const petitionerDocumentsArray = petitionerData.documents || [];
                            const petitionerDocuments = JSON.stringify(petitionerDocumentsArray);

                            const clinicLogo = clinicData.clinic_logo || "../assets/images/building_logo.jpg";
                            const clinicName = clinicData.clinic_name || "No Name";
                            const clinicBusinessType = clinicData.business_type || "Not provided";
                            const clinicFacilityType = clinicData.facility_type || "Not provided";

                            const clinicEmails = clinicData.emails || "Not provided";
                            const clinicContacts = clinicData.contact_numbers || "Not provided";

                            const clinicLot = clinicAddress.lot_number || "Not provided";
                            const clinicStreetNum = clinicAddress.street_number || "Not provided";
                            const clinicStreetName = clinicAddress.street_name || "Not provided";
                            const clinicSitio = clinicAddress.sitio || "Not provided";
                            const clinicBarangay = clinicAddress.barangay || "Not provided";
                            const clinicCity = clinicAddress.city || "Not provided";
                            const clinicMunicipality = clinicAddress.municipality || "Not provided";
                            const clinicProvince = clinicAddress.province || "Not provided";
                            const clinicRegion = clinicAddress.region || "Not provided";

                            const clinic_lat = parseFloat(clinicAddress.latitude);
                            const clinic_lng = parseFloat(clinicAddress.longitude);

                            const clinicDocumentsArray = clinicData.documents || [];
                            const clinicDocuments = JSON.stringify(clinicDocumentsArray);

                            // Process type: capitalize first letter
                            const roleType = applicant.type || "N/A";
                            const formattedType = roleType.charAt(0).toUpperCase() + roleType.slice(1);

                            // Use status as is (no capitalization here)
                            const status = applicant.status || "N/A";

                            // Determine badge color for status
                            const statusBadgeClass =
                                status === "Approved" ? "bg-success" :
                                    status === "Pending" ? "bg-warning text-dark" :
                                        "bg-danger";

                            // Build the row with each column vertically and horizontally centered
                            const row = `
                                <tr data-applicant-account-id="${applicant.application_id}">
                                    
                                    <!-- Applicant Column -->
                                    <td class="align-middle text-center">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <img src="${applicantprofilePic}" alt="Applicant" 
                                                 class="rounded-circle" width="40" height="40">
                                            <span class="ms-2">${applicantfullName}</span>
                                        </div>
                                    </td>
    
                                    <!-- Petitioner Column -->
                                    <td class="align-middle text-center">
                                        <div class="d-flex align-items-center justify-content-center">
                                            <img src="${petitionerPic}" alt="Petitioner" 
                                                 class="rounded-circle" width="40" height="40">
                                            <span class="ms-2">${petitionerName}</span>
                                        </div>
                                    </td>
    
                                    <!-- Type Column (capitalized) -->
                                    <td class="align-middle text-center">${formattedType}</td>
    
                                    <!-- Status Column -->
                                    <td class="align-middle text-center">
                                        <span class="badge ${statusBadgeClass}">${status}</span>
                                    </td>
    
                                    <!-- Actions Column -->
                                    <td class="align-middle text-center">
                                        <button class="btn btn-sm btn-info text-white view-btn" 
                                                data-bs-toggle="modal" data-bs-target="#viewModal" 
                                                data-applicant-account-id="${applicant.application_id}"
                                                data-applicantpic="${applicantprofilePic}"
                                                data-applicantFullname="${applicantfullName}"
                                                
                                                data-applicantrole="${applicantRole}"

                                                data-applicantFirstname="${applicantFirstname}"
                                                data-applicantMiddlename="${applicantMiddlename}"
                                                data-applicantLastname="${applicantLastname}"
                                                data-applicantNameExtension="${applicantNameExtension}"

                                                data-applicantemails='${JSON.stringify(applicantEmails)}'
                                                data-applicantcontacts='${JSON.stringify(applicantContacts)}'

                                                data-applicantlotnumber="${applicantLot}"
                                                data-applicantstreetnumber="${applicantStreetNum}"
                                                data-applicantstreetname="${applicantStreetName}"
                                                data-applicantsitio="${applicantSitio}"
                                                data-applicantbarangay="${applicantBarangay}"
                                                data-applicantcity="${applicantCity}"
                                                data-applicantmunicipality="${applicantMunicipality}"
                                                data-applicantprovince="${applicantProvince}"
                                                data-applicantregion="${applicantRegion}"
                                                data-applicantlatitude="${applicant_lat}"
                                                data-applicantlongitude="${applicant_lng}"

                                                data-applicantDocument='${applicantDocuments}'

                                                data-petitionerpic="${petitionerPic}"

                                                data-petitionerrole="${petitionerRole}"

                                                data-petitionerfullname="${petitionerName}"

                                                data-petitionerFirstname="${petitionerFirstname}"
                                                data-petitionerMiddlename="${petitionerMiddlename}"
                                                data-petitionerLastname="${petitionerLastname}"
                                                data-petitionerNameExtension="${petitionerNameExtension}"

                                                data-petitioneremails='${JSON.stringify(petitionerEmails)}'
                                                data-petitionercontacts='${JSON.stringify(petitionerContacts)}'

                                                data-petitionerlotnumber="${petitionerLot}"
                                                data-petitionerstreetnumber="${petitionerStreetNum}"
                                                data-petitionerstreetname="${petitionerStreetName}"
                                                data-petitionerbarangay="${petitionerBarangay}"
                                                data-petitionersitio="${petitionerSitio}"
                                                data-petitionercity="${petitionerCity}"
                                                data-petitionermunicipality="${petitionerMunicipality}"
                                                data-petitionerprovince="${petitionerProvince}"
                                                data-petitionerregion="${petitionerRegion}"
                                                data-petitionerlatitude="${petitioner_lat}"
                                                data-petitionerlongitude="${petitioner_lng}"

                                                data-petitionerDocument='${petitionerDocuments}'
                                                
                                                data-clinicprofilepic="${clinicLogo}"
                                                data-clinicname="${clinicName}"
                                                data-clinicbusinesstype="${clinicBusinessType}"
                                                data-clinicfacilitytype="${clinicFacilityType}"

                                                data-clinicemails='${JSON.stringify(clinicEmails)}'
                                                data-cliniccontacts='${JSON.stringify(clinicContacts)}'
                                                
                                                data-cliniclotnumber="${clinicLot}"
                                                data-clinicstreetnumber="${clinicStreetNum}"
                                                data-clinicstreetname="${clinicStreetName}"
                                                data-clinicsitio="${clinicSitio}"
                                                data-clinicbarangay="${clinicBarangay}"
                                                data-cliniccity="${clinicCity}"
                                                data-clinicmunicipality="${clinicMunicipality}"
                                                data-clinicprovince="${clinicProvince}"
                                                data-clinicregion="${clinicRegion}"
                                                data-cliniclatitude="${clinic_lat}"
                                                data-cliniclongitude="${clinic_lng}"

                                                data-clinicDocument='${clinicDocuments}'
                                                data-role-type="${roleType}"
                                                data-status="${status}">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        
                                        <!-- Status action buttons (only if status is not already set) -->
                                        ${getStatusButtons(applicant.application_id, status)}
                                    </td>
                                </tr>
                            `;
                            applicantsTableBody.innerHTML += row;
                        });
                    } else {
                        applicantsTableBody.innerHTML = "<tr><td colspan='5' class='text-center'>No applicants found</td></tr>";
                    }

                    // Attach event listeners to the newly created buttons
                    attachViewButtonListeners();
                    attachStatusButtonListeners();

                } catch (e) {
                    console.error("Error parsing response:", e);
                    applicantsTableBody.innerHTML = "<tr><td colspan='5' class='text-center text-danger'>Error loading applicants: " + e.message + "</td></tr>";
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                applicantsTableBody.innerHTML = "<tr><td colspan='5' class='text-center text-danger'>Network error: " + error.message + "</td></tr>";
            });
    }

    // Status filter event listeners
    statusFilterOptions.forEach(option => {
        option.addEventListener("click", function (e) {
            e.preventDefault();
            
            // Update selected status
            selectedStatus = this.dataset.filter;
            
            // Update UI to show active filter
            statusFilterOptions.forEach(opt => opt.classList.remove("active"));
            this.classList.add("active");
            
            // Update header and reload data
            updateHeader();
            fetchApplicants();
        });
    });

    // Type filter event listeners
    typeFilterOptions.forEach(option => {
        option.addEventListener("click", function (e) {
            e.preventDefault();
            
            // Update selected type
            selectedType = this.dataset.filter;
            
            // Update UI to show active filter
            typeFilterOptions.forEach(opt => opt.classList.remove("active"));
            this.classList.add("active");
            
            // Update header and reload data
            updateHeader();
            fetchApplicants();
        });
    });

    // Utility functions for creating buttons based on current status
    function getStatusButtons(applicationId, currentStatus) {
        if (currentStatus === "Pending") {
            return `
                <div class="mt-2">
                    <button class="btn btn-sm btn-success approve-btn mr-1" data-applicant-id="${applicationId}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-sm btn-danger reject-btn" data-applicant-id="${applicationId}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
        } else if (currentStatus === "Approved") {
            return `
                <div class="mt-2">
                    <button class="btn btn-sm btn-danger reject-btn" data-applicant-id="${applicationId}">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
        } else if (currentStatus === "Rejected") {
            return `
                <div class="mt-2">
                    <button class="btn btn-sm btn-success approve-btn" data-applicant-id="${applicationId}">
                        <i class="fas fa-check"></i> Approve
                    </button>
                </div>
            `;
        }
        return "";
    }

    // Attach event listeners to status buttons
    function attachStatusButtonListeners() {
        document.querySelectorAll(".approve-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const applicantId = this.dataset.applicantId;
                updateApplicantStatus(applicantId, "Approved");
            });
        });

        document.querySelectorAll(".reject-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const applicantId = this.dataset.applicantId;
                updateApplicantStatus(applicantId, "Rejected");
            });
        });
    }

    // Attach event listeners to view buttons
    function attachViewButtonListeners() {
        document.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                // Event listeners are handled by Bootstrap's modal event
                // This function exists to ensure all buttons have proper event handling
                console.log("View button clicked for applicant:", this.dataset.applicantAccountId);
            });
        });
    }

    document.getElementById('viewModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget; // the .view-btn

        // [APPLICANT]
        const applicantPic = button.getAttribute('data-applicantpic') || "../assets/images/profile.jpg";
        const applicantRole = button.getAttribute('data-applicantrole') || "";
        const applicantFname = button.getAttribute('data-applicantFirstname') || "";
        const applicantMname = button.getAttribute('data-applicantMiddlename') || "";
        const applicantLname = button.getAttribute('data-applicantLastname') || "";
        const applicantNextension = button.getAttribute('data-applicantNameExtension') || "";

        const applicantEmails = JSON.parse(button.getAttribute('data-applicantemails'));
        const applicantContacts = JSON.parse(button.getAttribute('data-applicantcontacts'));
        const applicantEmailsContainer = document.getElementById('applicantEmailsContainer');
        const applicantContactsContainer = document.getElementById('applicantContactsContainer');

        const applicantLot = button.getAttribute('data-applicantlotnumber') || "";
        const ApplicantStreetnumber = button.getAttribute('data-applicantstreetnumber') || "";
        const applicantStreetName = button.getAttribute('data-applicantstreetname') || "";
        const applicantSitio = button.getAttribute('data-applicantsitio') || "";
        const applicantBarangay = button.getAttribute('data-applicantbarangay') || "";
        const applicantCity = button.getAttribute('data-applicantcity') || "";
        const applicantMunicipality = button.getAttribute('data-applicantmunicipality') || "";
        const applicantProvince = button.getAttribute('data-applicantprovince') || "";
        const applicantRegion = button.getAttribute('data-applicantregion') || "";

        applicantEmailsContainer.innerHTML = "";
        applicantContactsContainer.innerHTML = "";

        // Dynamically create and append email input fields
        if (applicantEmails.length > 0) {
            applicantEmails.forEach((email, index) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control text-center';
                input.value = email;
                input.readOnly = true;
                input.id = `applicant_email${index + 1}`;
                
                div.appendChild(input);
                applicantEmailsContainer.appendChild(div);
            });
        } else {
            applicantEmailsContainer.innerHTML = "<p class='text-center text-muted'>No emails provided</p>";
        }

        // Dynamically create and append contact input fields
        if (applicantContacts.length > 0) {
            applicantContacts.forEach((contact, index) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control text-center';
                input.value = contact;
                input.readOnly = true;
                input.id = `applicant_contact${index + 1}`;
                
                div.appendChild(input);
                applicantContactsContainer.appendChild(div);
            });
        } else {
            applicantContactsContainer.innerHTML = "<p class='text-center text-muted'>No contact numbers provided</p>";
        }

        const applicantDocumentsJSON = button.getAttribute('data-applicantDocument') || "[]";
        let applicantDocuments;
        try {
            applicantDocuments = JSON.parse(applicantDocumentsJSON);
        } catch (e) {
            console.error("Error parsing applicant documents:", e);
            applicantDocuments = [];
        }

        // Assume applicantDocuments is already parsed from the data attribute
        const applicantDocsContainer = document.getElementById('applicantDocsContainer');
        applicantDocsContainer.innerHTML = ""; // Clear any previous content

        // Create a row element with Bootstrap classes to automatically arrange columns
        const rowElement = document.createElement('div');
        rowElement.className = "row row-cols-2 g-4 text-center";

        if (applicantDocuments && applicantDocuments.length > 0) {
            // Loop through each document returned from the database
            applicantDocuments.forEach(doc => {
                // Determine file source (fallback to default image if no file provided)
                const fileSrc = doc.file && doc.file.trim() !== "" ? doc.file : "../assets/images/doc_default.png";

                // Create a column div
                const colDiv = document.createElement("div");
                colDiv.className = "col";

                // Create a card container
                const cardDiv = document.createElement("div");
                cardDiv.className = "border rounded p-3 h-100 d-flex flex-column justify-content-center";

                // Create the image element
                const imgEl = document.createElement("img");
                imgEl.src = fileSrc;
                imgEl.alt = doc.type; // Use the document type as alt text
                imgEl.className = "img-fluid mb-2";

                // Create the heading for the document type
                const h6El = document.createElement("h6");
                h6El.className = "mb-0";
                h6El.textContent = doc.type;

                // Append image and heading to the card, then the card to the column
                cardDiv.appendChild(imgEl);
                cardDiv.appendChild(h6El);
                colDiv.appendChild(cardDiv);
                rowElement.appendChild(colDiv);
            });
        } else {
            // If no documents are found, display a message
            rowElement.innerHTML = "<div class='col'><p class='text-muted text-center'>No documents provided</p></div>";
        }

        // Append the row element to your container
        applicantDocsContainer.appendChild(rowElement);

        document.getElementById('applicant_modalProfilePic').src = applicantPic;

        document.getElementById('applicant_modalRole').value = applicantRole;
        document.getElementById('applicant_modalFirstName').value = applicantFname;
        document.getElementById('applicant_modalMiddleName').value = applicantMname;
        document.getElementById('applicant_modalLastName').value = applicantLname;
        document.getElementById('applicant_modalNameExtension').value = applicantNextension;

        document.getElementById('applicant_modalLotNumber').value = applicantLot;
        document.getElementById('applicant_modalStreetNumber').value = ApplicantStreetnumber;
        document.getElementById('applicant_modalStreetName').value = applicantStreetName;
        document.getElementById('applicant_modalSitio').value = applicantSitio;
        document.getElementById('applicant_modalBarangay').value = applicantBarangay;
        document.getElementById('applicant_modalCity').value = applicantCity;
        document.getElementById('applicant_modalMunicipality').value = applicantMunicipality;
        document.getElementById('applicant_modalProvince').value = applicantProvince;
        document.getElementById('applicant_modalRegion').value = applicantRegion;

        const petitionerPic = button.getAttribute('data-petitionerpic') || "../assets/images/profile.jpg";
        const petitionerRole = button.getAttribute('data-petitionerrole') || "";
        const petitionerFname = button.getAttribute('data-petitionerFirstname') || "";
        const petitionerMname = button.getAttribute('data-petitionerMiddlename') || "";
        const petitionerLname = button.getAttribute('data-petitionerLastname') || "";
        const petitionerNextension = button.getAttribute('data-petitionerNameExtension') || "";

        const petitionerEmails = JSON.parse(button.getAttribute('data-petitioneremails'));
        const petitionerContacts = JSON.parse(button.getAttribute('data-petitionercontacts'));
        const petitionerEmailsContainer = document.getElementById('petitionerEmailsContainer');
        const petitionerContactsContainer = document.getElementById('petitionerContactsContainer');

        const petitionerLot = button.getAttribute('data-petitionerlotnumber') || "";
        const petitionerStreetnumber = button.getAttribute('data-petitionerstreetnumber') || "";
        const petitionerStreetName = button.getAttribute('data-petitionerstreetname') || "";
        const petitionerSitio = button.getAttribute('data-petitionersitio') || "";
        const petitionerBarangay = button.getAttribute('data-petitionerbarangay') || "";
        const petitionerCity = button.getAttribute('data-petitionercity') || "";
        const petitionerMunicipality = button.getAttribute('data-petitionermunicipality') || "";
        const petitionerProvince = button.getAttribute('data-petitionerprovince') || "";
        const petitionerRegion = button.getAttribute('data-petitionerregion') || "";

        petitionerEmailsContainer.innerHTML = "";
        petitionerContactsContainer.innerHTML = "";

        // Dynamically create and append email input fields
        if (petitionerEmails.length > 0) {
            petitionerEmails.forEach((email, index) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control text-center';
                input.value = email;
                input.readOnly = true;
                input.id = `petitioner_email${index + 1}`;
                
                div.appendChild(input);
                petitionerEmailsContainer.appendChild(div);
            });
        } else {
            petitionerEmailsContainer.innerHTML = "<p class='text-center text-muted'>No emails provided</p>";
        }

        // Dynamically create and append contact input fields
        if (petitionerContacts.length > 0) {
            petitionerContacts.forEach((contact, index) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control text-center';
                input.value = contact;
                input.readOnly = true;
                input.id = `petitioner_contact${index + 1}`;
                
                div.appendChild(input);
                petitionerContactsContainer.appendChild(div);
            });
        } else {
            petitionerContactsContainer.innerHTML = "<p class='text-center text-muted'>No contact numbers provided</p>";
        }

        const petitionerDocumentsJSON = button.getAttribute('data-petitionerDocument') || "[]";
        const rawString = button.getAttribute('data-petitionerDocument') || "[]";
        console.log("Raw data-petitionerDocument attribute:", rawString);
        let petitionerDocuments;
        try {
            petitionerDocuments = JSON.parse(petitionerDocumentsJSON);
        } catch (e) {
            console.error("Error parsing applicant documents:", e);
            petitionerDocuments = [];
        }

        // Assume applicantDocuments is already parsed from the data attribute
        const petitionerDocsContainer = document.getElementById('petitionerDocsContainer');
        petitionerDocsContainer.innerHTML = ""; // Clear any previous content

        // Create a row element with Bootstrap classes to automatically arrange columns
        const petitionerrowElement = document.createElement('div');
        petitionerrowElement.className = "row row-cols-2 g-4 text-center";

        if (petitionerDocuments && petitionerDocuments.length > 0) {
            // Loop through each document returned from the database
            petitionerDocuments.forEach(doc => {
                // Determine file source (fallback to default image if no file provided)
                const fileSrc = doc.file && doc.file.trim() !== "" ? doc.file : "../assets/images/doc_default.png";

                // Create a column div
                const colDiv = document.createElement("div");
                colDiv.className = "col";

                // Create a card container
                const cardDiv = document.createElement("div");
                cardDiv.className = "border rounded p-3 h-100 d-flex flex-column justify-content-center";

                // Create the image element
                const imgEl = document.createElement("img");
                imgEl.src = fileSrc;
                imgEl.alt = doc.type; // Use the document type as alt text
                imgEl.className = "img-fluid mb-2";

                // Create the heading for the document type
                const h6El = document.createElement("h6");
                h6El.className = "mb-0";
                h6El.textContent = doc.type;

                // Append image and heading to the card, then the card to the column
                cardDiv.appendChild(imgEl);
                cardDiv.appendChild(h6El);
                colDiv.appendChild(cardDiv);
                petitionerrowElement.appendChild(colDiv);
            });
        } else {
            // If no documents are found, display a message
            petitionerrowElement.innerHTML = "<div class='col'><p class='text-muted text-center'>No documents provided</p></div>";
        }

        // Append the row element to your container
        petitionerDocsContainer.appendChild(petitionerrowElement);

        document.getElementById('petitioner_modalProfilePic').src = petitionerPic;
        document.getElementById('petitioner_modalRole').value = petitionerRole;
        document.getElementById('petitioner_modalFirstName').value = petitionerFname;
        document.getElementById('petitioner_modalMiddleName').value = petitionerMname;
        document.getElementById('petitioner_modalLastName').value = petitionerLname;
        document.getElementById('petitioner_modalNameExtension').value = petitionerNextension;

        document.getElementById('petitioner_modalLotNumber').value = petitionerLot;
        document.getElementById('petitioner_modalStreetNumber').value = petitionerStreetnumber;
        document.getElementById('petitioner_modalStreetName').value = petitionerStreetName;
        document.getElementById('petitioner_modalSitio').value = petitionerSitio;
        document.getElementById('petitioner_modalBarangay').value = petitionerBarangay;
        document.getElementById('petitioner_modalCity').value = petitionerCity;
        document.getElementById('petitioner_modalMunicipality').value = petitionerMunicipality;
        document.getElementById('petitioner_modalProvince').value = petitionerProvince;
        document.getElementById('petitioner_modalRegion').value = petitionerRegion;

        const clinicLogo = button.getAttribute('data-clinicprofilepic') || "../assets/images/building_logo.jpg";
        const clinicName = button.getAttribute('data-clinicname') || "";
        const clinicFacilityType = button.getAttribute('data-clinicfacilitytype') || "";
        const clinicfacilityTypesArr = clinicFacilityType.split(',').map(type => type.trim());

        const clinicFacilityTypecontainer = document.getElementById("facilityTypesContainer");
        // Clear any existing content
        clinicFacilityTypecontainer.innerHTML = "";
        
        // Create an input field for each facility type from the database
        clinicfacilityTypesArr.forEach((type, index) => {
            const input = document.createElement("input");
            input.type = "text";
            input.id = "clinic_modalFacilityType" + (index + 1);
            input.name = "clinic_modalFacilityType" + (index + 1);
            input.className = "form-control flex-fill text-center";
            input.value = type;
            input.readOnly = true;
            clinicFacilityTypecontainer.appendChild(input);
        });
        
        const clinicBusinessType = button.getAttribute('data-clinicbusinesstype') || "";
    
        const clinicEmails = JSON.parse(button.getAttribute('data-clinicemails'));
        const clinicContacts = JSON.parse(button.getAttribute('data-cliniccontacts'));
        const clinicEmailsContainer = document.getElementById('clinicEmailsContainer');
        const clinicContactsContainer = document.getElementById('clinicContactsContainer');

        const clinicLot = button.getAttribute('data-cliniclotnumber') || "";
        const clinicStreetnumber = button.getAttribute('data-clinicstreetnumber') || "";
        const clinicStreetName = button.getAttribute('data-clinicstreetname') || "";
        const clinicSitio = button.getAttribute('data-clinicsitio') || "";
        const clinicBarangay = button.getAttribute('data-clinicbarangay') || "";
        const clinicCity = button.getAttribute('data-cliniccity') || "";
        const clinicMunicipality = button.getAttribute('data-clinicmunicipality') || "";
        const clinicProvince = button.getAttribute('data-clinicprovince') || "";
        const clinicRegion = button.getAttribute('data-clinicregion') || "";

        clinicEmailsContainer.innerHTML = "";
        clinicContactsContainer.innerHTML = "";

        // Dynamically create and append email input fields
        if (clinicEmails.length > 0) {
            clinicEmails.forEach((email, index) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control text-center';
                input.value = email;
                input.readOnly = true;
                input.id = `clinic_email${index + 1}`;
                
                div.appendChild(input);
                clinicEmailsContainer.appendChild(div);
            });
        } else {
            clinicEmailsContainer.innerHTML = "<p class='text-center text-muted'>No emails provided</p>";
        }

        // Dynamically create and append contact input fields
        if (clinicContacts.length > 0) {
            clinicContacts.forEach((contact, index) => {
                const div = document.createElement('div');
                div.classList.add('mb-2');
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control text-center';
                input.value = contact;
                input.readOnly = true;
                input.id = `clinic_contact${index + 1}`;
                
                div.appendChild(input);
                clinicContactsContainer.appendChild(div);
            });
        } else {
            clinicContactsContainer.innerHTML = "<p class='text-center text-muted'>No contact numbers provided</p>";
        }

        const clinicDocumentsJSON = button.getAttribute('data-clinicDocument') || "[]";
        const clinicrawString = button.getAttribute('data-clinicDocument') || "[]";
        console.log("Raw data-clinicDocument attribute:", clinicrawString);
        let clinicDocuments;
        try {
            clinicDocuments = JSON.parse(clinicDocumentsJSON);
        } catch (e) {
            console.error("Error parsing applicant documents:", e);
            clinicDocuments = [];
        }

        // Assume applicantDocuments is already parsed from the data attribute
        const clinicDocsContainer = document.getElementById('clinicDocsContainer');
        clinicDocsContainer.innerHTML = ""; // Clear any previous content

        // Create a row element with Bootstrap classes to automatically arrange columns
        const clinicrowElement = document.createElement('div');
        clinicrowElement.className = "row row-cols-2 g-4 text-center";

        if (clinicDocuments && clinicDocuments.length > 0) {
            // Loop through each document returned from the database
            clinicDocuments.forEach(doc => {
                // Determine file source (fallback to default image if no file provided)
                const fileSrc = doc.file && doc.file.trim() !== "" ? doc.file : "../assets/images/doc_default.png";

                // Create a column div
                const colDiv = document.createElement("div");
                colDiv.className = "col";

                // Create a card container
                const cardDiv = document.createElement("div");
                cardDiv.className = "border rounded p-3 h-100 d-flex flex-column justify-content-center";

                // Create the image element
                const imgEl = document.createElement("img");
                imgEl.src = fileSrc;
                imgEl.alt = doc.type; // Use the document type as alt text
                imgEl.className = "img-fluid mb-2";

                // Create the heading for the document type
                const h6El = document.createElement("h6");
                h6El.className = "mb-0";
                h6El.textContent = doc.type;

                // Append image and heading to the card, then the card to the column
                cardDiv.appendChild(imgEl);
                cardDiv.appendChild(h6El);
                colDiv.appendChild(cardDiv);
                clinicrowElement.appendChild(colDiv);
            });
        } else {
            // If no documents are found, display a message
            clinicrowElement.innerHTML = "<div class='col'><p class='text-muted text-center'>No documents provided</p></div>";
        }

        // Append the row element to your container
        clinicDocsContainer.appendChild(clinicrowElement);

        document.getElementById('clinic_modalProfilePic').src = clinicLogo;
        
        document.getElementById('clinic_modalName').value = clinicName;

        document.getElementById('clinic_modalBusinessType').value = clinicBusinessType;
        document.getElementById('petitioner_modalMiddleName').value = petitionerMname;
        document.getElementById('petitioner_modalLastName').value = petitionerLname;
        document.getElementById('petitioner_modalNameExtension').value = petitionerNextension;

        document.getElementById('clinic_modalLotNumber').value = clinicLot;
        document.getElementById('clinic_modalStreetNumber').value = clinicStreetnumber;
        document.getElementById('clinic_modalStreetName').value = clinicStreetName;
        document.getElementById('clinic_modalSitio').value = clinicSitio;
        document.getElementById('clinic_modalBarangay').value = clinicBarangay;
        document.getElementById('clinic_modalCity').value = clinicCity;
        document.getElementById('clinic_modalMunicipality').value = clinicMunicipality;
        document.getElementById('clinic_modalProvince').value = clinicProvince;
        document.getElementById('clinic_modalRegion').value = clinicRegion;
        // etc...
    });


    // Function to update applicant status
    function updateApplicantStatus(applicantId, newStatus) {
        fetch("../backends/admin-applicants.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ applicant_id: applicantId, status: newStatus })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Status updated to ${newStatus}`);
                    fetchApplicants(); // Refresh table after update
                } else {
                    alert("Failed to update status.");
                }
            })
            .catch(error => {
                console.error("Update Error:", error);
                alert("An error occurred while updating status.");
            });
    }

    // Coordinates and zoom levels provided by your variables
    var applicantDefaultLat = 34.0522;
    var applicantDefaultLng = -118.2437;
    var applicantDefaultZoom = 10;

    var petitionerDefaultLat = 40.7128;
    var petitionerDefaultLng = -74.0060;
    var petitionerDefaultZoom = 12;

    var vetDefaultLat = 52.5200;
    var vetDefaultLng = 13.4050;
    var vetDefaultZoom = 10;

    // Initialize the maps using only the provided coordinates
    var applicantMap = L.map('applicant_map').setView([applicantDefaultLat, applicantDefaultLng], applicantDefaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(applicantMap);

    var petitionerMap = L.map('petitioner_map').setView([petitionerDefaultLat, petitionerDefaultLng], petitionerDefaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(petitionerMap);

    var vetMap = L.map('vet_map').setView([vetDefaultLat, vetDefaultLng], vetDefaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(vetMap);

    // Ensure proper resizing if the maps are within tabs
    var applicantTabTrigger = document.querySelector('button[data-bs-target="#applicantAddress"]');
    if (applicantTabTrigger) {
      applicantTabTrigger.addEventListener('shown.bs.tab', function () {
        applicantMap.invalidateSize();
      });
    }

    var petitionerTabTrigger = document.querySelector('button[data-bs-target="#petitionerAddress"]');
    if (petitionerTabTrigger) {
      petitionerTabTrigger.addEventListener('shown.bs.tab', function () {
        petitionerMap.invalidateSize();
      });
    }

    var vetTabTrigger = document.querySelector('button[data-bs-target="#vetclinicAddress"]');
    if (vetTabTrigger) {
      vetTabTrigger.addEventListener('shown.bs.tab', function () {
        vetMap.invalidateSize();
      });
    }

    // Helper function to check if a coordinate is valid (i.e., not null, not empty, and a valid number)
    function isValidCoordinate(coord) {
      return coord !== null && coord !== '' && !isNaN(coord);
    }

    // Applicant marker: add a marker if valid. If the marker is added, re-center the map to the marker.
    function addApplicantMarker(name, city, lat, lng) {
      if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
        L.marker([lat, lng]).addTo(applicantMap)
          .bindPopup(`<strong>${name}</strong><br>${city}`);
        // Re-center the map on the marker's position
        applicantMap.setView([lat, lng], applicantMap.getZoom());
      } else {
        // Display a popup at the current map center if no valid coordinates are provided
        L.popup()
          .setLatLng(applicantMap.getCenter())
          .setContent(`<strong>${name}</strong><br>Location not provided`)
          .openOn(applicantMap);
      }
    }

    // Petitioner marker: add a marker if valid. If the marker is added, re-center the map to the marker.
    function addPetitionerMarker(petitionerName, petitionerCity, petitioner_lat, petitioner_lng) {
      if (isValidCoordinate(petitioner_lat) && isValidCoordinate(petitioner_lng)) {
        L.marker([petitioner_lat, petitioner_lng]).addTo(petitionerMap)
          .bindPopup(`<strong>${petitionerName}</strong><br>${petitionerCity}`);
        petitionerMap.setView([petitioner_lat, petitioner_lng], petitionerMap.getZoom());
      } else {
        L.popup()
          .setLatLng(petitionerMap.getCenter())
          .setContent(`<strong>${petitionerName}</strong><br>Location not provided`)
          .openOn(petitionerMap);
      }
    }

    // Vet marker: add a marker if valid. If the marker is added, re-center the map to the marker.
    function addVetMarker(clinicName, clinicCity, clinic_lat, clinic_lng) {
      if (isValidCoordinate(clinic_lat) && isValidCoordinate(clinic_lng)) {
        L.marker([clinic_lat, clinic_lng]).addTo(vetMap)
          .bindPopup(`<strong>${clinicName}</strong><br>${clinicCity}`);
        vetMap.setView([clinic_lat, clinic_lng], vetMap.getZoom());
      } else {
        L.popup()
          .setLatLng(vetMap.getCenter())
          .setContent(`<strong>${clinicName}</strong><br>Location not provided`)
          .openOn(vetMap);
      }
    }

    // Initial load
    updateHeader();
    fetchApplicants();
});
