import { Action, ActionFrequency } from "../../domain/entities/Action.js";
import { Goal } from "../../domain/entities/Goal.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";
import { Clock } from "../services/Clock.js";

export interface NewActionInput {
  description: string;
  frequency: ActionFrequency;
  startDate?: string;
  endDate?: string;
}

export interface CreateGoalInput {
  userId: number;
  title: string;
  description?: string;
  targetDate?: string;
  actions?: NewActionInput[];
}

export class CreateGoal {
  private readonly goalRepository: GoalRepository;
  private readonly clock: Clock;

  constructor(goalRepository: GoalRepository, clock: Clock) {
    this.goalRepository = goalRepository;
    this.clock = clock;
  }

  execute(input: CreateGoalInput): Promise<Goal> {
    const today = this.clock.today();
    const now = new Date();

    const actions = (input.actions ?? []).map(
      (action) =>
        new Action({
          description: action.description,
          frequency: action.frequency,
          startDate: action.startDate ?? today,
          endDate: action.endDate ?? null,
          createdAt: now,
          completedDates: [],
        }),
    );

    const goal = new Goal({
      userId: input.userId,
      title: input.title,
      // null y no undefined: mysql2 no acepta undefined como parámetro
      description: input.description ?? null,
      status: "ACTIVO",
      targetDate: input.targetDate ?? null,
      createdAt: now,
      actions,
    });

    return this.goalRepository.save(goal);
  }
}
