const express = require("express");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { Readable } = require("stream");
const ffmpeg = require("fluent-ffmpeg");
const NodeCache = require("node-cache");
const path = require('path');

const router = express.Router();
const thumbnailCache = new NodeCache({ stdTTL: process.env.THUMBNAIL_CACHE_TTL || 3600}); // Cache for 1 hour
const baseURL = process.env.BASE_URL || "http://localhost:3000"; // Configurable base URL

// Utility: Create directories synchronously if they don't exist
const ensureDirectoriesSync = (paths) => {
  for (const path of paths) {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
    } catch (error) {
      console.error(`Failed to create directory: ${path}`, error);
      throw error;
    }
  }
};

// Utility: Generate Thumbnails
const generateThumbnails = (videoPath, outputFolder) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 10,
        folder: outputFolder,
        filename: "thumbnail-%i.png",
      })
      .on("end", () => {
        try {
          const thumbnails = fs.readdirSync(outputFolder).map((file) => ({
            relativePath: `${outputFolder}/${file}`,
            url: `${baseURL}/${outputFolder}/${file}`,
          }));
          resolve(thumbnails);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
};

// Utility: Generate Animated Thumbnails
const generateAnimatedThumbnails = (thumbnailFolder, outputFolder) => {
  const animatedThumbnailPath = `${outputFolder}/animated-thumbnail.mp4`;
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`${thumbnailFolder}/thumbnail-%1d.png`)
      .save(animatedThumbnailPath)
      .on("end", () => {
        resolve({
          relativePath: animatedThumbnailPath,
          url: `${baseURL}/${animatedThumbnailPath}`,
        });
      })
      .on("error", reject);
  });
};

// Utility: Download Video
const downloadVideo = (url, videoPath, type) => {
  if (type === "youtube") {
    return new Promise((resolve, reject) => {
      const stream = ytdl(url).pipe(fs.createWriteStream(videoPath));
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  } else if (type === "file") {
    return fetch(url)
      .then((response) => {
        const readable = Readable.fromWeb(response.body);
        return new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(videoPath);
          readable.pipe(stream);
          stream.on("finish", resolve);
          stream.on("error", reject);
        });
      })
      .catch((err) => {
        throw new Error(`Failed to download file: ${err.message}`);
      });
  }
  throw new Error("Invalid type specified.");
};

// Route: /thumbnails
router.get("/thumbnails", (req, res) => {
  const { url, type } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }
  if (!type) {
    return res.status(400).json({ error: "Type is required." });
  }

  const cacheKey = `${type}:${url}`;
  const cachedResult = thumbnailCache.get(cacheKey);
  if (cachedResult) {
    console.log("Cache hit for:", cacheKey);
    return res.json(cachedResult);
  }

  const uuid = uuidv4();
  const basePath = path.join("uploads", uuid);
  const videoPath = path.join(basePath, "video", `${uuid}.mp4`);
  const thumbnailPath = path.join(basePath, "thumbnails");
  const animatedThumbnailPath = path.join(basePath, "animated-thumbnails");

  try {
    // Ensure directories synchronously
    console.log("Ensuring directories...");
    ensureDirectoriesSync([path.join(basePath, "video"), thumbnailPath, animatedThumbnailPath]);

    // Download video synchronously
    console.log("Downloading video...");
    downloadVideo(url, videoPath, type)
      .then(() => {
        console.log("Generating thumbnails...");
        return generateThumbnails(videoPath, thumbnailPath);
      })
      .then((thumbnails) => {
        console.log("Generating animated thumbnails...");
        return generateAnimatedThumbnails(thumbnailPath, animatedThumbnailPath).then(
          (animatedThumbnail) => ({ thumbnails, animatedThumbnail })
        );
      })
      .then((result) => {
        // Cache and respond
        thumbnailCache.set(cacheKey, result);
        res.json(result);
      })
      .catch((error) => {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal server error." });
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
