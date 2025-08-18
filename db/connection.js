import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT,
  connectionLimit: 10,
});

export default connection;
console.log(connection);
