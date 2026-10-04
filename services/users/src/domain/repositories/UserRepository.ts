import { User } from "../entities/User.js";

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCode(code: string): Promise<User | null>;
}
