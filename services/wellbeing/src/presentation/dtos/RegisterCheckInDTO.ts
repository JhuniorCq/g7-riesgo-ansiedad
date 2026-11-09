import { z } from "zod";
import {
  WELLBEING_CONTEXTS,
  WELLBEING_LEVELS,
} from "../../domain/entities/CheckIn.js";

export const registerCheckInSchema = z.object({
  level: z.enum(WELLBEING_LEVELS),
  context: z.enum(WELLBEING_CONTEXTS).optional(),
});

export type RegisterCheckInDTO = z.infer<typeof registerCheckInSchema>;
