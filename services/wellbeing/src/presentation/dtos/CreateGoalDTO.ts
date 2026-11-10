import { z } from "zod";
import { actionSchema } from "./AddActionDTO.js";

export const createGoalSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(2000).optional(),
  targetDate: z.iso.date().optional(),
  actions: z.array(actionSchema).max(20).optional(),
});

export type CreateGoalDTO = z.infer<typeof createGoalSchema>;
