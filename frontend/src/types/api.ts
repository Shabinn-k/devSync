// ============ API Response Types ============

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ============ User Types ============

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ Auth Payload Types ============

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
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

// ============ OTP Types ============

export interface VerifyOTPPayload {
  otp: string;
}

export interface ResetPasswordOTPPayload {
  new_password: string;
}

// ============ Token Types ============

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ============ Auth Response Types ============

export interface AuthResponse {
  user: User;
  token: TokenResponse;
}

export interface MessageResponse {
  message: string;
}