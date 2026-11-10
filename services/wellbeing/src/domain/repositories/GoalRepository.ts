import { Action } from "../entities/Action.js";
import { Goal } from "../entities/Goal.js";

export interface GoalRepository {
  // Guarda el objetivo junto con sus acciones iniciales (de forma atómica)
  save(goal: Goal): Promise<Goal>;
  findByUserId(userId: number): Promise<Goal[]>;
  // Devuelve null si el objetivo no existe o no pertenece al usuario
  findByIdAndUserId(id: number, userId: number): Promise<Goal | null>;
  addAction(goalId: number, action: Action): Promise<Action>;
  // Lanza ActionAlreadyCompletedError si ya existe un cumplimiento para esa acción y fecha
  addCompletion(actionId: number, completedOn: string): Promise<void>;
}
