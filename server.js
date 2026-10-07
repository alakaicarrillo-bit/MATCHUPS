const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const NFLMETA_URL = "https://nflmeta.org/api/v1";

async function nflmeta(path) {
  const response = await fetch(`${NFLMETA_URL}${path}`, {
    headers: {
      "X-NFLMeta-Key": process.env.NFLMETA_KEY
    }
  });

  const data = await response.json();

  return {
    status: response.status,
    data
  };
}

app.get("/", (req, res) => {
  res.json({
    message: "MATCHUPS backend is running!"
  });
});

app.get("/api/team/:abbr", async (req, res) => {
  try {
    const result = await nflmeta(`/teams/${req.params.abbr.toUpperCase()}`);

    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({
      error: "Unable to reach NFLMeta"
    });
  }
});

app.get("/api/games", async (req, res) => {
  try {
    const params = new URLSearchParams();

    if (req.query.season) params.set("season", req.query.season);
    if (req.query.team) params.set("team", req.query.team);

    const query = params.toString();
    const path = `/games${query ? `?${query}` : ""}`;

    const result = await nflmeta(path);

    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({
      error: "Unable to reach NFLMeta"
    });
  }
});

app.listen(PORT, () => {
  console.log(`MATCHUPS backend running on port ${PORT}`);
});
