

import { useState } from "react";
import VideoPlayer from "./VideoPlayer";

function App() {
  const [videoLink, setVideoLink] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // same name as in multer.single('file')

    setUploading(true);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.videoUrl) {
        setVideoLink(data.videoUrl); // set dynamic video link from backend
        console.log("✅ Video uploaded:", data.videoUrl);
      } else {
        console.error("❌ Upload failed:", data);
      }
    } catch (error) {
      console.error("❌ Error uploading video:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <h1>🎬 Upload and Stream Video</h1>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />

      {uploading && <p>Uploading & processing video... ⏳</p>}

      {videoLink && (
        <div style={{ marginTop: "20px" }}>
          <h3>Video Ready to Play:</h3>
          <VideoPlayer
            options={{
              sources: [
                {
                  src: videoLink,
                  type: "application/x-mpegURL",
                },
              ],
              controls: true,
              responsive: true,
              fluid: true,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
