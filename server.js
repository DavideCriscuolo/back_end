import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import gymRouter from "./routes/gym.js";
import connection from "./db/connection.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5000;

const app = express();
app.use(
  cors({
    origin: "https://sito-palestra-lilac.vercel.app", // il tuo frontend su Vercel
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // solo se vuoi usare cookie o auth
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use("/gym", gymRouter);

// Serve frontend Vite (file statici)
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all per React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get("/test-db", (req, res) => {
  connection.query("SELECT 1+1 AS result", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.listen(port, () => {
  console.log(`Server in ascolto su ${port}`);
});
