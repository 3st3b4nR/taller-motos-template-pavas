import "dotenv/config.js";
import bcrypt from "bcryptjs";
import { executeQuery, pool } from "./common/configs/db.config.js";

try {
  const existing = await executeQuery("SELECT id FROM users WHERE email = ? LIMIT 1", ["admin@taller.com"]);
  if (existing.length) {
    console.log("El usuario administrador ya existe.");
  } else {
    const passwordHash = await bcrypt.hash("admin1234", 12);
    await executeQuery(
      `INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
       VALUES ('Administrador', 'admin@taller.com', ?, 'ADMIN', 1, NOW(), NOW())`,
      [passwordHash]
    );
    console.log("Administrador creado: admin@taller.com / admin1234");
  }
} finally {
  await pool.end();
}
