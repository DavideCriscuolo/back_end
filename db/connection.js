import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
};

const connection = mysql.createConnection(credentials);

console.log(connection);

connection.connect((err) => {
  if (err) {
    console.log(err.sqlMessage);
  } else {
    console.log("Connection Success");
  }
});
export default connection;
