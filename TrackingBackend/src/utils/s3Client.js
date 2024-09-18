const { S3 } = require("@aws-sdk/client-s3");
const { awsAccessKeyId, awsSecretAccessKey } = require("../../config.js")

const s3Client = new S3({
    region: "ap-southeast-1",
    credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey
    }
});

module.exports = { s3Client };
