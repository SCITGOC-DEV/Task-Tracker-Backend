const { Pool } = require("pg");
const {
  databaseHost,
  databaseName,
  databasePassword,
  databaseUsername,
} = require("../config");

const pool = new Pool({
  host: databaseHost,
  user: databaseUsername,
  database: databaseName,
  password: databasePassword,
  max: 20,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 100000,
});

pool.connect((err, client, release) => {
  console.log(databaseHost);
  if (err) {
    console.log("Error Acquiring client", err.stack);
    process.exit(-1);
  }
  console.log("Database Connected");
  release();
});

pool.on("error", (err, client) => {
  console.log("Unexcepted error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
