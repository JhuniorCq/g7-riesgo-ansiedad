import { z } from "zod";
import { ACTION_FREQUENCIES } from "../../domain/entities/Action.js";

// Fecha en formato YYYY-MM-DD
const dateSchema = z.iso.date();

export const actionSchema = z
  .object({
    description: z.string().trim().min(1).max(255),
    frequency: z.enum(ACTION_FREQUENCIES),
    // Si no se envía startDate se usa la fecha de hoy (America/Lima)
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
    {
      message: "'endDate' no puede ser anterior a 'startDate'",
      path: ["endDate"],
    },
  );

export type AddActionDTO = z.infer<typeof actionSchema>;
