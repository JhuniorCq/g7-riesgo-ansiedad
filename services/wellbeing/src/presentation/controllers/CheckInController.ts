import { Request, Response } from "express";
import { GetCheckInHistory } from "../../application/useCases/GetCheckInHistory.js";
import { RegisterCheckIn } from "../../application/useCases/RegisterCheckIn.js";
import { getCheckInHistoryQuerySchema } from "../dtos/GetCheckInHistoryQueryDTO.js";
import { registerCheckInSchema } from "../dtos/RegisterCheckInDTO.js";

export class CheckInController {
  private readonly registerCheckIn: RegisterCheckIn;
  private readonly getCheckInHistory: GetCheckInHistory;

  constructor(
    registerCheckIn: RegisterCheckIn,
    getCheckInHistory: GetCheckInHistory,
  ) {
    this.registerCheckIn = registerCheckIn;
    this.getCheckInHistory = getCheckInHistory;
  }

  async register(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({
        message: "Usuario no autenticado",
      });

      return;
    }

    const inputData = registerCheckInSchema.parse(req.body);

    // El userId SIEMPRE sale del token, nunca del body
    const checkIn = await this.registerCheckIn.execute({
      ...inputData,
      userId: req.userId,
    });

    res.status(201).json({
      id: checkIn.getId(),
      level: checkIn.getLevel(),
      context: checkIn.getContext(),
      createdAt: checkIn.getCreatedAt(),
    });
  }

  async getMyHistory(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({
        message: "Usuario no autenticado",
      });

      return;
    }

    const { from, to } = getCheckInHistoryQuerySchema.parse(req.query);

    // El userId SIEMPRE sale del token: solo se devuelven registros propios
    const checkIns = await this.getCheckInHistory.execute({
      userId: req.userId,
      from,
      to,
    });

    res.status(200).json(
      checkIns.map((checkIn) => ({
        id: checkIn.getId(),
        level: checkIn.getLevel(),
        score: checkIn.getScore(),
        context: checkIn.getContext(),
        createdAt: checkIn.getCreatedAt(),
      })),
    );
  }
}