import jwt from "jsonwebtoken";
import { TokenService } from "../../application/services/TokenService.js";
import { JWT_SECRET } from "../../config/config.js";

export class JwtTokenServices implements TokenService {
  generateAccessToken(userId: number): string {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }

    return jwt.sign(
      {
        userId,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
  }

  verifyAccessToken(token: string): { userId: number } {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "number"
    ) {
      throw new Error("Token inválido");
    }

    return {
      userId: payload.userId,
    };
  }
}
