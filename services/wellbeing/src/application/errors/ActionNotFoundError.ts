export class ActionNotFoundError extends Error {
  constructor() {
    super("Acción no encontrada");
    this.name = "ActionNotFoundError";
  }
}
