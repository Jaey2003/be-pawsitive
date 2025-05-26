document.addEventListener("DOMContentLoaded", function () {
  let adminHome = document.getElementById("homeAdminlink");
  let adminApplicants = document.getElementById("applicantslink");

  let signupLink = document.getElementById('signupLink');
  let loginLink = document.getElementById('loginLink');
  let createAccountBtn = document.getElementById("create-account-btn");

  let home = document.getElementById("homelink");
  let createOtherAccount = document.getElementById("create_other_account");
  let registration_back = document.getElementById("registration_back_btn");
  let profile = document.getElementById("account_profile");
  let profile_back = document.getElementById("account_info_update");
  let pets = document.getElementById("petslink");
  let petregistration = document.getElementById("petRegistrationLink");
  let petRegistrationAgain = document.getElementById("registerAnotherClinicLink");
  let backTopet = document.getElementById("backTopet");
  let logo = document.getElementById("logo");
  let appointments = document.getElementById("appointmentslink");

  let managerEmployee = document.getElementById("employeelink");

  let clinicProfile = document.getElementById("clinicProfilelink");
  let clinicFeedback = document.getElementById("feedbackLink");
  let clinicServices = document.getElementById("servicesLink");
  let clinicClients = document.getElementById("clientsLink");
  let clinicAppointments = document.getElementById("appointmentsLink");
  let clinicAppointmentsSOAP = document.getElementById("soapMethodLink");

  if (adminHome) {
    adminHome.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "admin-home.php?admin_id=" + adminId;
    });
  }
  if (adminApplicants) {
    adminApplicants.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "admin-applicants.php?admin_id=" + adminId;
    });
  }

  if (signupLink) {
    signupLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = "/be-pawsitive/pages/account-sign-up.html";
    });
  }
  if (loginLink) {
    loginLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = "/be-pawsitive/pages/account-login.html";
    });
  }
  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "account-sign-up.html";
    });
  }
  if (logo) {
    logo.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "home.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (home) {
    home.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "home.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (createOtherAccount) {
    createOtherAccount.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "registration.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (registration_back) {
    registration_back.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "home.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (profile) {
    profile.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "profile.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (profile_back) {
    profile_back.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "home.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (pets) {
    pets.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "pets.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (petregistration) {
    petregistration.addEventListener("click", function (e) {
      e.preventDefault();

      const redirectUrl = "account_pet-registration.php?account_id=" + accountId + "&role=" + role + "&petID=" + selectedPetId;

      storePetInSession(selectedPetId, 'Not Registered', redirectUrl);
    });
  }
  if (petRegistrationAgain) {
    petRegistrationAgain.addEventListener("click", function (e) {
      e.preventDefault();

      const redirectUrl = "account_pet-registration.php?account_id=" + accountId + "&role=" + role + "&petID=" + selectedPetId;

      storePetInSession(selectedPetId, 'Not Registered', redirectUrl);
    });
  }
  if (backTopet) {
    backTopet.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "pets.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (managerEmployee) {
    managerEmployee.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "employee.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (clinicProfile) {
    clinicProfile.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "clinic.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (clinicFeedback) {
    clinicFeedback.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "feedbacks.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (clinicServices) {
    clinicServices.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "services.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (clinicClients) {
    clinicClients.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "clinic-clients.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (clinicAppointments) {
    clinicAppointments.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "clinic-appointments.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (appointments) {
    appointments.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "account-appointments.php?account_id=" + accountId + "&role=" + role;
    });
  }
  if (clinicAppointmentsSOAP) {
    clinicAppointmentsSOAP.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "clinic-appointments-SOAP.php?account_id=" + accountId + "&role=" + role;
    });
  }
});
