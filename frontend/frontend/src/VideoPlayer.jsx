import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Hls from "hls.js";

export const VideoPlayer = ({ options, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    console.log("VideoPlayer useEffect triggered");

    if (!playerRef.current) {
      console.log("Initializing Video.js player...");

      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);
      console.log("Video element appended to DOM:", videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        console.log("Video.js player is ready");
        onReady && onReady(player);

        // Playback event listeners
        player.on("waiting", () => console.log("Player waiting (buffering)"));
        player.on("playing", () => console.log("Player started playing"));
        player.on("pause", () => console.log("Player paused"));
        player.on("ended", () => console.log("Player ended"));
        player.on("error", () => console.error("Video.js player error:", player.error()));
      }));

      // Handle HLS manually
      if (options.sources && options.sources[0].src.endsWith(".m3u8")) {
        console.log("HLS source detected:", options.sources[0].src);
        const videoEl = player.el().getElementsByTagName("video")[0];
        console.log("Video element fetched from Video.js player:", videoEl);

        if (Hls.isSupported()) {
          console.log("Hls.js is supported in this browser");
          const hls = new Hls();

          // HLS error listener
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS error event:", data);
          });

          hls.loadSource(options.sources[0].src);
          hls.attachMedia(videoEl);
          console.log("HLS attached to video element");
        } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
          console.log("Native HLS support detected (Safari)");
          videoEl.src = options.sources[0].src;
          videoEl.addEventListener("error", (e) => {
            console.error("Native HLS error:", e);
          });
        } else {
          console.warn("HLS is not supported in this browser");
        }
      } else {
        console.log("Non-HLS source detected, using default Video.js source");
      }
    } else {
      console.log("Updating existing Video.js player with new options");
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, onReady]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        console.log("Disposing Video.js player");
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player style={{ width: "100%" }}>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
