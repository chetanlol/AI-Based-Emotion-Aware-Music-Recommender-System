import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Mapping emotion + language to seed genres
const emotionGenreMap = {
  Angry: {
    Telugu: ["telugu", "rock", "metal"],
    Tamil: ["tamil", "rock"],
    Hindi: ["hindi", "rock"],
    English: ["rock", "metal"],
  },
  Sad: {
    Telugu: ["telugu", "blues"],
    Tamil: ["tamil", "blues"],
    Hindi: ["hindi", "blues"],
    English: ["blues"],
  },
  Fear: {
    Telugu: ["telugu", "ambient"],
    Tamil: ["tamil", "ambient"],
    Hindi: ["hindi", "ambient"],
    English: ["ambient"],
  },
  Happy: {
    Telugu: ["telugu", "pop"],
    Tamil: ["tamil", "pop"],
    Hindi: ["hindi", "pop"],
    English: ["pop"],
  },
  Neutral: {
    Telugu: ["telugu", "acoustic"],
    Tamil: ["tamil", "acoustic"],
    Hindi: ["hindi", "acoustic"],
    English: ["acoustic"],
  },
  Surprise: {
    Telugu: ["telugu", "party"],
    Tamil: ["tamil", "party"],
    Hindi: ["hindi", "party"],
    English: ["party"],
  },
  Disgust: {
    Telugu: ["telugu", "alt-rock"],
    Tamil: ["tamil", "alt-rock"],
    Hindi: ["hindi", "alt-rock"],
    English: ["alt-rock"],
  },
};

// Spotify recommendation endpoint
app.post("/api/recommend", async (req, res) => {
  try {
    const { emotion, language } = req.body;

    const genres = emotionGenreMap[emotion]?.[language];
    if (!genres) {
      return res.status(400).json({ error: "Invalid emotion/language mapping" });
    }

    const accessToken = process.env.SPOTIFY_TOKEN;
    const seedGenres = genres.join(",");

    const response = await axios.get(
      `https://api.spotify.com/v1/recommendations?limit=10&seed_genres=${seedGenres}&market=IN`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json(response.data.tracks);
  } catch (error) {
    console.error("Error fetching Spotify recommendations:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
