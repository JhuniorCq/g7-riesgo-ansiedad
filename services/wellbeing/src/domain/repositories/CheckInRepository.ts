import { CheckIn } from "../entities/CheckIn.js";

export interface CheckInRepository {
  save(checkIn: CheckIn): Promise<CheckIn>;
}