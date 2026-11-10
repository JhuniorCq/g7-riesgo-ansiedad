import { Request, Response } from "express";
import { AddActionToGoal } from "../../application/useCases/AddActionToGoal.js";
import { CreateGoal } from "../../application/useCases/CreateGoal.js";
import { GetMyGoalById } from "../../application/useCases/GetMyGoalById.js";
import { GetMyGoals } from "../../application/useCases/GetMyGoals.js";
import { RegisterActionCompletion } from "../../application/useCases/RegisterActionCompletion.js";
import { Clock } from "../../application/services/Clock.js";
import { actionSchema } from "../dtos/AddActionDTO.js";
import { createGoalSchema } from "../dtos/CreateGoalDTO.js";
import { actionParamsSchema, goalParamsSchema } from "../dtos/GoalParamsDTO.js";
import { toGoalResponse } from "../dtos/GoalResponseDTO.js";
import { registerCompletionSchema } from "../dtos/RegisterCompletionDTO.js";

export class GoalController {
  private readonly createGoal: CreateGoal;
  private readonly getMyGoals: GetMyGoals;
  private readonly getMyGoalById: GetMyGoalById;
  private readonly addActionToGoal: AddActionToGoal;
  private readonly registerActionCompletion: RegisterActionCompletion;
  private readonly clock: Clock;

  constructor(
    createGoal: CreateGoal,
    getMyGoals: GetMyGoals,
    getMyGoalById: GetMyGoalById,
    addActionToGoal: AddActionToGoal,
    registerActionCompletion: RegisterActionCompletion,
    clock: Clock,
  ) {
    this.createGoal = createGoal;
    this.getMyGoals = getMyGoals;
    this.getMyGoalById = getMyGoalById;
    this.addActionToGoal = addActionToGoal;
    this.registerActionCompletion = registerActionCompletion;
    this.clock = clock;
  }

  // RF-13
  async create(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({ message: "Usuario no autenticado" });

      return;
    }

    const inputData = createGoalSchema.parse(req.body);

    // El userId SIEMPRE sale del token, nunca del body
    const goal = await this.createGoal.execute({
      ...inputData,
      userId: req.userId,
    });

    res.status(201).json(toGoalResponse(goal, this.clock.today()));
  }

  // RF-13 / RF-14: lista con el progreso de cada objetivo
  async getMine(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({ message: "Usuario no autenticado" });

      return;
    }

    const goals = await this.getMyGoals.execute(req.userId);
    const today = this.clock.today();

    res.status(200).json(goals.map((goal) => toGoalResponse(goal, today)));
  }

  // RF-14: detalle con acciones, cumplimientos y progreso
  async getMineById(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({ message: "Usuario no autenticado" });

      return;
    }

    const { goalId } = goalParamsSchema.parse(req.params);

    const goal = await this.getMyGoalById.execute({
      userId: req.userId,
      goalId,
    });

    res.status(200).json(toGoalResponse(goal, this.clock.today()));
  }

  // RF-13: asociar una acción a un objetivo
  async addAction(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({ message: "Usuario no autenticado" });

      return;
    }

    const { goalId } = goalParamsSchema.parse(req.params);
    const action = actionSchema.parse(req.body);

    const goal = await this.addActionToGoal.execute({
      userId: req.userId,
      goalId,
      action,
    });

    res.status(201).json(toGoalResponse(goal, this.clock.today()));
  }

  // RF-14: registrar el cumplimiento de una acción
  async registerCompletion(req: Request, res: Response): Promise<void> {
    if (req.userId === undefined) {
      res.status(401).json({ message: "Usuario no autenticado" });

      return;
    }

    const { goalId, actionId } = actionParamsSchema.parse(req.params);
    // En Express 5 req.body es undefined si la solicitud no trae cuerpo
    const { date } = registerCompletionSchema.parse(req.body ?? {});

    const goal = await this.registerActionCompletion.execute({
      userId: req.userId,
      goalId,
      actionId,
      date,
    });

    res.status(201).json(toGoalResponse(goal, this.clock.today()));
  }
}
