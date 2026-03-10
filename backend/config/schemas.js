const { z } = require('zod');

// Esquema para login (soporta loginId que puede ser username o email)
const loginSchema = z.object({
  loginId: z.string().min(3, "El ID de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Esquema para registro (signup) desde server.js legacy
const signupSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  tipo_usuario: z.enum(["alumno", "maestro", "admin_universidad", "admin_sedeq", "admin_empresa"]),
  estatus: z.enum(["activo", "inactivo", "pendiente", "suspendido"]).optional(),
});

// Esquema para creación de usuarios (admin management)
const createUserSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  tipo_usuario: z.enum(["alumno", "maestro", "admin_universidad", "admin_sedeq", "admin_empresa"]),
  estatus: z.enum(["activo", "inactivo", "pendiente", "suspendido"]).optional(),
  id_universidad: z.number().optional().nullable(),
});

// Esquema para validación de uploads
const uploadSchema = z.object({
  uploadType: z.enum(['cursos', 'credenciales', 'logos', 'entregas']).default('cursos'),
});

module.exports = {
  loginSchema,
  signupSchema,
  createUserSchema,
  uploadSchema
};
