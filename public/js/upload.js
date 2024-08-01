document.getElementById('upload-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('file-input');
    const titleInput = document.getElementById('title-input');
    const uploadButton = document.getElementById('upload-button');
    const uploadProgress = document.getElementById('upload-progress');
    const uploadMessage = document.getElementById('upload-message');

    if (!fileInput.files.length || !titleInput.value) {
        uploadMessage.textContent = 'Please select a file and enter a title.';
        return;
    }

    const formData = new FormData();
    formData.append('video', fileInput.files[0]);
    formData.append('title', titleInput.value);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            uploadProgress.value = percentComplete;
            uploadProgress.style.display = 'block';
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            uploadMessage.textContent = 'Upload successful!';
            window.location.href = 'index.html';
        } else {
            uploadMessage.textContent = 'Upload failed. Please try again.';
            uploadButton.disabled = false; // Re-enable the upload button on failure
        }
        uploadProgress.style.display = 'none';
    };

    xhr.onerror = function () {
        uploadMessage.textContent = 'Upload failed. Please try again.';
        uploadProgress.style.display = 'none';
        uploadButton.disabled = false; // Re-enable the upload button on failure
    };

    uploadButton.disabled = true; // Disable the upload button to prevent multiple submissions
    xhr.send(formData);
});
