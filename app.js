const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 443;

// Directories for uploads and thumbnails
const uploadsDir = path.join(__dirname, 'public/uploads');
const thumbnailsDir = path.join(__dirname, 'public/thumbnails');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
    fileFilter: (req, file, cb) => {
        // Optional: Only allow specific file types
        const allowedTypes = /mp4|mkv|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, MKV, and AVI files are allowed.'));
        }
    }
});

app.use(express.json()); // For parsing application/json
app.use(express.static('public'));

// Serve data.json
app.get('/data.json', (req, res) => {
    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading data file: ${err.message}`);
            res.status(500).json({ success: false, error: 'Error reading data file.' });
        } else {
            res.header('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file || !req.body.title) {
        return res.json({ success: false, error: 'File and title are required.' });
    }

    const videoId = uuidv4();
    const videoPath = path.join(uploadsDir, req.file.filename);
    const thumbnailPath = path.join(thumbnailsDir, videoId + '.jpg'); // Change to .jpg

    // Generate thumbnail
    exec(`ffmpeg -i "${videoPath}" -ss 00:00:01.000 -vframes 1 -q:v 2 "${thumbnailPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error generating thumbnail: ${error.message}`);
            return res.json({ success: false, error: 'Error generating thumbnail.' });
        }

        // Save video metadata to data.json
        const videoData = {
            id: videoId,
            filename: req.file.filename,
            title: req.body.title,
            likes: 0,
            dislikes: 0,
            comments: []
        };

        const dataFilePath = path.join(__dirname, 'data.json');
        fs.readFile(dataFilePath, 'utf8', (err, data) => {
            let jsonData = [];
            if (err && err.code !== 'ENOENT') {
                console.error(`Error reading data file: ${err.message}`);
                return res.json({ success: false, error: 'Error saving video data.' });
            }
            if (data) {
                jsonData = JSON.parse(data);
            }
            jsonData.push(videoData);
            fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing data file: ${err.message}`);
                    return res.json({ success: false, error: 'Error saving video data.' });
                }
                res.json({ success: true });
            });
        });
    });
});

// Update reactions (likes/dislikes)
app.post('/reaction', (req, res) => {
    const { id, type } = req.query;
    const dataFilePath = path.join(__dirname, 'data.json');

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading data file: ${err.message}`);
            return res.json({ success: false, error: 'Error reading data file.' });
        }

        const videos = JSON.parse(data);
        const video = videos.find(v => v.id === id);

        if (video) {
            if (type === 'like') {
                video.likes += 1;
            } else if (type === 'dislike') {
                video.dislikes += 1;
            }

            fs.writeFile(dataFilePath, JSON.stringify(videos, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing data file: ${err.message}`);
                    return res.json({ success: false, error: 'Error updating reactions.' });
                }

                res.json({ success: true, likes: video.likes, dislikes: video.dislikes });
            });
        } else {
            res.json({ success: false, error: 'Video not found.' });
        }
    });
});

// Add comment
app.post('/comment', (req, res) => {
    const { id } = req.query;
    const { comment } = req.body;
    const dataFilePath = path.join(__dirname, 'data.json');

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading data file: ${err.message}`);
            return res.json({ success: false, error: 'Error reading data file.' });
        }

        const videos = JSON.parse(data);
        const video = videos.find(v => v.id === id);

        if (video) {
            video.comments.push(comment);

            fs.writeFile(dataFilePath, JSON.stringify(videos, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing data file: ${err.message}`);
                    return res.json({ success: false, error: 'Error adding comment.' });
                }

                res.json({ success: true });
            });
        } else {
            res.json({ success: false, error: 'Video not found.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
