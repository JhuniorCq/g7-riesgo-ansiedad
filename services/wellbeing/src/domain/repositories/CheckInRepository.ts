import { CheckIn } from "../entities/CheckIn.js";

export interface CheckInHistoryFilters {
  from?: Date;
  to?: Date;
}

export interface CheckInRepository {
  save(checkIn: CheckIn): Promise<CheckIn>;
  // Devuelve los registros del usuario ordenados del más antiguo al más reciente
  findByUserId(
    userId: number,
    filters?: CheckInHistoryFilters,
  ): Promise<CheckIn[]>;
}