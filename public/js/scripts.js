document.getElementById('uploadForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('videoFile', document.getElementById('videoFile').files[0]);
    formData.append('title', document.getElementById('title').value);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    document.getElementById('message').innerText = result.message;

    if (response.ok) {
        setTimeout(() => {
            window.location.href = '/';
        }, 1000); // Redirect to main page after 1 second
    }
};

async function searchVideos() {
    const query = document.getElementById('searchInput').value;
    const response = await fetch(`/search?query=${query}`);
    const videos = await response.json();
    const videosContainer = document.getElementById('videos');
    videosContainer.innerHTML = '';

    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.classList.add('video-card');
        videoElement.innerHTML = `
            <video controls>
                <source src="/uploads/${video.filename}" type="video/mp4">
            </video>
            <h3>${video.title}</h3>
            <button onclick="likeVideo('${video.id}')">Like (${video.likes})</button>
            <button onclick="dislikeVideo('${video.id}')">Dislike (${video.dislikes})</button>
            <div>
                <input type="text" id="comment-${video.id}" placeholder="Add a comment">
                <button onclick="addComment('${video.id}')">Comment</button>
            </div>
            <div id="comments-${video.id}">
                ${video.comments.map(comment => `<p>${comment}</p>`).join('')}
            </div>
        `;
        videosContainer.appendChild(videoElement);
    });
}

async function likeVideo(id) {
    await fetch(`/like/${id}`, { method: 'POST' });
    searchVideos();
}

async function dislikeVideo(id) {
    await fetch(`/dislike/${id}`, { method: 'POST' });
    searchVideos();
}

async function addComment(id) {
    const comment = document.getElementById(`comment-${id}`).value;
    await fetch(`/comment/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
    });
    searchVideos();
}
async function searchVideos() {
    const query = document.getElementById('searchInput').value;
    const response = await fetch(`/search?query=${query}`);
    const videos = await response.json();
    const videosContainer = document.getElementById('videos');
    videosContainer.innerHTML = '';

    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.classList.add('video-card');
        videoElement.onclick = () => {
            window.location.href = `/video.html?id=${video.id}`;
        };
        videoElement.innerHTML = `
            <video>
                <source src="/uploads/${video.filename}" type="video/mp4">
            </video>
            <h3>${video.title}</h3>
        `;
        videosContainer.appendChild(videoElement);
    });
}
