interface LogoProps {
  className?: string;
}

export const Logo = ({ className = '' }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="h-6 w-6 rounded-[4px] border-2 border-white" />
      <span className="text-base font-bold tracking-[0.08em] text-white">
        DEVSYNC
      </span>
    </div>
  );
};