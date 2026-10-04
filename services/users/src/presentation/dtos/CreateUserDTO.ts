import { z } from "zod";

export const createUserSchema = z.object({
  names: z.string().trim().min(1, "Los nombres son obligatorios"),
  surnames: z.string().trim().min(1, "Los apellidos son obligatorios"),
  code: z.string().trim().min(1, "El código de estudiante es obligatorio"),
  email: z.string().trim().email("El correo no tiene un formato válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
