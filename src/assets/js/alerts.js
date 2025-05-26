function showAlert(message, type = 'primary', duration = 3000) {
    const alertBox = document.getElementById('customAlertBox');
    const alertMessage = document.getElementById('customAlertMessage');

    if (!alertBox || !alertMessage) {
        console.error('❌ Alert container elements not found in DOM.');
        return;
    }

    // Set the message
    alertMessage.textContent = message;

    // Update position classes for top-center
    alertBox.className = `toast align-items-center text-white bg-${type} border-0 position-fixed top-0 start-50 translate-middle-x mt-4`;

    // Show the toast
    const toast = new bootstrap.Toast(alertBox, { delay: duration });
    toast.show();
}
