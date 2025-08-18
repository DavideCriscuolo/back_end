// Middleware extra: verifica ruolo admin
export default function verifyUser(req, res, next) {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Accesso riservato agli utenti" });
  }
  next();
}
