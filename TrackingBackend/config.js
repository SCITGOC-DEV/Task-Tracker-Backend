const databaseHost = process.env.DATABASE_SERVER_ADDRESS || "postgres";
const databaseName = process.env.DATABASE_NAME || "postgres";
const databasePassword = process.env.DATABASE_PASSWORD || "postgrespassword";
const databaseUsername = process.env.DATABASE_USERNAME || "postgres";

const jwttokenkey =
  "Cast from ten bronze cannons, it was unveiled on April 19, 1875, during the centennial celebration of the Battle of Concord";

const jwtExpTime = "7d";

const digitalOceanAccessKeyId = "6ZF5GJGTLMZZZNAST3UG";
const digitalOceanSecretAccessKey =
  "QYf7TF39wapUFAds/hRwL5gWQHuedvLyaowECtLEDoE";

module.exports = {
  databaseHost,
  databaseName,
  databasePassword,
  databaseUsername,
  jwttokenkey,
  jwtExpTime,
  digitalOceanAccessKeyId,
  digitalOceanSecretAccessKey,
};
