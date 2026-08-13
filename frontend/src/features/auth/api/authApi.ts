import { apiClient } from '../../../lib/axios';
import type { 
  ApiResponse, 
  AuthResponse, 
  MessageResponse,
  LoginPayload, 
  RegisterPayload, 
  VerifyEmailPayload,
  ResendOTPPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  LogoutPayload,
  TokenResponse,
  User,
  VerifyOTPPayload
} from '../../../types/api';

export const authApi = {
  
  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then(res => res.data),

  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data).then(res => res.data),

  verifyEmail: (data: VerifyEmailPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/verify-email', data).then(res => res.data),

  resendOTP: (data: ResendOTPPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/resend-otp', data).then(res => res.data),


  forgotPassword: (data: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/forgot-password', data).then(res => res.data),

  verifyOTP: (data: VerifyOTPPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/verify-otp', data).then(res => res.data),

  resetPassword: (data: ResetPasswordPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/reset-password', data).then(res => res.data),

  refreshToken: (data: RefreshTokenPayload) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh-token', data).then(res => res.data),

  logout: (data: LogoutPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/logout', data).then(res => res.data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then(res => res.data),
};