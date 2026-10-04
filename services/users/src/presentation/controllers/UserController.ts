import { Request, Response } from "express";
import { CreateUser } from "../../application/useCases/CreateUser.js";
import { createUserSchema } from "../dtos/CreateUserDTO.js";
import { toUserResponseDTO } from "../dtos/UserResponseDTO.js";

export class UserController {
  private readonly createUser: CreateUser;

  constructor(createUser: CreateUser) {
    this.createUser = createUser;
  }

  async create(req: Request, res: Response): Promise<void> {
    const input = createUserSchema.parse(req.body);

    const user = await this.createUser.execute(input);

    res.status(201).json(toUserResponseDTO(user));
  }
}
