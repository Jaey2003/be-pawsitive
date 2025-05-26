$(document).ready(function () {
    // Fetch clinic information on page load
    fetchClinicInformation();
    
    // Fetch clinic posts if the posts container exists
    if ($("#postsContainer").length) {
        fetchClinicPosts();
    }
    
    // Initialize post submission form if it exists
    if ($("#clinicPostForm").length) {
        initializePostForm();
    }
});

/**
 * Fetches basic clinic information (name, logo)
 */
function fetchClinicInformation() {
    $.ajax({
        url: '../backends/clinic-information.php',
        method: 'GET',
        data: { action: 'info' },
        dataType: 'json',
        success: handleInfoSuccess,
        error: handleError
    });
}

/**
 * Fetches clinic posts with optional limit
 * @param {number} limit - Number of posts to fetch (default: 10)
 */
function fetchClinicPosts(limit = 10) {
    $.ajax({
        url: '../backends/clinic-information.php',
        method: 'GET',
        data: { 
            action: 'posts',
            limit: limit 
        },
        dataType: 'json',
        success: handlePostsSuccess,
        error: handleError
    });
}

/**
 * Handles successful clinic info response
 * @param {object} response - Server response
 */
function handleInfoSuccess(response) {
    if (response.error) {
        $(".clinicName").text("Error: " + response.error);
        return;
    }
    
    updateClinicInfo(response);
}

/**
 * Updates the clinic information in the UI
 * @param {object} data - Clinic data
 */
function updateClinicInfo(data) {
    $(".clinicName").html(data.clinic_name);
    
    if (data.clinic_logo) {
        $(".clinicLogo").attr("src", data.clinic_logo).show();
    }
}

/**
 * Handles successful posts response
 * @param {object} response - Server response
 */
function handlePostsSuccess(response) {
    if (response.error) {
        $("#postsContainer").html(`
            <div class="alert alert-danger text-center my-4">
                <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
                <p class="mb-0">Error loading posts: ${response.error}</p>
            </div>
        `);
        return;
    }
    
    if (!response.posts || response.posts.length === 0) {
        $("#postsContainer").html(`
            <div class="no-posts-container text-center py-5 my-3">
                <div class="no-posts-icon mb-3">
                    <i class="fas fa-clipboard-list fa-3x text-muted"></i>
                </div>
                <h4 class="text-muted">No Posts Yet</h4>
                <p class="text-muted mb-4">The clinic hasn't shared any updates yet.</p>
                
                <div class="mt-3">
                    <button id="createFirstPost" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> Create First Post
                    </button>
                </div>
            </div>
        `);
        
        // Add event listener for the create post button if form exists
        $("#createFirstPost").on("click", function() {
            // Scroll to post form if exists, otherwise show a message
            const postForm = $("#clinicPostForm");
            if (postForm.length) {
                $('html, body').animate({
                    scrollTop: postForm.offset().top - 100
                }, 500);
                // Focus on the text area to encourage typing
                $("#postContent").focus();
            } else {
                // If no form exists (perhaps user doesn't have permission)
                $(this).replaceWith(`
                    <div class="alert alert-info mt-3">
                        <i class="fas fa-info-circle"></i>
                        Only authorized staff can create posts for this clinic.
                    </div>
                `);
            }
        });
        
        return;
    }
    
    displayPosts(response.posts);
}

/**
 * Displays posts in the UI
 * @param {array} posts - Array of post objects
 */
function displayPosts(posts) {
    let postsHtml = '<div class="posts-container">';
    
    posts.forEach(post => {
        // Format the date
        const formattedDate = formatDate(post.created_at);
        
        // Start post container
        postsHtml += `
            <div class="post-card" data-post-id="${post.post_id}">
                <div class="post-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="post-date">
                            <i class="fas fa-calendar-alt"></i> ${formattedDate}
                        </div>
                        <!-- Three-dot menu for feedback -->
                        <div class="dropdown">
                            <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item feedback-link" href="#" data-bs-toggle="modal" data-bs-target="#feedbackModal" data-post-id="${post.post_id}" data-clinic-id="${post.clinic_id || (typeof clinicId !== 'undefined' ? clinicId : '')}"><i class="bi bi-chat-quote me-2"></i>Feedback</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
        `;
        
        // Add images if there are any
        if (post.images && post.images.length > 0) {
            if (post.images.length === 1) {
                // Single image display
                postsHtml += `
                    <div class="post-image-container">
                        <img src="${post.images[0]}" alt="Post image" class="post-single-image">
                    </div>
                `;
            } else {
                // Create a grid layout for multiple images
                const gridClass = 
                    post.images.length === 2 ? 'grid-2-images' :
                    post.images.length === 3 ? 'grid-3-images' :
                    post.images.length === 4 ? 'grid-4-images' : 'grid-multi-images';
                
                postsHtml += `<div class="post-image-grid ${gridClass}">`;
                
                // Add each image to the grid
                post.images.forEach((image, index) => {
                    // Limit to first 4 images in grid view, with a "+X more" overlay on the 4th if needed
                    if (index < 4) {
                        let extraClass = '';
                        let extraOverlay = '';
                        
                        // If we have more than 4 images, add an overlay to the 4th image
                        if (index === 3 && post.images.length > 4) {
                            extraClass = 'has-overlay';
                            extraOverlay = `<div class="image-count-overlay">+${post.images.length - 4} more</div>`;
                        }
                        
                        postsHtml += `
                            <div class="grid-image-item ${extraClass}">
                                <img src="${image}" alt="Post image ${index + 1}" class="grid-image">
                                ${extraOverlay}
                            </div>
                        `;
                    }
                });
                
                postsHtml += `</div>`;
            }
        }
        
        // Add post content
        postsHtml += `
            <div class="post-content">
                ${post.content ? `<p>${formatContent(post.content)}</p>` : ''}
            </div>
            
            <div class="post-footer">
                <button class="btn btn-sm btn-like" data-post-id="${post.post_id}">
                    <i class="far fa-heart"></i> Like
                </button>
                <button class="btn btn-sm btn-comment" data-post-id="${post.post_id}">
                    <i class="far fa-comment"></i> Comment
                </button>
                <button class="btn btn-sm btn-share" data-post-id="${post.post_id}">
                    <i class="far fa-share-square"></i> Share
                </button>
            </div>
        </div>
        `;
    });
    
    postsHtml += '</div>';
    
    // Add the posts to the container
    $("#postsContainer").html(postsHtml);
    
    // Add event listeners for the buttons
    initializePostInteractions();
}

/**
 * Formats a date string
 * @param {string} dateString - ISO date string
 * @return {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Formats post content with line breaks and links
 * @param {string} content - Raw post content
 * @return {string} Formatted HTML content
 */
function formatContent(content) {
    if (!content) return '';
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    // Convert line breaks to <br> tags
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

/**
 * Initializes the post submission form
 */
function initializePostForm() {
    $("#clinicPostForm").on("submit", function(e) {
        e.preventDefault();
        
        // Create FormData object for file uploads
        const formData = new FormData(this);
        formData.append('action', 'create_post');
        
        $.ajax({
            url: '../backends/clinic-information.php',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    // Clear form and reload posts
                    $("#clinicPostForm")[0].reset();
                    $("#postContent").val('');
                    $("#postImagePreview").empty().hide();
                    
                    // Refresh the posts
                    fetchClinicPosts();
                    
                    // Show success message
                    showMessage('success', response.message);
                } else {
                    showMessage('error', response.message || 'An error occurred');
                }
            },
            error: handleError
        });
    });
    
    // Handle image preview
    $("#postImages").on("change", function() {
        const previewContainer = $("#postImagePreview");
        previewContainer.empty();
        
        if (this.files && this.files.length > 0) {
            previewContainer.show();
            
            for (let i = 0; i < this.files.length; i++) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewContainer.append(`
                        <div class="preview-image">
                            <img src="${e.target.result}" alt="Preview">
                        </div>
                    `);
                }
                
                reader.readAsDataURL(this.files[i]);
            }
        } else {
            previewContainer.hide();
        }
    });
}

/**
 * Displays a message to the user
 * @param {string} type - Message type (success/error)
 * @param {string} message - Message text
 */
function showMessage(type, message) {
    const messageDiv = $("#statusMessage");
    
    messageDiv.removeClass("success-message error-message")
        .addClass(type + "-message")
        .text(message)
        .fadeIn();
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageDiv.fadeOut();
    }, 3000);
}

/**
 * Handles AJAX errors
 * @param {object} xhr - XHR object
 * @param {string} status - Status text
 * @param {string} error - Error message
 */
function handleError(xhr, status, error) {
    console.error("AJAX error: " + error);
    showMessage('error', "An error occurred while communicating with the server.");
}

/**
 * Initialize interaction buttons on posts
 */
function initializePostInteractions() {
    // Like button functionality
    $(".btn-like").on("click", function() {
        const postId = $(this).data('post-id');
        const button = $(this);
        
        // Toggle like state (in a real app, this would call the server)
        if (button.hasClass('liked')) {
            button.removeClass('liked');
            button.html('<i class="far fa-heart"></i> Like');
        } else {
            button.addClass('liked');
            button.html('<i class="fas fa-heart"></i> Liked');
        }
    });
    
    // Comment button functionality
    $(".btn-comment").on("click", function() {
        const postId = $(this).data('post-id');
        const postCard = $(this).closest('.post-card');
        
        // Toggle comment form (simplified for this example)
        const commentForm = postCard.find('.comment-form');
        if (commentForm.length) {
            commentForm.toggle();
        } else {
            const newCommentForm = `
                <div class="comment-form mt-3">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Write a comment...">
                        <button class="btn btn-primary" type="button">Post</button>
                    </div>
                </div>
            `;
            postCard.find('.post-footer').after(newCommentForm);
        }
    });
    
    // Share button (example functionality)
    $(".btn-share").on("click", function() {
        const postId = $(this).data('post-id');
        alert('Share functionality would open a modal with share options for post #' + postId);
    });
}

// Create a global array to store selected files
let selectedFiles = [];

function previewImages() {
    const input = document.getElementById('post_images');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewGrid = document.getElementById('imagePreviewGrid');
    
    // Add newly selected files to our array
    if (input.files && input.files.length > 0) {
        // Convert FileList to Array and add to selectedFiles
        Array.from(input.files).forEach(file => {
            // Check if file is not already in the array (avoid duplicates)
            if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                selectedFiles.push(file);
            }
        });
        
        // Clear the input to allow selecting the same file again
        input.value = '';
    }
    
    // Clear previous previews
    previewGrid.innerHTML = '';
    
    if (selectedFiles.length > 0) {
        // Show the preview container
        previewContainer.classList.remove('d-none');
        
        // Create grid layout based on number of files
        const gridClass = selectedFiles.length === 1 ? 'single-image' : 
                          selectedFiles.length === 2 ? 'two-images' :
                          selectedFiles.length === 3 ? 'three-images' : 'multi-images';
        
        previewGrid.className = `image-preview-grid ${gridClass}`;
        
        // Generate previews for each selected file
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item position-relative';
                
                // Create image element
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image';
                previewItem.appendChild(img);
                
                // Create remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image-btn btn btn-sm btn-danger rounded-circle position-absolute';
                removeBtn.innerHTML = '<i class="bi bi-x"></i>';
                removeBtn.style.top = '5px';
                removeBtn.style.right = '5px';
                removeBtn.onclick = function(evt) {
                    evt.preventDefault();
                    removeImage(index);
                };
                previewItem.appendChild(removeBtn);
                
                previewGrid.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
    } else {
        // Hide the preview container if no files selected
        previewContainer.classList.add('d-none');
    }
}

function removeImage(index) {
    // Remove the file from our array
    selectedFiles.splice(index, 1);
    
    // Update preview
    previewImages();
}

// Modify the form submission to include our selected files
document.addEventListener('DOMContentLoaded', function() {
    // Check if the form exists before attaching event listeners
    const postForm = document.getElementById('clinic-postForm');
    
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default submission
            
            // Create a new FormData instance from the form
            const formData = new FormData(this);
            
            // Remove any existing file fields (they will be replaced)
            for (let key of formData.keys()) {
                if (key === 'post_images[]') {
                    formData.delete(key);
                }
            }
            
            // Add each file from our selectedFiles array
            selectedFiles.forEach(file => {
                formData.append('post_images[]', file);
            });
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Posting...';
            submitBtn.disabled = true;
            
            // Submit the form via AJAX
            fetch(this.action || window.location.href, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Reset the form and selected files
                postForm.reset();
                selectedFiles = [];
                previewImages();
                
                // Reset the button
                submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Post Announcement';
                submitBtn.disabled = false;
                
                // Show success message
                if (data.status === 'success') {
                    showToast('Success', data.message || 'Announcement posted successfully!', 'success');
                    
                    // Close the modal if it exists
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // Refresh posts if needed
                    if (typeof fetchClinicPosts === 'function') {
                        fetchClinicPosts();
                    }
                } else {
                    showToast('Error', data.message || 'Failed to post announcement', 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                showToast('Error', 'Failed to post announcement. Please try again.', 'error');
                
                // Reset the button
                submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Post Announcement';
                submitBtn.disabled = false;
            });
        });
    }
});

// Helper function to show toast messages
function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-orange show`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${title}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}
