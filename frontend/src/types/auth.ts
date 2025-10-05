export interface AuthUser {
  id: number;
  username: string;
  streak: number;
}

export interface AuthResponse {
  user: AuthUser;
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
