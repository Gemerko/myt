document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid');

    fetch('/data.json')
        .then(response => response.json())
        .then(videos => {
            videoGrid.innerHTML = ''; // Clear previous content
            videos.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.classList.add('video-item');
                
                // Create video thumbnail element
                const thumbnail = document.createElement('img');
                thumbnail.src = `/thumbnails/${video.id}.jpg`;
                thumbnail.alt = video.title;
                
                // Create video title element
                const title = document.createElement('h3');
                title.textContent = video.title;
                
                // Add click event to navigate to video detail page
                videoItem.addEventListener('click', () => {
                    window.location.href = `video.html?id=${video.id}`;
                });

                videoItem.appendChild(thumbnail);
                videoItem.appendChild(title);
                videoGrid.appendChild(videoItem);
            });
        })
        .catch(error => {
            console.error('Error fetching video data:', error);
        });
});
