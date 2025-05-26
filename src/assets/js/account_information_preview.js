$(document).ready(function(){
    // AJAX request to retrieve data from the PHP script
    $.ajax({
        url: '../backends/account_name_fetch.php', // Adjust the path as needed
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            // Populate input fields if data is returned
            if(response) {
                $('#firstName').val(response.first_name ? response.first_name : "Not Provided");
                $('#middleName').val(response.middle_name ? response.middle_name : "Not Provided");
                $('#lastName').val(response.last_name ? response.last_name : "Not Provided");
                $('#nameExtension').val(response.name_extension ? response.name_extension : "Not Provided");
            } else {
                console.log("No data found.");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error: " + textStatus + " " + errorThrown);
        }
    });
});
