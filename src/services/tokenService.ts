import { jwtDecode } from "jwt-decode";


class TokenService {
  private readonly TOKEN_KEY = "access_token";

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  } 

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUserId(): number {
    try {
      const token = this.getToken();
      if (!token) return 0;

      const decoded: { userId?: string } = jwtDecode(token);
      return decoded.userId ? parseInt(decoded.userId) : 0;
    } catch (error) {
      console.error("Error decoding token:", error);
      return 0;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: { exp?: number } = jwtDecode(token);
      if (!decoded.exp) return true;

      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }
}

export default new TokenService();
