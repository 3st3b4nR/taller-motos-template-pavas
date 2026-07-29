import { executeQuery, getConnection, releaseConnection } from "../../../common/configs/db.config.js";
import { httpError } from "../../../common/utils/http-error.js";
import { isValidTransition } from "../../../common/constants/work-order-status.js";

const ORDER_SELECT = `
  SELECT wo.id, wo.moto_id motoId, wo.entry_date entryDate,
         wo.fault_description faultDescription, wo.status, wo.total,
         wo.created_at createdAt, wo.updated_at updatedAt,
         b.id bikeId, b.plate, b.brand, b.model, b.cylinder,
         c.id clientId, c.name clientName, c.phone clientPhone, c.email clientEmail
  FROM work_orders wo
  JOIN bikes b ON b.id = wo.moto_id
  JOIN clients c ON c.id = b.client_id`;

const mapOrder = (row, items = []) => ({
  id: row.id,
  motoId: row.motoId,
  entryDate: row.entryDate,
  faultDescription: row.faultDescription,
  status: row.status,
  total: Number(row.total),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  bike: {
    id: row.bikeId,
    plate: row.plate,
    brand: row.brand,
    model: row.model,
    cylinder: row.cylinder,
    client: { id: row.clientId, name: row.clientName, phone: row.clientPhone, email: row.clientEmail }
  },
  items
});

const loadOrder = async (id, connection) => {
  const rows = await executeQuery(`${ORDER_SELECT} WHERE wo.id = ?`, [id], connection);
  if (!rows.length) throw httpError(404, "Orden de trabajo no encontrada");
  const items = await executeQuery(
    `SELECT id, work_order_id workOrderId, type, description, count,
            unit_value unitValue, created_at createdAt, updated_at updatedAt
     FROM work_order_items WHERE work_order_id = ? ORDER BY id ASC`,
    [id], connection
  );
  return mapOrder(rows[0], items.map((item) => ({ ...item, unitValue: Number(item.unitValue) })));
};

export const getById = (id) => loadOrder(id);

export const create = async ({ motoId, faultDescription, entryDate }, user) => {
  if (!motoId || !faultDescription) throw httpError(400, "Moto y descripción de la falla son obligatorias");
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    const bikes = await executeQuery("SELECT id FROM bikes WHERE id = ?", [motoId], connection);
    if (!bikes.length) throw httpError(400, "No se permite crear una orden sin una moto válida");
    const result = await executeQuery(
      `INSERT INTO work_orders
       (moto_id, entry_date, fault_description, status, total, created_at, updated_at)
       VALUES (?, COALESCE(?, CURDATE()), ?, 'RECIBIDA', 0, NOW(), NOW())`,
      [motoId, entryDate || null, faultDescription], connection
    );
    await executeQuery(
      `INSERT INTO work_order_status_history
       (work_order_id, from_status, to_status, note, changed_by_user_id, created_at)
       VALUES (?, NULL, 'RECIBIDA', 'Orden creada', ?, NOW())`,
      [result.insertId, user.id], connection
    );
    await connection.commit();
    return loadOrder(result.insertId);
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    releaseConnection(connection);
  }
};

export const list = async ({ status = "", plate = "", page = 1, pageSize = 10 }) => {
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const size = Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 10));
  const offset = (currentPage - 1) * size;
  const where = "WHERE (? = '' OR wo.status = ?) AND (? = '' OR b.plate LIKE CONCAT('%', ?, '%'))";
  const params = [status, status, plate, plate.toUpperCase()];
  const rows = await executeQuery(
    `${ORDER_SELECT} ${where} ORDER BY wo.created_at DESC LIMIT ? OFFSET ?`,
    [...params, size, offset]
  );
  const count = await executeQuery(
    `SELECT COUNT(*) total FROM work_orders wo JOIN bikes b ON b.id = wo.moto_id ${where}`,
    params
  );
  const total = Number(count[0].total);
  return {
    data: rows.map((row) => mapOrder(row)),
    pagination: { page: currentPage, pageSize: size, total, totalPages: Math.ceil(total / size) }
  };
};

export const updateStatus = async (id, { status, toStatus, note }, user) => {
  const nextStatus = status || toStatus;
  if (!nextStatus) throw httpError(400, "Debe indicar el nuevo estado");
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    const rows = await executeQuery("SELECT status FROM work_orders WHERE id = ? FOR UPDATE", [id], connection);
    if (!rows.length) throw httpError(404, "Orden de trabajo no encontrada");
    const current = rows[0].status;
    if (current === nextStatus) throw httpError(400, `La orden ya se encuentra en estado ${nextStatus}`);
    if (!isValidTransition(current, nextStatus)) {
      throw httpError(400, `Transición inválida: no se puede pasar de ${current} a ${nextStatus}`);
    }
    if (user.role === "MECANICO" && ["ENTREGADA", "CANCELADA"].includes(nextStatus)) {
      throw httpError(403, `El rol MECANICO no puede cambiar la orden a estado ${nextStatus}`);
    }
    await executeQuery("UPDATE work_orders SET status = ?, updated_at = NOW() WHERE id = ?", [nextStatus, id], connection);
    await executeQuery(
      `INSERT INTO work_order_status_history
       (work_order_id, from_status, to_status, note, changed_by_user_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, current, nextStatus, note || null, user.id], connection
    );
    await connection.commit();
    return loadOrder(id);
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    releaseConnection(connection);
  }
};

export const history = async (id, { page = 1, pageSize = 50 }) => {
  const orders = await executeQuery("SELECT id FROM work_orders WHERE id = ?", [id]);
  if (!orders.length) throw httpError(404, "Orden de trabajo no encontrada");
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const size = Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 50));
  const offset = (currentPage - 1) * size;
  const rows = await executeQuery(
    `SELECT h.id, h.work_order_id workOrderId, h.from_status fromStatus,
            h.to_status toStatus, h.note, h.created_at createdAt,
            u.id userId, u.name userName, u.role userRole
     FROM work_order_status_history h
     JOIN users u ON u.id = h.changed_by_user_id
     WHERE h.work_order_id = ?
     ORDER BY h.created_at DESC LIMIT ? OFFSET ?`,
    [id, size, offset]
  );
  const count = await executeQuery("SELECT COUNT(*) total FROM work_order_status_history WHERE work_order_id = ?", [id]);
  const total = Number(count[0].total);
  return {
    data: rows.map(({ userId, userName, userRole, ...row }) => ({
      ...row, changedBy: { id: userId, name: userName, role: userRole }
    })),
    pagination: { page: currentPage, pageSize: size, total, totalPages: Math.ceil(total / size) }
  };
};

const recalculateTotal = (workOrderId, connection) => executeQuery(
  `UPDATE work_orders SET total = (
     SELECT COALESCE(SUM(count * unit_value), 0) FROM work_order_items WHERE work_order_id = ?
   ), updated_at = NOW() WHERE id = ?`,
  [workOrderId, workOrderId], connection
);

export const addItem = async (workOrderId, { type, description, count, unitValue }) => {
  if (!["MANO_OBRA", "REPUESTO"].includes(type)) throw httpError(400, "Tipo inválido: MANO_OBRA o REPUESTO");
  if (!description) throw httpError(400, "La descripción es obligatoria");
  if (Number(count) <= 0) throw httpError(400, "La cantidad debe ser mayor a 0");
  if (unitValue === undefined || Number(unitValue) < 0) throw httpError(400, "El valor unitario no puede ser negativo");
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    const orders = await executeQuery("SELECT status FROM work_orders WHERE id = ? FOR UPDATE", [workOrderId], connection);
    if (!orders.length) throw httpError(404, "Orden de trabajo no encontrada");
    if (["ENTREGADA", "CANCELADA"].includes(orders[0].status)) {
      throw httpError(400, `No se pueden agregar ítems a una orden en estado ${orders[0].status}`);
    }
    await executeQuery(
      `INSERT INTO work_order_items
       (work_order_id, type, description, count, unit_value, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [workOrderId, type, description, Number(count), Number(unitValue)], connection
    );
    await recalculateTotal(workOrderId, connection);
    await connection.commit();
    return loadOrder(workOrderId);
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    releaseConnection(connection);
  }
};

export const removeItem = async (itemId) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    const items = await executeQuery(
      `SELECT i.work_order_id workOrderId, wo.status
       FROM work_order_items i JOIN work_orders wo ON wo.id = i.work_order_id
       WHERE i.id = ? FOR UPDATE`,
      [itemId], connection
    );
    if (!items.length) throw httpError(404, "Ítem no encontrado");
    if (["ENTREGADA", "CANCELADA"].includes(items[0].status)) {
      throw httpError(400, `No se pueden eliminar ítems de una orden en estado ${items[0].status}`);
    }
    await executeQuery("DELETE FROM work_order_items WHERE id = ?", [itemId], connection);
    await recalculateTotal(items[0].workOrderId, connection);
    await connection.commit();
    return loadOrder(items[0].workOrderId);
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    releaseConnection(connection);
  }
};
