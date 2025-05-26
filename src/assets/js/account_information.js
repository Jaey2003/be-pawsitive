$(document).ready(function(){
  // Utility functions for account information handling
  const AccountUtils = {
    /**
     * Updates UI elements with account information
     * @param {Object} data - The account data from the server
     */
    updateAccountUI: function(data) {
      const fullName = data.full_name || 'No account found';
      const role = data.role || 'No role found';
      const picUrl = data.pic_url || 'default.png';
      
      $('.account_name_welcome').text('Welcome, ' + fullName);
      $('.account_name_plain').text(fullName);
      $('.account_role').text(role);
      $('.account_pic').attr('src', picUrl);
    },
    
    /**
     * Updates UI with error fallback values
     */
    handleError: function() {
      $('.account_name_welcome').text('Welcome, No account found');
      $('.account_name_plain').text('No account found');
      $('.account_role').text('No role found');
      $('.account_pic').attr('src', 'default.png');
    }
  };
  
  // API-related functions
  const AccountAPI = {
    /**
     * Fetches account information from the server
     * @return {Promise} jQuery AJAX promise
     */
    fetchAccountInfo: function() {
      return $.ajax({
        url: '../backends/account_information.php',
        method: 'GET',
        dataType: 'json'
      });
    }
  };
  
  // Initialize the application
  function init() {
    AccountAPI.fetchAccountInfo()
      .done(function(response) {
        AccountUtils.updateAccountUI(response);
      })
      .fail(function(xhr, status, error) {
        console.error("Error fetching account info:", error);
        AccountUtils.handleError();
      });
  }
  
  // Start the application
  init();
});
