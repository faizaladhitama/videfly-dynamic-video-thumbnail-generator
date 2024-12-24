const express = require('express');
const ytdl = require("@distube/ytdl-core");
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");
const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

var router = express.Router();

// Utility: Create directories in parallel
const createDirectories = async (paths) => {
  const creationTasks = paths.map((path) => fs.mkdirSync(path, { recursive: true }));
  await Promise.all(creationTasks);
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
      .on("end", async () => {
        try {
          // Get the list of generated thumbnail files
          const files = fs.readdirSync(outputFolder);
          const thumbnails = files.map((file) => `${outputFolder}/${file}`);
          resolve(thumbnails);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
};

// Utility: Download Video
const downloadVideo = async (url, videoPath, type) => {
  if (type === "youtube") {
    return new Promise((resolve, reject) => {
      const stream = ytdl(url).pipe(fs.createWriteStream(videoPath));
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  } else if (type === "file") {
    const response = await fetch(url);
    const readable = Readable.fromWeb(response.body);
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(videoPath);
      readable.pipe(stream);
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }
  throw new Error("Invalid type specified.");
};

// Route: /thumbnails
router.get("/thumbnails", async (req, res) => {
  const { url, type } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is null or undefined." });
  }
  if (!type) {
    return res.status(400).json({ error: "Type is null or undefined." });
  }

  const uuid = uuidv4();
  const basePath = `./uploads/${uuid}`;
  const videoPath = `${basePath}/video/${uuid}.mp4`;
  const thumbnailPath = `${basePath}/thumbnails`;

  try {
    // Create necessary directories in parallel
    await createDirectories([`${basePath}/video`, thumbnailPath]);

    // Download the video
    console.log("Downloading video...");
    await downloadVideo(url, videoPath, type);

    // Generate thumbnails
    console.log("Generating thumbnails...");
    const thumbnails = await generateThumbnails(videoPath, thumbnailPath);

    // Respond with list of thumbnail paths
    res.json({ thumbnails });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
