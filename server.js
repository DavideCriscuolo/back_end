import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import gymRouter from "./routes/gym.js";
import connection from "./db/connection.js";
import path from "path";
const app = express();
const port = process.env.PORT || 5000;

app.use(
  "/uploads/schede",
  express.static(path.join(process.cwd(), "server/uploads/schede"))
);

// Middleware
app.use(
  cors({
    origin: "https://sito-palestra-lilac.vercel.app", // frontend Vercel
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true // solo se usi cookie
  })
);
app.use(express.json());

// Route API
app.use("/gym", gymRouter);

// Test connessione DB
app.get("/test-db", (req, res) => {
  connection.query("SELECT 1+1 AS result", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.listen(port, () => {
  console.log(`Server in ascolto su ${port}`);
});
