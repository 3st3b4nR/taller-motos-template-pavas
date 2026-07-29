import { executeQuery } from "../../../common/configs/db.config.js";
import { httpError } from "../../../common/utils/http-error.js";

const selectBike = `
  SELECT b.id, b.plate, b.brand, b.model, b.cylinder, b.client_id clientId,
         c.id clientIdNested, c.name clientName, c.phone clientPhone, c.email clientEmail
  FROM bikes b JOIN clients c ON c.id = b.client_id`;

const mapBike = (row) => ({
  id: row.id, plate: row.plate, brand: row.brand, model: row.model,
  cylinder: row.cylinder, clientId: row.clientId,
  client: { id: row.clientIdNested, name: row.clientName, phone: row.clientPhone, email: row.clientEmail }
});

export const create = async ({ plate, brand, model, cylinder, clientId }) => {
  if (!plate || !brand || !model || !clientId) throw httpError(400, "Placa, marca, modelo y cliente son obligatorios");
  const clients = await executeQuery("SELECT id FROM clients WHERE id = ?", [clientId]);
  if (!clients.length) throw httpError(400, "El cliente indicado no existe");
  const result = await executeQuery(
    `INSERT INTO bikes (plate, brand, model, cylinder, client_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [plate.toUpperCase(), brand, model, cylinder || null, clientId]
  );
  return getById(result.insertId);
};

export const list = async (plate = "") => {
  const rows = await executeQuery(
    `${selectBike} WHERE ? = '' OR b.plate LIKE CONCAT('%', ?, '%') ORDER BY b.plate ASC`,
    [plate, plate.toUpperCase()]
  );
  return rows.map(mapBike);
};

export const getById = async (id) => {
  const rows = await executeQuery(`${selectBike} WHERE b.id = ?`, [id]);
  if (!rows.length) throw httpError(404, "Moto no encontrada");
  return mapBike(rows[0]);
};
