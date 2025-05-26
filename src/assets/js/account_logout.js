$(document).ready(function(){
    $('#sign_out_link').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: '../backends/account_sign-out.php', // Adjust the path if needed.
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if(response.success){
                    // Redirect to login page (or homepage) after successful sign out.
                    window.location.href = '../../be-pawsitive';
                } else {
                    alert('Sign out failed.');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error signing out: " + textStatus + " " + errorThrown);
            }
        });
    });
});