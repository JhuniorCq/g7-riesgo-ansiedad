import { ActionAlreadyCompletedError } from "../errors/ActionAlreadyCompletedError.js";
import { InvalidActionPeriodError } from "../errors/InvalidActionPeriodError.js";
import { InvalidCompletionDateError } from "../errors/InvalidCompletionDateError.js";
import {
  countDaysInclusive,
  isValidIsoDate,
} from "../valueObjects/CalendarDate.js";
import { buildProgress, Progress } from "../valueObjects/Progress.js";

export const ACTION_FREQUENCIES = ["UNA_VEZ", "DIARIA", "SEMANAL"] as const;

export type ActionFrequency = (typeof ACTION_FREQUENCIES)[number];

export interface ActionProps {
  id?: number;
  description: string;
  frequency: ActionFrequency;
  startDate: string;
  endDate: string | null;
  createdAt: Date;
  completedDates: string[];
}

export class Action {
  private id?: number;
  private description: string;
  private frequency: ActionFrequency;
  private startDate: string;
  private endDate: string | null;
  private createdAt: Date;
  private completedDates: string[];

  constructor(props: ActionProps) {
    if (
      !isValidIsoDate(props.startDate) ||
      (props.endDate !== null && !isValidIsoDate(props.endDate))
    ) {
      throw new InvalidActionPeriodError(
        "Las fechas de la acción no son válidas",
      );
    }

    if (props.endDate !== null && props.endDate < props.startDate) {
      throw new InvalidActionPeriodError(
        "La fecha de fin no puede ser anterior a la fecha de inicio",
      );
    }

    this.id = props.id;
    this.description = props.description;
    this.frequency = props.frequency;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.createdAt = props.createdAt;
    this.completedDates = [...props.completedDates].sort();
  }

  getId(): number | undefined {
    return this.id;
  }

  assignId(id: number): void {
    if (this.id) {
      throw new Error("La acción ya tiene un ID asignado");
    }

    this.id = id;
  }

  getDescription(): string {
    return this.description;
  }

  getFrequency(): ActionFrequency {
    return this.frequency;
  }

  getStartDate(): string {
    return this.startDate;
  }

  getEndDate(): string | null {
    return this.endDate;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getCompletedDates(): string[] {
    return [...this.completedDates];
  }

  // RF-14: registra un cumplimiento. "today" es la fecha local del estudiante.
  registerCompletion(date: string, today: string): void {
    if (!isValidIsoDate(date)) {
      throw new InvalidCompletionDateError(
        "La fecha del cumplimiento no es válida",
      );
    }

    if (date > today) {
      throw new InvalidCompletionDateError(
        "No se puede registrar un cumplimiento en una fecha futura",
      );
    }

    if (date < this.startDate) {
      throw new InvalidCompletionDateError(
        "La fecha es anterior al inicio de la acción",
      );
    }

    if (this.endDate !== null && date > this.endDate) {
      throw new InvalidCompletionDateError(
        "La fecha es posterior al fin de la acción",
      );
    }

    this.ensureNotAlreadyCompleted(date);

    this.completedDates.push(date);
    this.completedDates.sort();
  }

  // Reglas de progreso:
  // - UNA_VEZ: se espera 1 cumplimiento.
  // - DIARIA: 1 por cada día entre startDate y endDate (o hasta hoy si no hay endDate).
  // - SEMANAL: 1 por cada semana (bloques de 7 días contados desde startDate).
  getProgress(today: string): Progress {
    if (this.frequency === "UNA_VEZ") {
      return buildProgress(this.completedDates.length > 0 ? 1 : 0, 1);
    }

    const periodEnd = this.endDate ?? today;
    const days = countDaysInclusive(this.startDate, periodEnd);

    if (days <= 0) {
      return buildProgress(0, 0);
    }

    const datesInPeriod = this.completedDates.filter(
      (date) => date <= periodEnd,
    );

    if (this.frequency === "DIARIA") {
      return buildProgress(Math.min(datesInPeriod.length, days), days);
    }

    const expectedWeeks = Math.ceil(days / 7);
    const completedWeeks = new Set(
      datesInPeriod.map((date) => this.getWeekIndex(date)),
    ).size;

    return buildProgress(
      Math.min(completedWeeks, expectedWeeks),
      expectedWeeks,
    );
  }

  private getWeekIndex(date: string): number {
    return Math.floor((countDaysInclusive(this.startDate, date) - 1) / 7);
  }

  private ensureNotAlreadyCompleted(date: string): void {
    if (this.frequency === "UNA_VEZ" && this.completedDates.length > 0) {
      throw new ActionAlreadyCompletedError(
        "La acción ya fue marcada como cumplida",
      );
    }

    if (this.frequency === "DIARIA" && this.completedDates.includes(date)) {
      throw new ActionAlreadyCompletedError(
        "La acción ya fue registrada como cumplida en esa fecha",
      );
    }

    if (
      this.frequency === "SEMANAL" &&
      this.completedDates.some(
        (completed) => this.getWeekIndex(completed) === this.getWeekIndex(date),
      )
    ) {
      throw new ActionAlreadyCompletedError(
        "La acción ya fue registrada como cumplida en esa semana",
      );
    }
  }
}
