$(document).ready(function () {
    // Utility functions
    const AccountUtils = {
        // Get appropriate status badge based on account status
        getStatusBadge: function(status) {
            const badges = {
                'Pending': '<span class="badge bg-warning text-dark rounded-pill px-2 ms-2">Pending</span>',
                'Rejected': '<span class="badge bg-danger rounded-pill px-2 ms-2">Rejected</span>',
                'Approved': '<span class="badge bg-success rounded-pill px-2 ms-2">Approved</span>'
            };
            return badges[status] || '';
        },
        
        // Get button styling based on account status
        getButtonStyle: function(status) {
            return ['Pending', 'Rejected'].includes(status) ? 'btn-secondary' : 'btn-primary';
        },
        
        // Check if account status should disable button
        isButtonDisabled: function(status) {
            return ['Pending', 'Rejected'].includes(status);
        },
        
        // Get profile image with proper fallback
        getProfileImageSrc: function(profilePicEncoded) {
            return profilePicEncoded 
                ? 'data:image/jpeg;base64,' + profilePicEncoded 
                : '../../../assets/default-profile.png';
        },
        
        // Show loading state on button
        setButtonLoading: function($button, isLoading) {
            if (isLoading) {
                const originalHTML = $button.html();
                $button.data('original-html', originalHTML);
                $button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Switching...');
                $button.attr('disabled', true);
            } else {
                $button.html($button.data('original-html'));
                $button.attr('disabled', false);
            }
        },
        
        // Display error notification
        showError: function(message) {
            alert(message || 'An error occurred. Please try again.');
        }
    };
    
    // UI components
    const UIComponents = {
        // Generate account item HTML
        renderAccountItem: function(account) {
            const imgSrc = AccountUtils.getProfileImageSrc(account.profile_pic_encoded);
            const statusBadge = AccountUtils.getStatusBadge(account.status);
            const btnClass = AccountUtils.getButtonStyle(account.status);
            const isDisabled = AccountUtils.isButtonDisabled(account.status);
            
            return `
                <div class="list-group-item border-0 mb-2 rounded p-3 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="position-relative">
                            <img src="${imgSrc}" alt="${account.petitioner_full_name}" class="rounded-circle bg-white border shadow-sm" 
                                 style="width: 42px; height: 42px; object-fit: cover;">
                        </div>
                        <div class="ms-3">
                            <div class="d-flex align-items-center">
                                <span class="fw-medium">${account.petitioner_full_name}</span>
                                ${statusBadge}
                            </div>
                            <small class="text-muted">Manager</small>
                        </div>
                    </div>
                    <button id="switchAccountButton" class="btn ${btnClass} rounded-pill" 
                            ${isDisabled ? 'disabled' : ''} data-id="${account.id}">
                        <i class="bi bi-arrow-repeat me-1"></i>
                        Switch
                    </button>
                </div>
            `;
        },
        
        // Generate empty state HTML
        renderEmptyState: function() {
            return `
                <div class="text-center p-4 bg-light rounded">
                    <i class="bi bi-exclamation-circle text-muted" style="font-size: 24px;"></i>
                    <p class="text-muted mt-2 mb-0">No other accounts found.</p>
                </div>
            `;
        },
        
        // Generate error state HTML
        renderErrorState: function() {
            return `
                <div class="text-center p-4 bg-light rounded">
                    <i class="bi bi-exclamation-triangle text-danger" style="font-size: 24px;"></i>
                    <p class="text-danger mt-2 mb-0">Error fetching account details.</p>
                </div>
            `;
        },
        
        // Generate loading state HTML
        renderLoadingState: function() {
            return `
                <div class="text-center p-4 text-muted">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 mb-0">Loading accounts...</p>
                </div>
            `;
        }
    };
    
    // API related functions
    const AccountAPI = {
        // Fetch account details from server
        fetchManagerDetails: function() {
            $('#manager-details-container').html(UIComponents.renderLoadingState());
            
            return $.ajax({
                url: '../backends/other_account-modal.php',
                type: 'GET',
                dataType: 'json',
                success: function(record) {
                    let htmlContent;
                    
                    if (record === null) {
                        htmlContent = `
                            <div class="text-center p-4 bg-light rounded">
                                <i class="bi bi-person-slash text-warning" style="font-size: 24px;"></i>
                                <p class="text-muted mt-2 mb-0">No other accounts available.</p>
                                <small class="text-muted">You can add a new account using the button below.</small>
                            </div>
                        `;
                    } else {
                        htmlContent = UIComponents.renderAccountItem(record);
                    }
                    
                    $('#manager-details-container').html(htmlContent);
                },
                error: function() {
                    $('#manager-details-container').html(UIComponents.renderErrorState());
                }
            });
        },
        
        // Switch to selected account
        switchAccountManagerById: function(managerId) {
            const $button = $(`button[data-id="${managerId}"]`);
            AccountUtils.setButtonLoading($button, true);
            
            return $.ajax({
                url: '../backends/other_account-modal.php',
                type: 'POST',
                data: { id: managerId },
                dataType: 'json',
                success: function(response) {
                    console.log("Switch successful:", response);
                    
                    if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    } else {
                        AccountUtils.setButtonLoading($button, false);
                        AccountAPI.fetchManagerDetails();
                    }
                },
                error: function() {
                    console.error("Error switching account");
                    AccountUtils.setButtonLoading($button, false);
                    AccountUtils.showError('Failed to switch account. Please try again.');
                }
            });
        }
    };
    
    // Event handlers
    const EventHandlers = {
        // Handle account switch button click
        handleSwitchAccountClick: function(e) {
            e.preventDefault();
            const managerId = $(this).data('id');
            AccountAPI.switchAccountManagerById(managerId);
        },
        
        // Initialize all event listeners
        init: function() {
            $('#manager-details-container').on('click', '#switchAccountButton', this.handleSwitchAccountClick);
        }
    };
    
    // Initialize application
    function init() {
        // Make sure the CSS file is loaded
        if (!document.getElementById('other-accounts-modal-css')) {
            const cssLink = document.createElement('link');
            cssLink.id = 'other-accounts-modal-css';
            cssLink.rel = 'stylesheet';
            cssLink.type = 'text/css';
            cssLink.href = '../assets/css/other-accounts-modal.css';
            document.head.appendChild(cssLink);
        }
        
        EventHandlers.init();
        AccountAPI.fetchManagerDetails();
    }
    
    // Start the application
    init();
});
