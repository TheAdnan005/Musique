import express from "express";
import cors from "cors";
import axios from "axios";
import he from "he";
import ytdl from "@distube/ytdl-core";

const app = express();
app.use(cors());

const API_KEY = "AIzaSyCj_H9ZaVOZViHHMbwrelC5qHjP_nt91m8";

// 🔎 Search videos
app.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
      q
    )}&key=${API_KEY}`;

    const result = await axios.get(url);

    // fetch extra info like duration
    const videoIds = result.data.items.map((v) => v.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`;
    const detailsRes = await axios.get(detailsUrl);

    const durationMap = {};
    detailsRes.data.items.forEach((vid) => {
      durationMap[vid.id] = vid.contentDetails.duration;
    });

    const videos = result.data.items.map((v) => ({
      title: he.decode(v.snippet.title), // ✅ decode entities
      channel: he.decode(v.snippet.channelTitle),
      videoId: v.id.videoId,
      thumbnail: v.snippet.thumbnails.high.url,
      duration: durationMap[v.id.videoId] || "N/A",
    }));

    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// 🎧 Stream route (for preview)
app.get("/stream", async (req, res) => {
  try {
    const { videoId, format } = req.query;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    if (format === "mp3") {
      res.setHeader("Content-Type", "audio/mpeg");
      ytdl(url, { filter: "audioonly", quality: "highestaudio" }).pipe(res);
    } else {
      res.setHeader("Content-Type", "video/mp4");
      ytdl(url, { filter: "audioandvideo", quality: "highestvideo" }).pipe(res);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Stream failed" });
  }
});

// 🎵 Download route
app.get("/download", async (req, res) => {
  try {
    const { videoId, format } = req.query;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    if (format === "mp3") {
      res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
      ytdl(url, { filter: "audioonly", quality: "highestaudio" }).pipe(res);
    } else {
      res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
      ytdl(url, { filter: "audioandvideo", quality: "highestvideo" }).pipe(res);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
