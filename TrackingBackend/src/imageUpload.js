const express = require("express");

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("./utils/s3Client");

const { v4: uuidv4 } = require("uuid");

const getImageUploadUrlRouter = express.Router();

getImageUploadUrlRouter.post("/", async (req, res) => {
  try {
    let { contentType } = req.body.input;
    if (!contentType) {
      contentType = "image/jpeg";
    }
    const imageUploadInfo = await ImageUploadInfoGenerator(contentType);
    res.json({
      error: 0,
      message: "imageUploadURL Generation Successful",
      imageUploadUrl: imageUploadInfo.imageUploadUrl,
      imageName: imageUploadInfo.imageName,
      contentType,
    });
  } catch (e) {
    res.json({
      error: 1,
      message: e.message,
      imageUploadUrl: "",
      imageUploadInfo: "",
    });
  }
});

const ImageUploadInfoGenerator = async (contentType) => {
  try {
    let imageName = uuidv4();
    if (contentType.includes("video")) {
      imageName = imageName + ".mp4";
    } else if (contentType.includes("image")) {
      imageName = imageName + ".jpg";
    } else if (contentType.includes("pdf")) {
      imageName = imageName + ".pdf";
    }
    const bucketParams = {
      Bucket: "scit-task-tracker",
      Key: `task/${imageName}`,
      ContentType: contentType,
      ACL: "public-read",
    };

    const imageUploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(bucketParams),
      { expiresIn: 150 * 60 }
    ); // Adjustable expiration.
    console.log("URL:", imageUploadUrl);
    return { imageUploadUrl, imageName };
  } catch (e) {
    throw new Error(e.message);
  }
};

module.exports = getImageUploadUrlRouter;
