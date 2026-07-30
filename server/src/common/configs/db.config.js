import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),

  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error("Error al obtener la conexión:", error);
    throw error;
  }
};

const releaseConnection = (connection) => {
  if (connection) connection.release();
};

const testConnection = async () => {
  let connection;

  try {
    connection = await getConnection();
    await connection.query("SELECT 1");

    console.log(
      `Conexión exitosa a ${process.env.DB_NAME} en ${process.env.DB_HOST}:${process.env.DB_PORT}`
    );
  } catch (error) {
    console.error("Error en la prueba de conexión:", error);
  } finally {
    releaseConnection(connection);
  }
};

const executeQuery = async (query, params = [], connection) => {
  let connectionDb;

  try {
    connectionDb = connection || await getConnection();
    const [results] = await connectionDb.execute(query, params);
    return results;
  } finally {
    if (!connection && connectionDb) releaseConnection(connectionDb);
  }
};

export {
  pool,
  testConnection,
  getConnection,
  releaseConnection,
  executeQuery
};