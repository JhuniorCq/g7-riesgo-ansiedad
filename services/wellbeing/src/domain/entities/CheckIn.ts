export const WELLBEING_LEVELS = [
  "MUY_MAL",
  "MAL",
  "REGULAR",
  "BIEN",
  "MUY_BIEN",
] as const;

export type WellbeingLevel = (typeof WELLBEING_LEVELS)[number];

export const WELLBEING_CONTEXTS = [
  "ACADEMICO",
  "PERSONAL",
  "SOCIAL",
  "ECONOMICO",
  "DESCANSO",
  "OTRO",
] as const;

export type WellbeingContext = (typeof WELLBEING_CONTEXTS)[number];

export interface CheckInProps {
  id?: number;
  userId: number;
  level: WellbeingLevel;
  context: WellbeingContext | null;
  createdAt: Date;
}

export class CheckIn {
  private id?: number;
  private userId: number;
  private level: WellbeingLevel;
  private context: WellbeingContext | null;
  private createdAt: Date;

  constructor(props: CheckInProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.level = props.level;
    this.context = props.context;
    this.createdAt = props.createdAt;
  }

  // 1 = MUY_MAL ... 5 = MUY_BIEN (es lo que se guarda en la BD)
  static levelToScore(level: WellbeingLevel): number {
    return WELLBEING_LEVELS.indexOf(level) + 1;
  }

  static scoreToLevel(score: number): WellbeingLevel {
    const level = WELLBEING_LEVELS[score - 1];

    if (!level) {
      throw new Error(`Puntaje de bienestar inválido: ${score}`);
    }

    return level;
  }

  getId(): number | undefined {
    return this.id;
  }

  assignId(id: number): void {
    if (this.id) {
      throw new Error("El registro de bienestar ya tiene un ID asignado");
    }

    this.id = id;
  }

  getUserId(): number {
    return this.userId;
  }

  getLevel(): WellbeingLevel {
    return this.level;
  }

  getScore(): number {
    return CheckIn.levelToScore(this.level);
  }

  getContext(): WellbeingContext | null {
    return this.context;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}