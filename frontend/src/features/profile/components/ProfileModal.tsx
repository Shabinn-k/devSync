import type { ReactNode } from 'react';

interface ProfileModalProps {
  children: ReactNode;
  onClose: () => void;
}

export const ProfileModal = ({ children, onClose }: ProfileModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/95 p-6">
        {children}
      </div>
    </div>
  );
};