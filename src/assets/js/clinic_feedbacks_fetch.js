// When the document is ready, fetch and display the feedbacks
$(document).ready(function() {
    $.ajax({
        url: '../backends/clinic_feedbacks_fetch.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            // Check if there was an error message in the response
            if (data.status && data.status === 'error') {
                $('#feedbackTable tbody').html('<tr><td colspan="7">' + data.message + '</td></tr>');
                return;
            }
            
            // Check if there are no feedbacks
            if (data.length === 0) {
                $('#noFeedbackMessage').show();
                $('#feedbackTable').hide();
                return;
            }
            
            // If we have feedbacks, hide the no feedback message and show the table
            $('#noFeedbackMessage').hide();
            $('#feedbackTable').show();
            
            // Build HTML for table rows
            var rows = '';
            $.each(data, function(index, feedback) {
                rows += '<tr>';
                rows += '<td>' + feedback.feedback_id + '</td>';
                rows += '<td>' + feedback.post_id + '</td>';
                rows += '<td>' + feedback.clinic_id + '</td>';
                rows += '<td>' + feedback.commenter_id + '</td>';
                rows += '<td>' + feedback.comment + '</td>';
                rows += '<td>' + feedback.created_at + '</td>';
                rows += '<td>' + feedback.updated_at + '</td>';
                rows += '</tr>';
            });
            // Insert the rows into the table body
            $('#feedbackTable tbody').html(rows);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching feedbacks: " + error);
            $('#feedbackTable tbody').html('<tr><td colspan="7">Error loading feedbacks.</td></tr>');
        }
    });
});