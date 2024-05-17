const express = require("express");

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("./utils/s3Client");



const deleteImageRouter = express.Router();

deleteImageRouter.post("/", async (req, res) => {
    try {
        const { imageName } = req.body.input;
        const result = await deleteImage(imageName);
        res.json({ error: 0, message: "delete Image Successful" });
    } catch (e) {
        res.json({ error: 1, message: e.message });
    }
})


const deleteImage = async (imageName) => {
    try {
        const bucketParams = {
            Bucket: "axra",
            Key: `VJun/${imageName}`,
        };

        const data = await s3Client.send(new DeleteObjectCommand(bucketParams));
        console.log("Success", data);
        return data;
    } catch (e) {
        throw new Error(e.message);
    }

}

module.exports = deleteImageRouter;