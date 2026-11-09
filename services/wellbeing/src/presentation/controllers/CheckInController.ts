import { Request, Response } from "express";
import { RegisterCheckIn } from "../../application/useCases/RegisterCheckIn.js";
import { registerCheckInSchema } from "../dtos/RegisterCheckInDTO.js";

export class CheckInController {
  private readonly registerCheckIn: RegisterCheckIn;

  constructor(registerCheckIn: RegisterCheckIn) {
    this.registerCheckIn = registerCheckIn;
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
}
