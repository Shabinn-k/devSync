// src/features/auth/components/AuthDivider.tsx
interface AuthDividerProps {
  label?: string;
}

export const AuthDivider = ({ label = 'Or continue with' }: AuthDividerProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-white/10" />
      <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
};