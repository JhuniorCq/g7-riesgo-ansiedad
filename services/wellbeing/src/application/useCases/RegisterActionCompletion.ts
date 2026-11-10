import { Goal } from "../../domain/entities/Goal.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";
import { ActionNotFoundError } from "../errors/ActionNotFoundError.js";
import { GoalNotFoundError } from "../errors/GoalNotFoundError.js";
import { Clock } from "../services/Clock.js";

export interface RegisterActionCompletionInput {
  userId: number;
  goalId: number;
  actionId: number;
  // Fecha del cumplimiento (YYYY-MM-DD). Si no se envía, se usa la fecha de hoy.
  date?: string;
}

export class RegisterActionCompletion {
  private readonly goalRepository: GoalRepository;
  private readonly clock: Clock;

  constructor(goalRepository: GoalRepository, clock: Clock) {
    this.goalRepository = goalRepository;
    this.clock = clock;
  }

  async execute(input: RegisterActionCompletionInput): Promise<Goal> {
    const goal = await this.goalRepository.findByIdAndUserId(
      input.goalId,
      input.userId,
    );

    if (!goal) {
      throw new GoalNotFoundError();
    }

    const action = goal.getActionById(input.actionId);

    if (!action) {
      throw new ActionNotFoundError();
    }

    const today = this.clock.today();
    const completedOn = input.date ?? today;

    // El dominio valida el rango de fechas y los duplicados
    action.registerCompletion(completedOn, today);

    await this.goalRepository.addCompletion(input.actionId, completedOn);

    return goal;
  }
}
