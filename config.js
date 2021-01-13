const { env } = process;

const dotenv = require("dotenv").config();

module.exports = {
  host: env.DB_HOST || "localhost",
  username: env.DB_USERNAME || "postgres",
  password: env.DB_PASSWORD,
  database: env.DB_NAME || "danish_db",
  port: env.DB_PORT || 5432,
};
