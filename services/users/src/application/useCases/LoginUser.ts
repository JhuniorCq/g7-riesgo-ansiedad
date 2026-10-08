import { User } from "../../domain/entities/User.js";
import { UserRepository } from "../../domain/repositories/UserRepository.js";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";
import { PasswordHasher } from "../services/PasswordHasher.js";

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  private readonly userRepository: UserRepository;
  private readonly passwordHasher: PasswordHasher;

  constructor(userRepository: UserRepository, passwordHasher: PasswordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute(input: LoginUserInput): Promise<User> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError("El correo es inválido");
    }

    const passwordIsValid = await this.passwordHasher.compare(
      input.password,
      user.getPassword(),
    );

    if (!passwordIsValid) {
      throw new InvalidCredentialsError("La contraseña es inválida");
    }

    return user;
  }
}
