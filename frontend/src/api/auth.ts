import type { AuthResponse, SigninRequest, SignupRequest } from "../types/auth";

const API_BASE_URL = "http://localhost:3000"; // Adjust based on your backend URL

class AuthService {
  // Token management
  private static TOKEN_KEY = "auth_token";
  private static USER_KEY = "auth_user";

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from localStorage:", error);
      return null;
    }
  }

  static getUser(): { id: number; username: string } | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
      return null;
    }
  }

  static setAuthData(response: AuthResponse): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, response.accessToken);
      localStorage.setItem(
        this.USER_KEY,
        JSON.stringify({
          id: response.id,
          username: response.username,
        })
      );
    } catch (error) {
      console.error("Error saving auth data to localStorage:", error);
    }
  }

  static clearAuthData(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error("Error clearing auth data from localStorage:", error);
    }
  }

  // JWT token validation
  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT structure check
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp ? payload.exp > currentTime : true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }

  // API calls
  static async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    const result = await response.json();
    this.setAuthData(result);
    return result;
  }

  static async signin(data: SigninRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signin failed");
    }

    const result = await response.json();
    this.setAuthData(result);
    return result;
  }

  static logout(): void {
    this.clearAuthData();
  }

  // Helper to get authorization header
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Check if user is authenticated with token validation
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && this.isTokenValid());
  }
}

export default AuthService;
