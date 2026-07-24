interface AuthDividerProps {
  label: string;
}

export const AuthDivider = ({ label }: AuthDividerProps) => {
  return (
    <div className="relative flex items-center gap-4">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs font-medium uppercase tracking-wider text-white/30">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
};