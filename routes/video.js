const express = require('express');
const ytdl = require("@distube/ytdl-core");
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");
const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

var router = express.Router();

var generateThumbnails = (videoPath, uuid) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 10,
        folder: `./uploads/${uuid}/thumbnails/`,
      })
      .on("end", resolve)
      .on("error", (error) => {
        console.error("Failed to generate thumbnails:", error);
        reject(error);
      });
  });
};

var createDirectory = (path) => {
  fs.mkdir(path, { recursive: true }, (error) => {
    if (error) {
      console.error(`Failed to create directory at ${path}:`, error);
    }
  });
};


/* GET users listing. */
router.get("/thumbnails", async (req, res) => {
  const { url, type } = req.query;

  if (!url) {
    res.status(400).send("URL is null or undefined.");
    return;
  }

  if (!type) {
    res.status(400).send("Type is null or undefined.");
    return;
  }

  console.log(`url: ${url}, type: ${type}`);

  const uuid = uuidv4();
  const videoPath = `./uploads/${uuid}/video/${uuid}.mp4`;

  try {
    // Create necessary directories
    await createDirectory(`./uploads/${uuid}/video`);
    await createDirectory(`./uploads/${uuid}/thumbnails`);

    if (type === "youtube") {
      const videoStream = ytdl(url);
      const fileStream = fs.writeFile(videoPath);
      videoStream.pipe(fileStream);

      videoStream.on("end", async () => {
        try {
          await generateThumbnails(videoPath, uuid);
          res.send("Thumbnails generated successfully.");
        } catch (error) {
          res.status(500).send("Error generating thumbnails.");
        }
      });

      videoStream.on("error", (error) => {
        console.error("Error downloading video:", error);
        res.status(500).send("Failed to download YouTube video.");
      });
    } else if (type === "file") {
      const response = await fetch(url);
      const readable = Readable.fromWeb(response.body);
      const fileStream = fs.createWriteStream(videoPath);

      readable.pipe(fileStream);

      fileStream.on("finish", async () => {
        try {
          await generateThumbnails(videoPath, uuid);
          res.send("Thumbnails generated successfully.");
        } catch (error) {
          res.status(500).send("Error generating thumbnails.");
        }
      });

      fileStream.on("error", (error) => {
        console.error("Error saving file:", error);
        res.status(500).send("Failed to save the file.");
      });
    } else {
      res.status(400).send("Invalid type specified.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
