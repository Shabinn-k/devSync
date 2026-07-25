import type { ReactNode } from 'react';

interface AuthLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export const AuthLayout = ({ leftContent, rightContent }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-black">
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%]">
        {leftContent}
      </div>
      <div className="flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2 xl:w-[45%]">
        <div className="w-full max-w-md">{rightContent}</div>
      </div>
    </div>
  );
};