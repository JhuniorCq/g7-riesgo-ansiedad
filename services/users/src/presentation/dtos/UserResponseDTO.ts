import { User } from "../../domain/entities/User.js";

export interface UserResponseDTO {
  id: number;
  names: string;
  surnames: string;
  code: string;
  email: string;
  createdAt: Date;
}

export const toUserResponseDTO = (user: User): UserResponseDTO => {
  return {
    id: user.getId()!,
    names: user.getNames(),
    surnames: user.getSurnames(),
    code: user.getCode(),
    email: user.getEmail(),
    createdAt: user.getCreatedAt(),
  };
};
