export type UserRole = 'developer' | 'team_lead' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirm_password?: string;
    role: UserRole;  // ✅ Role is required
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