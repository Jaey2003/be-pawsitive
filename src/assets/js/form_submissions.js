document.addEventListener('DOMContentLoaded', function () {
    var modalContainer = document.getElementById('modalContainer');

    // Function to load the response modal HTML
    function loadResponseModalHtml() {
        return fetch('../modals/response_modal.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                modalContainer.innerHTML = html;
                return document.getElementById('responseModal');
            });
    }

    

    var updateNameForm = document.getElementById('updateNameForm');
    if (updateNameForm) {
        loadResponseModalHtml()
            .then(responseModalElement => {
                responseModalElement.addEventListener('hidden.bs.modal', function () {
                    if (this.dataset.success === 'true') {
                        // Optionally refresh or redirect on success, e.g., location.reload();
                    }
                });
                updateNameForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var url = '../backends/account_update_name.php';
                    var formData = new FormData(updateNameForm);
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                var modalMessage = document.getElementById('modalMessage');
                                var responseText = xhr.responseText.trim();
                                try {
                                    var data = JSON.parse(responseText);
                                    if (data.status === 'success') {
                                        modalMessage.textContent = data.message;
                                        responseModalElement.dataset.success = 'true';
                                    } else {
                                        modalMessage.textContent = "Error: " + data.message;
                                        responseModalElement.dataset.success = 'false';
                                    }
                                } catch (err) {
                                    console.error('Error parsing JSON:', err);
                                    modalMessage.textContent = "Error: " + responseText;
                                    responseModalElement.dataset.success = 'false';
                                }
                                var responseModal = new bootstrap.Modal(responseModalElement);
                                responseModal.show();
                            } else {
                                console.error('An error occurred: ' + xhr.statusText);
                            }
                        }
                    };
                    xhr.send(formData);
                });
            })
            .catch(error => console.error('Error loading response modal:', error));
    }


    

    var employeeRegistrationForm = document.getElementById('employeeRegistrationForm');
    if (employeeRegistrationForm) {
        loadResponseModalHtml()
            .then(responseModalElement => {
                // When the modal is hidden, redirect if registration was successful.
                responseModalElement.addEventListener('hidden.bs.modal', function () {
                    if (this.dataset.success === 'true') {
                        window.location.href = responseModalElement.dataset.redirectUrl || "employee.php";
                    }
                });

                employeeRegistrationForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var url = '../backends/employee_insert_database.php';
                    var formData = new FormData(employeeRegistrationForm);

                    // (Optional) Log the form data for debugging
                    var formDataObj = {};
                    formData.forEach(function (value, key) {
                        formDataObj[key] = value;
                    });
                    console.table(formDataObj);

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                var modalMessage = document.getElementById('modalMessage');
                                var responseText = xhr.responseText.trim();
                                try {
                                    var data = JSON.parse(responseText);
                                    if (data.success) {
                                        modalMessage.textContent = data.message;
                                        responseModalElement.dataset.success = 'true';
                                        responseModalElement.dataset.redirectUrl = data.redirect || '';
                                    } else {
                                        modalMessage.textContent = "Error: " + data.message;
                                        responseModalElement.dataset.success = 'false';
                                        responseModalElement.dataset.redirectUrl = '';
                                    }
                                } catch (err) {
                                    console.error('Error parsing JSON:', err);
                                    modalMessage.textContent = "Error: " + responseText;
                                    responseModalElement.dataset.success = 'false';
                                    responseModalElement.dataset.redirectUrl = '';
                                }
                                var responseModal = new bootstrap.Modal(responseModalElement);
                                responseModal.show();
                            } else {
                                console.error('An error occurred: ' + xhr.statusText);
                            }
                        }
                    };
                    xhr.send(formData);
                });
            })
            .catch(error => console.error('Error loading response modal:', error));
    }

});
