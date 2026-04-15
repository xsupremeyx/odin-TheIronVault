const { Pool } = require('pg');
require("dotenv").config();

const URL = process.env.DATABASE_URL;

module.exports = new Pool({
    connectionString: URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
