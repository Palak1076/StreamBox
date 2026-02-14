import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs"; //to protect from error if path not found
import { exec } from "child_process"; //to execute command//WATCH OUT
import mongoose from "mongoose";
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI);




const videoSchema = new mongoose.Schema({
    lessonId: {
        type: String,
        required: true,
        unique: true
    },
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const Video = mongoose.model("Videos", videoSchema);
const app = express();

// Multer middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
    }
});

// Multer configuration
const upload = multer({ storage: storage });

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true
    })
);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //watch it
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get('/getVideos/:lessonId', async function (req, res) {
    try {
        const video = await Video.findOne({ lessonId: req.params.lessonId });
        if (!video) {
            return res.status(404).json({ error: "video not found" });
        }
        res.json({
            success: true,
            video: video
        });
    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ error: "Failed to fetch video" });
    }
});

// Add debug routes
app.get('/create-db-test', async (req, res) => {
    try {
        const testVideo = new Video({
            lessonId: 'test-' + uuidv4(),
            filename: 'test.m3u8',
            originalName: 'test.mp4',
            path: '/test/path',
            size: 1000,
            mimetype: 'video/mp4'
        });

        const savedVideo = await testVideo.save();

        res.json({
            success: true,
            message: "Database created successfully!",
            video: savedVideo
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.get('/all-videos', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json({
            success: true,
            count: videos.length,
            videos: videos
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.post('/upload', upload.single('file'), function (req, res) {
    const lessonId = uuidv4();
    const videoPath = req.file.path;
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;
    console.log("hlsPath", hlsPath);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    const video = new Video({
        lessonId: lessonId,
        filename: `${lessonId}/index.m3u8`,
        originalName: req.file.originalname,
        path: outputPath,
        size: req.file.size,
        mimetype: "application/x-mpegURL"
    });

    // ✅ PROPERLY CHAINED PROMISE
    video.save()
        .then(() => {
            console.log("✅ Video info saved to MongoDB with lessonId:", lessonId);

            const ffmpegCommand = `ffmpeg -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 "${hlsPath}"`;

            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log(`exec error:${error}`);
                    return res.status(500).json({ error: "Video conversion failed" });
                }
                console.log(`stdout:${stdout}`);
                console.log(`stderr:${stderr}`);
                const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;
                res.json({
                    message: "Video converted to HLS format",
                    videoUrl: videoUrl,
                    lessonId: lessonId
                });
            });
        })
        .catch(err => {  // ✅ ADDED MISSING .catch() BLOCK
            console.error("❌ Error saving to MongoDB:", err);
            res.status(500).json({ error: "Failed to save video to database" });
        });
});

app.listen(8000, () => {
    console.log("🚀 Server running on port 8000");
});
