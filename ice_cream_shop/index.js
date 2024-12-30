const express = require("express");
const { Client } = require("pg");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(morgan("dev"));
