import { executeQuery } from "../../../common/configs/db.config.js";
import { httpError } from "../../../common/utils/http-error.js";

export const create = async ({ name, phone, email }) => {
  if (!name || !phone) throw httpError(400, "Nombre y teléfono son obligatorios");
  const result = await executeQuery(
    "INSERT INTO clients (name, phone, email, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
    [name, phone, email || null]
  );
  return getById(result.insertId);
};

export const list = async (search = "") => executeQuery(
  `SELECT id, name, phone, email, created_at createdAt, updated_at updatedAt
   FROM clients
   WHERE ? = '' OR name LIKE CONCAT('%', ?, '%') OR phone LIKE CONCAT('%', ?, '%') OR email LIKE CONCAT('%', ?, '%')
   ORDER BY name ASC`,
  [search, search, search, search]
);

export const getById = async (id) => {
  const rows = await executeQuery(
    "SELECT id, name, phone, email, created_at createdAt, updated_at updatedAt FROM clients WHERE id = ?",
    [id]
  );
  if (!rows.length) throw httpError(404, "Cliente no encontrado");
  return rows[0];
};
