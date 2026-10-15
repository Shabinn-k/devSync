import axios from 'axios';

type ErrorPayload = {
  message?: unknown;
  errors?: unknown;
};

const AUTH_MESSAGES: Array<[string, string]> = [
  ['invalid credentials', 'Invalid email or password.'],
  ['email not verified', "Your email isn't verified yet. Verify your email or request a new verification code."],
  ['email already registered', 'An account with this email already exists. Try signing in or verifying your email.'],
  ['invalid or expired otp', 'This verification code is invalid or has expired. Request a new code.'],
  ['otp expired or not found', 'This verification code is invalid or has expired. Request a new code.'],
  ['invalid otp', 'This verification code is invalid or has expired. Request a new code.'],
  ['too many attempts', 'Too many attempts. Request a new verification code and try again.'],
  ['please wait before requesting another otp', 'Please wait a little before requesting another code.'],
  ['account deactivated', 'This account is unavailable. Contact support for help.'],
  ['password must be at least 8 characters', 'Password must be at least 8 characters.'],
  ['passwords do not match', 'Passwords do not match.'],
  ['password validation failed', 'Your password does not meet the requirements.'],
  ['validation failed', 'Check the highlighted fields and try again.'],
];

function safeBackendMessage(message: unknown): string | null {
  if (typeof message !== 'string') return null;
  const normalized = message.toLowerCase().trim();
  return AUTH_MESSAGES.find(([known]) => normalized.includes(known))?.[1] ?? null;
}

function validationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null;
  const entries = Object.entries(errors as Record<string, unknown>);
  const details = entries.flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    return messages.map((item) => {
      const safe = safeBackendMessage(item);
      if (safe) return safe;
      if (typeof item !== 'string') return null;
      const text = item.toLowerCase();
      if (field === 'password' && text.includes('8')) return 'Password must be at least 8 characters.';
      if (field === 'password' && text.includes('uppercase')) return 'Password must include an uppercase letter, a lowercase letter, and a number.';
      if (field === 'confirm_password' && text.includes('match')) return 'Passwords do not match.';
      if (field === 'email' && (text.includes('valid') || text.includes('required'))) return 'Enter a valid email address.';
      const lengthRequirement = text.match(/must be at least (\d+) characters/);
      if (lengthRequirement) return `${field.replaceAll('_', ' ')} must be at least ${lengthRequirement[1]} characters.`;
      if (text.includes('required')) return `Please enter your ${field.replaceAll('_', ' ')}.`;
      return null;
    });
  }).filter((item): item is string => Boolean(item));
  return details.length ? [...new Set(details)].join(' ') : null;
}

export function getUserFriendlyError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!axios.isAxiosError<ErrorPayload>(error)) {
    if (error instanceof Error) return safeBackendMessage(error.message) ?? fallback;
    return fallback;
  }

  const status = error.response?.status;
  const payload = error.response?.data;
  const validation = validationMessage(payload?.errors);
  if (validation) return validation;
  const backend = safeBackendMessage(payload?.message);
  if (backend) return backend;

  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'The request took too long. Please try again.';
    return "We're unable to connect right now. Please check your connection and try again.";
  }
  if (status === 400 || status === 422) return 'Check the information you entered and try again.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find what you requested.";
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status !== undefined && status >= 500) return "We're unable to connect right now. Please try again shortly.";
  return fallback;
}

export function normalizeApiError(error: unknown): unknown {
  if (!axios.isAxiosError(error)) return error;
  const friendly = getUserFriendlyError(error);
  if (import.meta.env.DEV) console.error('API request failed', error);
  error.message = friendly;
  return error;
}
