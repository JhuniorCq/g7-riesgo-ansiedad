import { Action } from "../../domain/entities/Action.js";
import { Goal } from "../../domain/entities/Goal.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";
import { GoalNotFoundError } from "../errors/GoalNotFoundError.js";
import { Clock } from "../services/Clock.js";
import { NewActionInput } from "./CreateGoal.js";

export interface AddActionToGoalInput {
  userId: number;
  goalId: number;
  action: NewActionInput;
}

export class AddActionToGoal {
  private readonly goalRepository: GoalRepository;
  private readonly clock: Clock;

  constructor(goalRepository: GoalRepository, clock: Clock) {
    this.goalRepository = goalRepository;
    this.clock = clock;
  }

  async execute(input: AddActionToGoalInput): Promise<Goal> {
    const goal = await this.goalRepository.findByIdAndUserId(
      input.goalId,
      input.userId,
    );

    if (!goal) {
      throw new GoalNotFoundError();
    }

    const action = new Action({
      description: input.action.description,
      frequency: input.action.frequency,
      startDate: input.action.startDate ?? this.clock.today(),
      endDate: input.action.endDate ?? null,
      createdAt: new Date(),
      completedDates: [],
    });

    await this.goalRepository.addAction(input.goalId, action);

    goal.addAction(action);

    return goal;
  }
}
