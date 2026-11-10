import { CheckIn } from "../../domain/entities/CheckIn.js";
import { CheckInRepository } from "../../domain/repositories/CheckInRepository.js";

export interface GetCheckInHistoryInput {
  userId: number;
  from?: Date;
  to?: Date;
}

export class GetCheckInHistory {
  private readonly checkInRepository: CheckInRepository;

  constructor(checkInRepository: CheckInRepository) {
    this.checkInRepository = checkInRepository;
  }

  execute(input: GetCheckInHistoryInput): Promise<CheckIn[]> {
    return this.checkInRepository.findByUserId(input.userId, {
      from: input.from,
      to: input.to,
    });
  }
}
