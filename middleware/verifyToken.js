import jwt from "jsonwebtoken";

// Middleware base: verifica token
export default function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Accesso non autorizzato" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded conterrà anche role se lo hai messo al momento del login
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token non valido" });
  }
}
