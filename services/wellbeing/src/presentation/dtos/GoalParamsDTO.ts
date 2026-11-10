import { z } from "zod";

const idSchema = z.coerce.number().int().positive();

export const goalParamsSchema = z.object({
  goalId: idSchema,
});

export const actionParamsSchema = z.object({
  goalId: idSchema,
  actionId: idSchema,
});
