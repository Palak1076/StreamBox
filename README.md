# 📺 StreamBox — Full Stack Video Streaming App

StreamBox is a MERN-based full stack video streaming platform that allows users to upload, process, and stream videos with adaptive bitrate playback using HLS. It supports secure uploads, automated video processing, metadata storage, and smooth browser playback with a modern UI.

---

## 🚀 Features

- Video upload and streaming platform  
- HLS adaptive bitrate streaming  
- FFmpeg-based video processing  
- File uploads handled with Multer  
- Smooth playback using Video.js  
- MongoDB metadata storage with Mongoose  
- REST APIs for upload and video retrieval  
- CORS-enabled backend  
- React frontend with integrated video player  

---

## 🧱 Tech Stack

**Frontend**
- React
- Video.js

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Media Tools**
- FFmpeg
- HLS

---

## 📡 API Endpoints

POST /upload  
GET /getVideos/:lessonId

---

## ⚙️ Setup Instructions

### Clone the repo
git clone <repo-url>  
cd StreamBox

### Install dependencies

Backend:
npm install

Frontend:
cd frontend  
npm install

---

## 🔐 Environment Variables

Create a `.env` file in backend root:

MONGO_URI=your_mongodb_connection_string  
PORT=5000

---

## ▶️ Run the App

Backend:
npm start

Frontend:
npm start

---

## 🎯 Use Cases

- Educational platforms  
- Course video delivery  
- Training portals  
- Custom streaming systems  

---

## 👩‍💻 Author

Palak Sharma
