import {
  CheckIn,
  WellbeingContext,
  WellbeingLevel,
} from "../../domain/entities/CheckIn.js";
import { CheckInRepository } from "../../domain/repositories/CheckInRepository.js";

export interface RegisterCheckInInput {
  userId: number;
  level: WellbeingLevel;
  context?: WellbeingContext;
}

export class RegisterCheckIn {
  private readonly checkInRepository: CheckInRepository;

  constructor(checkInRepository: CheckInRepository) {
    this.checkInRepository = checkInRepository;
  }

  execute(input: RegisterCheckInInput): Promise<CheckIn> {
    const checkIn = new CheckIn({
      userId: input.userId,
      level: input.level,
      // null y no undefined: mysql2 no acepta undefined como parámetro
      context: input.context ?? null,
      createdAt: new Date(),
    });

    return this.checkInRepository.save(checkIn);
  }
}
