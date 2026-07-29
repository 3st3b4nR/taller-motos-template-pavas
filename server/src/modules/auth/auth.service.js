import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../../common/configs/db.config.js";
import { httpError } from "../../common/utils/http-error.js";

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  active: Boolean(user.active),
  useId: user.id,
  fullName: user.name,
  useEmail: user.email,
  proName: user.role
});

export const login = async ({ email, usuario, password, clave }) => {
  const loginEmail = email || usuario;
  const plainPassword = password || clave;
  if (!loginEmail || !plainPassword) throw httpError(400, "Email y contraseña son obligatorios");
  const rows = await executeQuery(
    "SELECT id, name, email, password_hash passwordHash, role, active FROM users WHERE email = ? LIMIT 1",
    [loginEmail.toLowerCase()]
  );
  const user = rows[0];
  const valid = user && user.active && await bcrypt.compare(plainPassword, user.passwordHash);
  if (!valid) throw httpError(401, "Credenciales inválidas");

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "60m" }
  );
  return { accessToken, user: toPublicUser(user) };
};

export const register = async ({ name, email, password, role = "MECANICO" }) => {
  if (!name || !email || !password) throw httpError(400, "Nombre, email y contraseña son obligatorios");
  if (password.length < 6) throw httpError(400, "La contraseña debe tener al menos 6 caracteres");
  if (!["ADMIN", "MECANICO"].includes(role)) throw httpError(400, "Rol inválido");
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await executeQuery(
    `INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
    [name, email.toLowerCase(), passwordHash, role]
  );
  const users = await executeQuery("SELECT id, name, email, role, active FROM users WHERE id = ?", [result.insertId]);
  return toPublicUser(users[0]);
};

export const listUsers = async () => {
  const users = await executeQuery("SELECT id, name, email, role, active FROM users ORDER BY name ASC");
  return users.map(toPublicUser);
};

export const updateUser = async (id, { role, active, name }) => {
  const users = await executeQuery("SELECT id FROM users WHERE id = ?", [id]);
  if (!users.length) throw httpError(404, "Usuario no encontrado");
  if (role !== undefined && !["ADMIN", "MECANICO"].includes(role)) throw httpError(400, "Rol inválido");
  await executeQuery(
    `UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role),
       active = COALESCE(?, active), updated_at = NOW() WHERE id = ?`,
    [name ?? null, role ?? null, active === undefined ? null : Number(Boolean(active)), id]
  );
  const updated = await executeQuery("SELECT id, name, email, role, active FROM users WHERE id = ?", [id]);
  return toPublicUser(updated[0]);
};
