$(document).ready(function() {
    $.ajax({
        url: '../backends/clinic_id_set.php',  // Path to your PHP script
        method: 'GET',                         // Or "POST", based on your requirements
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                // Get the clinic_id from the response
                var clinicId = response.user.clinic_id;
                
                // Create a URL object from the current location
                var currentUrl = new URL(window.location.href);
                
                // If clinic_id is present, set/update it in the URL; otherwise, remove it
                if (clinicId) {
                    currentUrl.searchParams.set('clinic_id', clinicId);
                } else {
                    currentUrl.searchParams.delete('clinic_id');
                }
                
                // Update the browser's URL without reloading the page
                window.history.replaceState(null, '', currentUrl);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // Error handling without console.error
        }
    });
});
