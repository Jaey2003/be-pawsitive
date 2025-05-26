let selectedFiles = [];

function showPhotoSection() {
  document.getElementById("photoUploadSection").classList.remove("d-none");
}

function hidePhotoSection() {
  document.getElementById("photoUploadSection").classList.add("d-none");
  resetPreviews();
}

function triggerFileDialog(event) {
  const clickedElement = event.target;
  if (
    clickedElement.classList.contains("btn-close") ||
    clickedElement.classList.contains("remove-file-btn") ||
    clickedElement.closest(".remove-file-btn") ||
    clickedElement.closest(".btn-secondary")
  ) {
    return;
  }
  if (selectedFiles.length === 0) {
    document.getElementById("fileInput").click();
  }
}

document.getElementById("fileInput").addEventListener("change", function (e) {
  const files = e.target.files;
  if (files.length) {
    for (let i = 0; i < files.length; i++) {
      selectedFiles.push(files[i]);
    }
    renderPreviews();
  }
});

function renderPreviews() {
  const previewList = document.getElementById("previewList");
  const previewContainer = document.getElementById("previewContainer");
  const uploadPlaceholder = document.getElementById("uploadPlaceholder");
  previewList.innerHTML = "";
  if (selectedFiles.length === 0) {
    uploadPlaceholder.classList.remove("d-none");
    previewContainer.classList.add("d-none");
    return;
  }
  uploadPlaceholder.classList.add("d-none");
  previewContainer.classList.remove("d-none");
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const previewItem = document.createElement("div");
      previewItem.classList.add("position-relative");
      previewItem.style.width = "100px";
      previewItem.style.height = "100px";
      previewItem.style.overflow = "hidden";
      const img = document.createElement("img");
      img.src = evt.target.result;
      img.alt = "Preview";
      img.classList.add("img-fluid", "h-100", "w-100");
      img.style.objectFit = "cover";
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.classList.add("btn", "btn-light", "btn-sm", "position-absolute", "top-0", "end-0", "m-1", "remove-file-btn");
      removeBtn.innerHTML = '<i class="bi bi-x-circle"></i>';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeFile(index);
      };
      previewItem.appendChild(img);
      previewItem.appendChild(removeBtn);
      previewList.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderPreviews();
}

function resetPreviews() {
  selectedFiles = [];
  document.getElementById("fileInput").value = "";
  renderPreviews();
}

function showCustomAlert(message, type = 'success', duration = 3000, callback) {
  let alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alertContainer';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translateX(-50%)';
    alertContainer.style.zIndex = 9999;
    document.body.appendChild(alertContainer);
  }
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.marginBottom = "10px";
  alertContainer.appendChild(alertDiv);
  setTimeout(() => {
    alertDiv.remove();
    if (callback && typeof callback === "function") {
      callback();
    }
  }, duration);
}

document.getElementById("submitPost").addEventListener("click", function () {
  let formData = new FormData();
  let postContent = document.querySelector("textarea").value.trim();
  console.log("Post Content:", postContent);
  formData.append("post_content", postContent);
  if (selectedFiles.length > 0) {
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("post_images[]", selectedFiles[i]);
      console.log("Selected Files:", selectedFiles);
    }
  }
  fetch("../backends/clinic_postings.php", {
    method: "POST",
    body: formData,
  })
    .then(response => response.text())
    .then(data => {
      try {
        let jsonData = JSON.parse(data);
        if (jsonData.status === "success") {
          showCustomAlert("Your post was successfully submitted!", "success", 3000, function() {
            window.location.href = jsonData.redirect_url;
          });
        } else {
          showCustomAlert(jsonData.message, "danger", 3000);
        }
      } catch (error) {
        console.error("JSON Parse Error:", error, "Response:", data);
      }
    })
    .catch(error => console.error("Error:", error));
});
