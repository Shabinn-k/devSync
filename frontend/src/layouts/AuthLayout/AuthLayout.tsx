import { type ReactNode } from 'react';

interface AuthLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export const AuthLayout = ({ leftContent, rightContent }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-black">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16 xl:py-16">
        {leftContent}
      </div>
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          {rightContent}
        </div>
      </div>
    </div>
  );
};