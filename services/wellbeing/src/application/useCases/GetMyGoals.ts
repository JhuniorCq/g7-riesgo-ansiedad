import { Goal } from "../../domain/entities/Goal.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";

export class GetMyGoals {
  private readonly goalRepository: GoalRepository;

  constructor(goalRepository: GoalRepository) {
    this.goalRepository = goalRepository;
  }

  execute(userId: number): Promise<Goal[]> {
    return this.goalRepository.findByUserId(userId);
  }
}
