export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendOTPPayload {
  email: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  token: TokenResponse;
}

export interface MessageResponse {
  message: string;
}