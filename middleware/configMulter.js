import multer from "multer";
import path from "path";

// Configurazione storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "server/uploads/schede/"); // cartella dove salvare i file
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Middleware multer per singolo file
export const uploadScheda = multer({ storage }).single("scheda");
