export class GoalNotFoundError extends Error {
  constructor() {
    super("Objetivo no encontrado");
    this.name = "GoalNotFoundError";
  }
}
