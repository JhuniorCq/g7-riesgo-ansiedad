import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ActionNotFoundError } from "../../application/errors/ActionNotFoundError.js";
import { GoalNotFoundError } from "../../application/errors/GoalNotFoundError.js";
import { ActionAlreadyCompletedError } from "../../domain/errors/ActionAlreadyCompletedError.js";
import { InvalidActionPeriodError } from "../../domain/errors/InvalidActionPeriodError.js";
import { InvalidCompletionDateError } from "../../domain/errors/InvalidCompletionDateError.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Los datos enviados no son válidos",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (
    error instanceof GoalNotFoundError ||
    error instanceof ActionNotFoundError
  ) {
    res.status(404).json({ message: error.message });
    return;
  }

  if (error instanceof ActionAlreadyCompletedError) {
    res.status(409).json({ message: error.message });
    return;
  }

  // Reglas de negocio del dominio (fechas fuera de rango, periodo inválido)
  if (
    error instanceof InvalidCompletionDateError ||
    error instanceof InvalidActionPeriodError
  ) {
    res.status(422).json({ message: error.message });
    return;
  }

  console.error("Error no controlado: ", error);

  res.status(500).json({
    message: "Error interno del servidor",
  });
};