CREATE TABLE admin_account (
    admin_id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE admin_username (
    admin_username_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    admin_username VARCHAR(255) NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admin_account(admin_id) ON DELETE CASCADE
);

CREATE TABLE admin_password (
    admin_password_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admin_account(admin_id) ON DELETE CASCADE
);

CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_role (
    account_role_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

CREATE TABLE accounts (
  account_id   INT AUTO_INCREMENT PRIMARY KEY,       -- unique ID
  parent_id    INT           NULL,                   -- the "parent" account's ID
  created_at   DATETIME      NOT NULL 
                DEFAULT CURRENT_TIMESTAMP,           -- when it was created
  updated_at   DATETIME      NOT NULL 
                DEFAULT CURRENT_TIMESTAMP 
                ON UPDATE CURRENT_TIMESTAMP,         -- when it was last modified
  INDEX idx_parent (parent_id),                       -- speeds up child lookups
  FOREIGN KEY (parent_id)
    REFERENCES accounts(account_id)
    ON DELETE CASCADE                                -- deletes sub-accounts if parent is removed
);

CREATE TABLE account_usernames (
    username_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,                -- References account_id (Account)
    username VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE account_passwords (
    password_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,                -- References account_id (Account)
    password_hash VARCHAR(255) NOT NULL,
    password_set_at DATETIME NOT NULL,
    password_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE account_picture (
    pic_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,               -- References account_id (Account)
    pic_url VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE account_names (
    profile_name_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    name_extension VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE account_pets (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,  -- Ensuring that owner_id cannot be NULL
    pet_picture VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES accounts(account_id)
);

CREATE TABLE account_emails (
    email_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,                 -- References account_id (Account)
    email_address VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE clinic_emails (
    email_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,         -- References clinic_id (Clinic)
    email_address VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE account_contact_numbers (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT DEFAULT NULL,    -- References account_id (nullable)
    number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE clinic_contact_numbers (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,         -- References clinic_id (Clinic)
    number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE account_address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,               -- References the individual account
    lot_number VARCHAR(50),
    street_number VARCHAR(50) NOT NULL,
    street_name VARCHAR(100) NOT NULL,
    sitio VARCHAR(100),
    barangay VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7), 
    longitude DECIMAL(10, 7), 
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE clinic_address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,                -- References clinic_id (Clinic)
    lot_number VARCHAR(50),
    street_number VARCHAR(50) NOT NULL,
    street_name VARCHAR(100) NOT NULL,
    sitio VARCHAR(100),
    barangay VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE account_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,              -- References account_id (Account)
    document_type VARCHAR(100) NOT NULL, 
    document_data VARCHAR(255) NOT NULL,    
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE clinic_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,                 -- References clinic_id (Clinic)
    document_type VARCHAR(100) NOT NULL, 
    document_data VARCHAR(255) NOT NULL,    
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

-- Main table for clinic registration applications
CREATE TABLE application (
    application_id INT AUTO_INCREMENT,
    applicant_account_id INT,       -- References account_id (applicant's account) - nullable
    applicant_clinic_id INT,        -- References clinic_id (applicant's clinic) - nullable
    petitioner_account_id INT,      -- References account_id (petitioner's account) - nullable
    petitioner_clinic_id INT,       -- References clinic_id (petitioner's clinic) - nullable
    role_id INT NOT NULL,           -- References role_id (Role)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (application_id),
    FOREIGN KEY (applicant_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (petitioner_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (petitioner_clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

CREATE TABLE status_type (
    status_type_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE, 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_status (
    applicant_status_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,      -- Foreign Key to application
    status_type_id INT NOT NULL,      -- Foreign Key to status_type
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE CASCADE,
    FOREIGN KEY (status_type_id) REFERENCES status_type(status_type_id) ON DELETE CASCADE
);

-- Application documents table
CREATE TABLE application_document (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL, 
    document_data VARCHAR(255) NOT NULL,    
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    migrated BOOLEAN DEFAULT FALSE,
    migrated_at DATETIME DEFAULT NULL,
    FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE CASCADE
);

-- Create trigger to migrate documents when application status changes to approved
DELIMITER //
CREATE TRIGGER application_document_migration
AFTER UPDATE ON application_status
FOR EACH ROW
BEGIN
    DECLARE v_status_name VARCHAR(50);
    DECLARE v_applicant_account_id INT;
    DECLARE v_applicant_clinic_id INT;
    
    -- Get the status name
    SELECT status_name INTO v_status_name 
    FROM status_type 
    WHERE status_type_id = NEW.status_type_id;
    
    -- Only proceed if status is 'Approved' or equivalent
    IF v_status_name = 'Approved' THEN
        -- Get applicant details
        SELECT applicant_account_id, applicant_clinic_id 
        INTO v_applicant_account_id, v_applicant_clinic_id
        FROM application
        WHERE application_id = NEW.application_id;
        
        -- Migrate documents to account_documents if applicant is an individual
        IF v_applicant_account_id IS NOT NULL THEN
            INSERT INTO account_documents (account_id, document_type, document_data, uploaded_at)
            SELECT v_applicant_account_id, document_type, document_data, uploaded_at
            FROM application_document
            WHERE application_id = NEW.application_id
            AND migrated = FALSE;
        END IF;
        
        -- Migrate documents to clinic_documents if applicant is a clinic
        IF v_applicant_clinic_id IS NOT NULL THEN
            INSERT INTO clinic_documents (clinic_id, document_type, document_data, uploaded_at)
            SELECT v_applicant_clinic_id, document_type, document_data, uploaded_at
            FROM application_document
            WHERE application_id = NEW.application_id
            AND migrated = FALSE;
        END IF;
        
        -- Mark documents as migrated
        UPDATE application_document
        SET migrated = TRUE, migrated_at = NOW()
        WHERE application_id = NEW.application_id
        AND migrated = FALSE;
    END IF;
END //
DELIMITER ;

CREATE TABLE clinic (
    clinic_id        INT AUTO_INCREMENT PRIMARY KEY,
    owner_id         INT NOT NULL,  -- references accounts(account_id)
    parent_clinic_id INT         ,  -- NULL for a "main" clinic, or points to a parent
    name             VARCHAR(255) NOT NULL,
    address          VARCHAR(500) ,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)          REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_clinic_id)  REFERENCES clinic(clinic_id)   ON DELETE SET NULL
);

CREATE TABLE clinic_information (
    clinic_details_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL UNIQUE,
    clinic_name VARCHAR(255) NOT NULL UNIQUE,
    business_type VARCHAR(100) NOT NULL,
    facility_type VARCHAR(100) NOT NULL,
    clinic_logo VARCHAR(255) NOT NULL,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE clinic_employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    role_id INT NOT NULL,
    account_id INT NOT NULL,
    hiredate DATE NOT NULL,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE TABLE clinic_services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT,
    service_image VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    status VARCHAR(10),
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE clinic_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE clinic_post_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES clinic_posts(post_id) ON DELETE CASCADE
);

CREATE TABLE clinic_feedbacks (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    clinic_id INT NOT NULL,
    commenter_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES clinic_posts(post_id),
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id),
    FOREIGN KEY (commenter_id) REFERENCES accounts(account_id)
);

CREATE TABLE clinic_initial_clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    clinic_id INT NOT NULL,
    status ENUM('Form Started', 'Awaiting Review', 'Verified', 'Rejected', 'Migrated') DEFAULT 'Form Started',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verification_date DATETIME DEFAULT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE clinic_initial_client_pets (
    client_pet_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    pet_id INT NOT NULL, -- Reference to pet in account_pets
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clinic_initial_clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES account_pets(pet_id) ON DELETE CASCADE
);

CREATE TABLE clinic_initial_client_pet_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    client_pet_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_file VARCHAR(255) NOT NULL, -- stores file path or filename
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_pet_id) REFERENCES clinic_initial_client_pets(client_pet_id) ON DELETE CASCADE
);

CREATE TABLE clinic_initial_client_appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    client_pet_id INT NOT NULL,
    clinic_id INT NOT NULL,
    initial_appointment_date DATE NOT NULL,
    initial_appointment_time TIME NOT NULL,
    service_id INT NOT NULL, -- Changed from 'purpose' and made reference to services
    status VARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clinic_initial_clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (client_pet_id) REFERENCES clinic_initial_client_pets(client_pet_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES clinic_services(service_id) ON DELETE CASCADE
);

CREATE TABLE clinic_suggested_initial_client_appointment (
    suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,                       
    suggested_by INT NOT NULL,                
    appointment_date DATE NOT NULL,         -- New column for date
    appointment_time TIME NOT NULL,         -- New column for time
    clinic_feedback VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Suggested',
    client_status VARCHAR(50) DEFAULT 'Pending',  -- New field for client status
    client_feedback TEXT,                         -- New field for client feedback
    confirmed_at DATETIME DEFAULT NULL,          -- New field to track when clinic confirms this suggestion
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id)
        REFERENCES clinic_initial_client_appointment(appointment_id)
        ON DELETE CASCADE,
    FOREIGN KEY (suggested_by)
        REFERENCES clinic(clinic_id)
        ON DELETE CASCADE
);

-- Add new procedure to handle suggestion confirmation
DELIMITER //
CREATE PROCEDURE confirm_accepted_suggestion(IN p_suggestion_id INT)
BEGIN
    DECLARE v_appointment_id INT;
    DECLARE v_client_id INT;
    DECLARE v_client_pet_id INT;
    DECLARE v_pet_id INT;
    DECLARE v_appointment_date DATE;
    DECLARE v_appointment_time TIME;
    DECLARE v_service_id INT;
    DECLARE v_clinic_id INT;
    
    -- Start transaction for data consistency
    START TRANSACTION;
    
    -- Get data from suggestion
    SELECT csica.appointment_id, csica.appointment_date, csica.appointment_time, 
           cica.client_id, cica.client_pet_id, cica.service_id, cica.clinic_id
    INTO v_appointment_id, v_appointment_date, v_appointment_time,
         v_client_id, v_client_pet_id, v_service_id, v_clinic_id
    FROM clinic_suggested_initial_client_appointment csica
    JOIN clinic_initial_client_appointment cica ON csica.appointment_id = cica.appointment_id
    WHERE csica.suggestion_id = p_suggestion_id
    AND csica.client_status = 'Accepted';
    
    -- Verify we found a valid suggestion
    IF v_appointment_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid or non-accepted suggestion';
        ROLLBACK;
    END IF;
    
    -- Get pet_id from client_pet_id
    SELECT pet_id INTO v_pet_id
    FROM clinic_initial_client_pets
    WHERE client_pet_id = v_client_pet_id;
    
    -- Update the suggestion as confirmed - Set status only, don't update confirmed_at field here
    -- to avoid triggering the recursion through the trigger
    UPDATE clinic_suggested_initial_client_appointment 
    SET status = 'Confirmed'
    WHERE suggestion_id = p_suggestion_id;
    
    -- Mark other suggestions for this appointment as 'Not Selected'
    UPDATE clinic_suggested_initial_client_appointment
    SET status = 'Not Selected'
    WHERE appointment_id = v_appointment_id
    AND suggestion_id != p_suggestion_id;
    
    -- Update the initial appointment with the new date/time and status
    UPDATE clinic_initial_client_appointment
    SET initial_appointment_date = v_appointment_date,
        initial_appointment_time = v_appointment_time,
        status = 'Confirmed'
    WHERE appointment_id = v_appointment_id;
    
    -- Migrate the client to permanent client
    CALL migrate_initial_to_permanent_client(v_client_id, v_pet_id);
    
    -- Commit the transaction
    COMMIT;
END //
DELIMITER ;

-- Trigger to handle appointment approval and migration
DELIMITER //
CREATE TRIGGER after_initial_appointment_approval
AFTER UPDATE ON clinic_initial_client_appointment
FOR EACH ROW
BEGIN
    DECLARE v_pet_id INT;
    
    IF NEW.status = 'Verified' AND OLD.status != 'Verified' THEN
        -- Get the pet_id from clinic_initial_client_pets
        SELECT pet_id INTO v_pet_id
        FROM clinic_initial_client_pets
        WHERE client_pet_id = NEW.client_pet_id;
        
        -- Call the migration procedure with the correct pet_id
        CALL migrate_initial_to_permanent_client(NEW.client_id, v_pet_id);
    END IF;
END //
DELIMITER ;

-- Procedure to handle initial client migration
DELIMITER //
CREATE PROCEDURE migrate_initial_to_permanent_client(IN p_initial_client_id INT, IN p_specific_pet_id INT)
BEGIN
    DECLARE v_account_id INT;
    DECLARE v_clinic_id INT;
    DECLARE v_new_client_id INT;
    DECLARE v_new_client_pet_id INT;
    DECLARE v_old_client_pet_id INT;
    DECLARE v_pet_id INT;
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_appointment_id INT;
    DECLARE v_client_pet_id INT;
    DECLARE v_appointment_date DATE;
    DECLARE v_appointment_time TIME;
    DECLARE v_purpose VARCHAR(255);
    DECLARE v_status VARCHAR(50);
    
    -- Cursor for specific pet
    DECLARE cur_pets CURSOR FOR 
        SELECT client_pet_id, pet_id 
        FROM clinic_initial_client_pets 
        WHERE client_id = p_initial_client_id 
        AND pet_id = p_specific_pet_id;
    
    -- Cursor for appointments
    DECLARE cur_appointments CURSOR FOR
        SELECT appointment_id, client_pet_id, initial_appointment_date, initial_appointment_time, service_id, status
        FROM clinic_initial_client_appointment
        WHERE client_id = p_initial_client_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    -- Get account and clinic IDs from initial client
    SELECT account_id, clinic_id INTO v_account_id, v_clinic_id 
    FROM clinic_initial_clients 
    WHERE client_id = p_initial_client_id;
    
    -- 1. Insert into permanent clients
    INSERT INTO clinic_clients (account_id, clinic_id, status, created_at) 
    SELECT account_id, clinic_id, 'Active', NOW() 
    FROM clinic_initial_clients 
    WHERE client_id = p_initial_client_id;
    
    -- Get the new client ID
    SET v_new_client_id = LAST_INSERT_ID();
    
    -- 2. Migrate specific pet and its documents
    OPEN cur_pets;
    
    pets_loop: LOOP
        FETCH cur_pets INTO v_old_client_pet_id, v_pet_id;
        IF v_done THEN
            LEAVE pets_loop;
        END IF;
        
        -- Insert pet to permanent client pets
        INSERT INTO clinic_client_pets (client_id, pet_id)
        VALUES (v_new_client_id, v_pet_id);
        
        -- Get the new client_pet_id
        SET v_new_client_pet_id = LAST_INSERT_ID();
        
        -- Check if there are any documents to migrate
        IF EXISTS (
            SELECT 1 
            FROM clinic_initial_client_pet_documents 
            WHERE client_pet_id = v_old_client_pet_id
        ) THEN
            -- Migrate pet documents
            INSERT INTO clinic_client_pet_documents 
                (client_pet_id, document_type, document_file, uploaded_at)
            SELECT 
                v_new_client_pet_id, document_type, document_file, uploaded_at
            FROM 
                clinic_initial_client_pet_documents
            WHERE 
                client_pet_id = v_old_client_pet_id;
        END IF;
    END LOOP;
    
    CLOSE cur_pets;
    SET v_done = FALSE;
    
    -- 3. Migrate appointments to the clinic_client_appointment table
    OPEN cur_appointments;
    
    appointments_loop: LOOP
        FETCH cur_appointments INTO v_appointment_id, v_client_pet_id, v_appointment_date, 
                                    v_appointment_time, v_purpose, v_status;
        
        IF v_done THEN
            LEAVE appointments_loop;
        END IF;
        
        -- Find the corresponding new client_pet_id
        SELECT cp.client_pet_id 
        INTO v_new_client_pet_id
        FROM clinic_client_pets cp
        JOIN clinic_initial_client_pets icp ON cp.pet_id = icp.pet_id
        WHERE icp.client_pet_id = v_client_pet_id 
        AND cp.client_id = v_new_client_id;
        
        -- Migrate the appointment
        INSERT INTO clinic_client_appointment 
            (client_id, client_pet_id, clinic_id, appointment_date, appointment_time, service_id, status)
        VALUES 
            (v_new_client_id, v_new_client_pet_id, v_clinic_id, 
             v_appointment_date, v_appointment_time, v_purpose, v_status);
    END LOOP;
    
    CLOSE cur_appointments;
    
    -- Update initial client status
    UPDATE clinic_initial_clients 
    SET status = 'Migrated', updated_at = NOW(), verification_date = NOW()
    WHERE client_id = p_initial_client_id;
END //
DELIMITER ;

CREATE TABLE clinic_clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    clinic_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Not added',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

CREATE TABLE clinic_client_pets (
    client_pet_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    pet_id INT NOT NULL, -- Reference to pet in account_pets
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clinic_clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES account_pets(pet_id) ON DELETE CASCADE
);

CREATE TABLE clinic_client_pet_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    client_pet_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_file VARCHAR(255) NOT NULL, -- stores file path or filename
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_pet_id) REFERENCES clinic_client_pets(client_pet_id) ON DELETE CASCADE
);

CREATE TABLE clinic_client_appointment ( 
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    client_pet_id INT NOT NULL,
    clinic_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,         -- Separated date
    appointment_time TIME NOT NULL,         -- Separated time
    status VARCHAR(50) DEFAULT 'Pending',
    room_status VARCHAR(50) DEFAULT 'Not Created',
    attendance_status ENUM('Not Recorded', 'Present', 'Absent', 'Late') DEFAULT 'Not Recorded',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clinic_clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (client_pet_id) REFERENCES clinic_client_pets(client_pet_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES clinic_services(service_id) ON DELETE CASCADE
);

-- Table for tracking appointment cancellations
CREATE TABLE appointment_cancellations (
    cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    cancelled_by_account_id INT,                     -- Who initiated the cancellation (NULL if system)
    cancelled_by_clinic_id INT,                      -- If cancelled by clinic staff
    cancellation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason_type ENUM('Patient Request', 'Clinic Request', 'Emergency', 'No Show', 'Reschedule', 'Other') NOT NULL,
    reason_note TEXT,                                -- Detailed explanation          -- Whether the fee was applied
    notification_sent BOOLEAN DEFAULT FALSE,         -- Track if notification was sent
    rescheduled_to_appointment_id INT,              -- Link to new appointment if rescheduled
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES clinic_client_appointment(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (cancelled_by_account_id) REFERENCES accounts(account_id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by_clinic_id) REFERENCES clinic(clinic_id) ON DELETE SET NULL,
    FOREIGN KEY (rescheduled_to_appointment_id) REFERENCES clinic_client_appointment(appointment_id) ON DELETE SET NULL
);

-- Trigger to update appointment status when cancellation is recorded
DELIMITER //
CREATE TRIGGER after_appointment_cancellation_insert
AFTER INSERT ON appointment_cancellations
FOR EACH ROW
BEGIN
    -- Update the appointment status to 'Cancelled'
    UPDATE clinic_client_appointment
    SET status = 'Cancelled', updated_at = NOW()
    WHERE appointment_id = NEW.appointment_id;
    
    -- If this was a reschedule, update the status of the new appointment
    IF NEW.rescheduled_to_appointment_id IS NOT NULL THEN
        UPDATE clinic_client_appointment
        SET status = 'Rescheduled', updated_at = NOW()
        WHERE appointment_id = NEW.rescheduled_to_appointment_id;
    END IF;
END //
DELIMITER ;

-- Trigger to update room_status in clinic_client_appointment when a room is added
DELIMITER //
CREATE TRIGGER after_appointment_room_insert
AFTER INSERT ON appointment_rooms
FOR EACH ROW
BEGIN
    UPDATE clinic_client_appointment
    SET room_status = 'Created', updated_at = NOW()
    WHERE appointment_id = NEW.appointment_id;
END //
DELIMITER ;

-- Trigger to update room_status in clinic_client_appointment when a room status changes
DELIMITER //
CREATE TRIGGER after_appointment_room_update
AFTER UPDATE ON appointment_rooms
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        UPDATE clinic_client_appointment
        SET room_status = NEW.status, updated_at = NOW()
        WHERE appointment_id = NEW.appointment_id;
    END IF;
END //
DELIMITER ;

CREATE TABLE appointment_rooms (
    room_id VARCHAR(50) PRIMARY KEY,
    appointment_id INT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    last_updated DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (appointment_id) REFERENCES clinic_client_appointment(appointment_id) ON DELETE CASCADE
);

-- Table for storing completed SOAP notes
CREATE TABLE soap_notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES appointment_rooms(room_id) ON DELETE CASCADE
);

-- Table for storing clinic unavailable times
CREATE TABLE clinic_unavailable_times (
    unavailable_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

-- Table for storing recurrence patterns for unavailable times
CREATE TABLE clinic_unavailable_time_recurrence (
    recurrence_id INT AUTO_INCREMENT PRIMARY KEY,
    unavailable_id INT NOT NULL,
    pattern ENUM('weekly', 'monthly', 'yearly') NOT NULL,
    recur_until DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unavailable_id) REFERENCES clinic_unavailable_times(unavailable_id) ON DELETE CASCADE
);







