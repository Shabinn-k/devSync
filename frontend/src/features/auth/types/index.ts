import type { UserRole, User } from '../../../types/api';
export type { UserRole, User };
export type SignupRole = 'developer' | 'team_lead';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    role?: SignupRole;
}

export interface AuthResponse {
    user: User;
    token?: {
        access_token: string;
        refresh_token: string;
        token_type?: string;
        expires_in?: number;
    };
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    message?: string;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    new_password: string;
    confirm_password?: string;
}
