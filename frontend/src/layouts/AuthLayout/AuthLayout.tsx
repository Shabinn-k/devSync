import type { ReactNode } from 'react';

interface AuthLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export const AuthLayout = ({ leftContent, rightContent }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-black overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] overflow-hidden">
        {leftContent}
      </div>
      <div className="flex w-full items-center justify-center px-4 py-4 sm:px-6 lg:w-1/2 xl:w-[45%] overflow-hidden">
        <div className="w-full max-w-md">{rightContent}</div>
      </div>
    </div>
  );
};