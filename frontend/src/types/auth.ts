export interface AuthUser {
  id: number;
  username: string;
  streak: number;
}

export interface AuthResponse {
  id: number;
  username: string;
  accessToken: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface SigninRequest {
  username: string;
  password: string;
}

export interface AuthError {
  message: string;
}
