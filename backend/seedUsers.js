const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function seedUsers() {
  const users = [
    {
      username: "empresa1",
      email: "empresa@gmail.com",
      password: "Password123",
      tipo_usuario: "admin_empresa",
      estatus: "activo",
    }
  ];

  try {
    const db = await pool.getConnection();
    console.log("Conectado a la base de datos");

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 10);
      await db.execute(
        "INSERT INTO usuario (username, email, password_hash, tipo_usuario, estatus) VALUES (?, ?, ?, ?, ?)",
        [
          user.username,
          user.email,
          password_hash,
          user.tipo_usuario,
          user.estatus,
        ],
      );
      console.log(`Usuario ${user.username} insertado`);
    }

    db.release();
    console.log("Todos los usuarios fueron insertados correctamente");
  } catch (error) {
    console.error("Error al insertar usuarios:", error);
  }
}

seedUsers();
