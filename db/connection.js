import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connessione
connection.getConnection((err, conn) => {
  if (err) {
    console.error("Errore connessione al DB:", err);
  } else {
    console.log("Connessione al DB riuscita!");
    conn.release();
  }
});

export default connection;
