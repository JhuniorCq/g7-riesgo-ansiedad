import { Goal } from "../../domain/entities/Goal.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";
import { GoalNotFoundError } from "../errors/GoalNotFoundError.js";

export interface GetMyGoalByIdInput {
  userId: number;
  goalId: number;
}

export class GetMyGoalById {
  private readonly goalRepository: GoalRepository;

  constructor(goalRepository: GoalRepository) {
    this.goalRepository = goalRepository;
  }

  async execute(input: GetMyGoalByIdInput): Promise<Goal> {
    const goal = await this.goalRepository.findByIdAndUserId(
      input.goalId,
      input.userId,
    );

    // Si el objetivo es de otro usuario también se responde "no encontrado"
    if (!goal) {
      throw new GoalNotFoundError();
    }

    return goal;
  }
}
