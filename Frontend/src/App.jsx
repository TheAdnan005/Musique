import { useState } from "react";
import axios from "axios";
import dotenv from "dotenv";
import { motion } from "framer-motion";

// dotenv.config();
// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";



export default function App() {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("mp3");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: query },
      });
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  function formatDuration(ytDuration) {
    const match = ytDuration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "00:00";
    const minutes = parseInt(match[1] || 0, 10);
    const seconds = parseInt(match[2] || 0, 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8 drop-shadow-lg">
        🎶 Music & Video Downloader
      </h1>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or videos..."
          className="flex-1 p-3 rounded-2xl bg-gray-800 text-white focus:outline-none"
        />
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="p-3 rounded-2xl bg-gray-800 text-white"
        >
          <option value="mp3">🎵 MP3</option>
          <option value="mp4">🎬 MP4</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 transition shadow-lg"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl">
        {results.map((video) => (
          <motion.div
            key={video.videoId}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/60 backdrop-blur-lg p-4 rounded-2xl shadow-lg"
          >
            {format === "mp3" ? (
              <>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="rounded-lg w-full mb-3"
                />
                <h3 className="text-lg font-semibold line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  ⏱ {formatDuration(video.duration)}
                </p>

                <audio
                  controls
                  className="w-full mt-3"
                  src={`${API_BASE_URL}/stream?videoId=${video.videoId}&format=mp3`}
                />

                <a
                  href={`${API_BASE_URL}/download?videoId=${video.videoId}&format=mp3`}
                  className="block mt-4 px-4 py-2 text-center bg-green-600 hover:bg-green-700 rounded-lg"
                  download
                >
                  ⬇ Download MP3
                </a>
              </>
            ) : (
              <>
                <video
                  controls
                  className="rounded-lg w-full mb-3 max-h-48 object-contain"
                  src={`${API_BASE_URL}/stream?videoId=${video.videoId}&format=mp4`}
                />
                <h3 className="text-lg font-semibold line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  ⏱ {formatDuration(video.duration)}
                </p>

                <a
                  href={`${API_BASE_URL}/download?videoId=${video.videoId}&format=mp4`}
                  className="block mt-4 px-4 py-2 text-center bg-green-600 hover:bg-green-700 rounded-lg"
                  download
                >
                  ⬇ Download MP4
                </a>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
