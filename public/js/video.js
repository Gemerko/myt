document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const likeButton = document.getElementById('like-button');
    const dislikeButton = document.getElementById('dislike-button');
    const likeCount = document.getElementById('like-count');
    const dislikeCount = document.getElementById('dislike-count');
    const commentInput = document.getElementById('comment-input');
    const commentSubmit = document.getElementById('comment-submit');
    const commentsList = document.getElementById('comments-list');

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('id');

    if (!videoId) {
        console.error('No video ID specified in the URL.');
        return;
    }

    fetch('/data.json')
        .then(response => response.json())
        .then(videos => {
            const video = videos.find(v => v.id === videoId);
            if (video) {
                videoPlayer.src = `/uploads/${video.filename}`;
                videoTitle.textContent = video.title;
                likeCount.textContent = video.likes;
                dislikeCount.textContent = video.dislikes;

                // Display comments
                commentsList.innerHTML = video.comments.map(comment => `<li>${comment}</li>`).join('');

                // Like and Dislike buttons
                likeButton.addEventListener('click', () => updateReaction('like'));
                dislikeButton.addEventListener('click', () => updateReaction('dislike'));

                // Comment submission
                commentSubmit.addEventListener('click', () => {
                    const comment = commentInput.value.trim();
                    if (comment) {
                        fetch(`/comment?id=${videoId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ comment })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                commentsList.innerHTML += `<li>${comment}</li>`;
                                commentInput.value = '';
                            } else {
                                alert('Error adding comment.');
                            }
                        });
                    }
                });
            } else {
                console.error('Video not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching video data:', error);
        });

    function updateReaction(type) {
        fetch(`/reaction?id=${videoId}&type=${type}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    if (type === 'like') {
                        likeCount.textContent = result.likes;
                    } else if (type === 'dislike') {
                        dislikeCount.textContent = result.dislikes;
                    }
                } else {
                    alert('Error updating reaction.');
                }
            });
    }
});
