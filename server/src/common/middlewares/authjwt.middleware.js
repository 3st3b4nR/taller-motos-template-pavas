import jwt from "jsonwebtoken";
import { executeQuery } from "../configs/db.config.js";

export const verifyToken = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = headerToken || req.cookies.tokenTaller;
    if (!token) return res.status(401).json({ message: "Token de acceso requerido" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const users = await executeQuery(
      "SELECT id, name, email, role, active FROM users WHERE id = ? AND active = 1 LIMIT 1",
      [payload.id]
    );
    if (!users.length) return res.status(401).json({ message: "Usuario no encontrado o inactivo" });
    req.user = users[0];
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Acceso denegado. Se requiere rol: ${roles.join(" o ")}` });
  }
  next();
};
