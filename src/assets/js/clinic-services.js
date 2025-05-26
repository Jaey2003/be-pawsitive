$(document).ready(function () {
    // Function to load the services for a given page
    function loadServices(page) {
        $.ajax({
            url: '../backends/clinic-services.php',
            type: 'GET',
            data: { page: page },
            success: function (data) {
                $('#services-container').html(data);
            },
            error: function () {
                alert('Error loading services.');
            }
        });
    }

    // Load page 1 by default on initial page load
    loadServices(1);

    // Delegate the click event of pagination links to the container
    $(document).on('click', '.pagination a', function (e) {
        e.preventDefault();
        var page = $(this).data('page');
        loadServices(page);
    });
    
    // Initialize image preview functionality
    initImagePreview();
    
    // Initialize form submission
    initFormSubmission(loadServices);
});

function showToast(message) {
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
      <div id="${toastId}" class="toast toast-orange" role="alert" aria-live="assertive" aria-atomic="true" data-delay="3000">
        <div class="toast-body">
          ${message}
        </div>
      </div>`;
    const container = document.getElementById("toast-container");
    if (container) {
        container.insertAdjacentHTML("beforeend", toastHTML);
        const $toast = $('#' + toastId);
        $toast.toast('show');
        // Remove the toast from DOM once hidden
        $toast.on('hidden.bs.toast', function () {
          $toast.remove();
        });
    } else {
        console.error("Toast container not found");
        alert(message); // Fallback to alert if toast container is missing
    }
}

// Submit form asynchronously using Fetch API
function initFormSubmission(loadServicesCallback) {
    const form = document.getElementById("addServiceForm");
    if (!form) {
        console.error("Add service form not found");
        return;
    }
    
    form.addEventListener("submit", function(e) {
        e.preventDefault();  // Prevent default form submission
        const formData = new FormData(this);
        
        // Add the action parameter to indicate we want to add a service
        formData.append('action', 'add');
        
        console.log("Form submission started");
        
        // Log the form data to console (for debugging)
        for (let [key, value] of formData.entries()) {
            if (key === 'serviceImage') {
                console.log(key, value.name, value.size, value.type);
            } else {
                console.log(key, value);
            }
        }
        
        // Update to use the unified clinic-services.php endpoint
        fetch('../backends/clinic-services.php', { 
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log("Response received:", response);
            return response.text().then(text => {
                // Try to parse as JSON, but handle HTML responses too
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse response as JSON:", text.substring(0, 100) + "...");
                    throw new Error("Server returned invalid JSON. Check server logs.");
                }
            });
        })
        .then(data => {
            console.log("Data received:", data);
            if (data.status === "success") {
                showToast(data.message);
                // Close the modal using jQuery and Bootstrap's modal plugin:
                $('#addServiceModal').modal('hide');
                // Reset the form
                this.reset();
                // Reset the image preview
                const imagePreview = document.getElementById('serviceImagePreview');
                if (imagePreview) {
                    imagePreview.src = '../assets/images/service.png';
                }
                // Reload the services list to show the newly added service
                if (typeof loadServicesCallback === 'function') {
                    loadServicesCallback(1);
                }
            } else {
                showToast("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showToast("Error: " + error);
        });
    });
}

// Function to initialize image preview
function initImagePreview() {
    // Get the file input element and image preview element
    const fileInput = document.getElementById('serviceImage');
    const imagePreview = document.getElementById('serviceImagePreview');
    
    if (!fileInput || !imagePreview) {
        console.error("File input or image preview element not found");
        return;
    }
    
    console.log("Setting up image preview");
    
    // Listen for changes on the file input
    fileInput.addEventListener('change', function (event) {
        console.log("File selected:", this.files);
        const file = this.files[0]; // Get the selected file
        if (file) {
            console.log("Processing file:", file.name, file.size, file.type);
            const reader = new FileReader();
            // When file reading is complete, update the image preview's source
            reader.onload = function (e) {
                console.log("File loaded:", e.target.result.substring(0, 50) + "...");
                imagePreview.src = e.target.result;
            };
            // Read the selected file as a data URL (base64)
            reader.readAsDataURL(file);
        }
    });
    
    // Also attach click handler to the upload button
    const uploadButton = document.querySelector('button[onclick="document.getElementById(\'serviceImage\').click()"]');
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            console.log("Upload button clicked");
        });
    }
}