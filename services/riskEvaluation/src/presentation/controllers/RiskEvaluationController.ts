import { Request, Response } from "express";
import { CreateRiskEvaluation } from "../../application/useCases/CreateRiskEvaluation.js";
import { createRiskEvaluationSchema } from "../dtos/CreateRiskEvaluationDTO.js";

export class RiskEvaluationController {
  private readonly createRiskEvaluation: CreateRiskEvaluation;

  constructor(createRiskEvaluation: CreateRiskEvaluation) {
    this.createRiskEvaluation = createRiskEvaluation;
  }

  async create(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({
        message: "Usuario no autenticado",
      });

      return;
    }

    const inputData = createRiskEvaluationSchema.parse(req.body);

    const riskEvaluation = await this.createRiskEvaluation.execute({
      ...inputData,
      userId: req.userId,
    });

    // Tal vez crear un DTO para la respuesta
    res.status(201).json({
      id: riskEvaluation.getId(),
      userId: riskEvaluation.getUserId(),
      anxietyProbability: riskEvaluation.getAnxietyProbability(),
      riskLevel: riskEvaluation.getRiskLevel(),
      explanation: riskEvaluation.getExplanation(),
      recommendations: riskEvaluation.getRecommendations(),
      aiReport: riskEvaluation.getAiReport(),
      createdAt: riskEvaluation.getCreatedAt(),
    });
  }
}
