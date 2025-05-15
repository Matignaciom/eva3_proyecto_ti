const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sigepa-db-id.cfy6uk6aipzc.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '#SnKKerV!tH4gRf',
  database: 'sigepa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; 