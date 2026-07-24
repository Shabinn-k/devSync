import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  label: string;
  type: 'email' | 'password' | 'text';
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const AuthInput = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  showPassword = false,
  onTogglePassword,
}: AuthInputProps) => {
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/20 transition-colors duration-200 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 ${
            error ? 'border-red-500' : 'border-white/10'
          }`}
        />
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};