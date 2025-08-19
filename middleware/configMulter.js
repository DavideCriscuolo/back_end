import multer from "multer";

// Salva il file in memoria come buffer
export const uploadSchedaBuffer = multer({
  storage: multer.memoryStorage(),
}).single("scheda");
