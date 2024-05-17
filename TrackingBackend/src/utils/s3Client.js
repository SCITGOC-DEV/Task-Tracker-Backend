const { S3 } = require("@aws-sdk/client-s3");
const { digitalOceanAccessKeyId, digitalOceanSecretAccessKey } = require("../../config.js")

const s3Client = new S3({
    endpoint: "https://sgp1.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
        accessKeyId: digitalOceanAccessKeyId,
        secretAccessKey: digitalOceanSecretAccessKey
    }
});

module.exports = { s3Client };