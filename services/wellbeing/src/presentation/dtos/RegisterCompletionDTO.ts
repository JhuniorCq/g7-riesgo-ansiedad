import { z } from "zod";

export const registerCompletionSchema = z.object({
  // Si no se envía, se registra el cumplimiento de hoy
  date: z.iso.date().optional(),
});

export type RegisterCompletionDTO = z.infer<typeof registerCompletionSchema>;
