require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 15,           // ← ahora sí se usa (ajustado para cientos de usuarios)
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  charset: 'utf8mb4_unicode_ci'  // evita problemas de caracteres
});

// Test de conexión al iniciar (muy útil en producción)
pool.getConnection()
  .then((connection) => {
    console.log("✅ Pool de MySQL creado correctamente");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ ERROR CRÍTICO: No se pudo crear el pool MySQL");
    console.error(err.message);
    process.exit(1); // detiene el servidor si falla la BD
  });

module.exports = pool;