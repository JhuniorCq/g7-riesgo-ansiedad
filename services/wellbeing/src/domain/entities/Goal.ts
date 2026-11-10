import { buildProgress, Progress } from "../valueObjects/Progress.js";
import { Action } from "./Action.js";

export const GOAL_STATUSES = ["ACTIVO", "COMPLETADO", "CANCELADO"] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export interface GoalProps {
  id?: number;
  userId: number;
  title: string;
  description: string | null;
  status: GoalStatus;
  targetDate: string | null;
  createdAt: Date;
  actions: Action[];
}

export class Goal {
  private id?: number;
  private userId: number;
  private title: string;
  private description: string | null;
  private status: GoalStatus;
  private targetDate: string | null;
  private createdAt: Date;
  private actions: Action[];

  constructor(props: GoalProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.targetDate = props.targetDate;
    this.createdAt = props.createdAt;
    this.actions = [...props.actions];
  }

  getId(): number | undefined {
    return this.id;
  }

  assignId(id: number): void {
    if (this.id) {
      throw new Error("El objetivo ya tiene un ID asignado");
    }

    this.id = id;
  }

  getUserId(): number {
    return this.userId;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getStatus(): GoalStatus {
    return this.status;
  }

  getTargetDate(): string | null {
    return this.targetDate;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getActions(): Action[] {
    return [...this.actions];
  }

  getActionById(actionId: number): Action | undefined {
    return this.actions.find((action) => action.getId() === actionId);
  }

  addAction(action: Action): void {
    this.actions.push(action);
  }

  // RF-14: progreso del objetivo = cumplimientos realizados / esperados de todas sus acciones
  getProgress(today: string): Progress {
    let completed = 0;
    let expected = 0;

    for (const action of this.actions) {
      const progress = action.getProgress(today);

      completed += progress.completed;
      expected += progress.expected;
    }

    return buildProgress(completed, expected);
  }
}
