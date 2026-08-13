import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type = 'text', className = '', id, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const resolvedType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/60"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={resolvedType}
            autoComplete={isPassword ? 'current-password' : 'email'}  
            className={`w-full rounded-full border bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors duration-200 focus:border-white/40 ${
              error ? 'border-red-500/60' : 'border-white/15'
            } ${isPassword ? 'pr-12' : ''} ${className}`}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-200 hover:text-white/80"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';