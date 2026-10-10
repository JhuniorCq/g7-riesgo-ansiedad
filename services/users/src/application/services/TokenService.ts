export interface TokenService {
  generateAccessToken(userId: number): string;
  verifyAccessToken(token: string): {
    userId: number;
  };
}
