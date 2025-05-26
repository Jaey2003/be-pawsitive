document.addEventListener('DOMContentLoaded', function() {
    const adminForm = document.getElementById('adminForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password-admin');
    
    // Handle password toggle visibility
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = togglePassword.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Handle form submission
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username-admin').value.trim();
            const password = document.getElementById('password-admin').value.trim();
            
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            // Create a FormData object
            const formData = new FormData();
            formData.append('username-admin', username);
            formData.append('password-admin', password);
            
            // Show loading state on button
            const submitBtn = adminForm.querySelector('.submit');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>LOGGING IN...';
            submitBtn.disabled = true;
            
            // Send login request
            fetch('../backends/admin-account_login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to the URL provided in the response
                    window.location.href = data.redirect;
                } else {
                    alert(data.message || 'Login failed. Please check your credentials.');
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }
}); 