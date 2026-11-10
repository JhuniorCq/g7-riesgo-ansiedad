import { z } from "zod";

export const getCheckInHistoryQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: "'from' no puede ser posterior a 'to'",
    path: ["from"],
  });

export type GetCheckInHistoryQueryDTO = z.infer<
  typeof getCheckInHistoryQuerySchema
>;
