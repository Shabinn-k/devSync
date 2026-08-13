import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const sizeMap = {
  sm: 'h-12 w-12 text-sm',
  md: 'h-16 w-16 text-base',
  lg: 'h-24 w-24 text-2xl',
  xl: 'h-32 w-32 text-3xl',
};

export const ProfileAvatar = ({ size = 'lg', editable = false }: ProfileAvatarProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, uploadAvatar } = useProfileStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, WEBP, or GIF image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      setImageError(false);
      console.log('Avatar uploaded:', avatarUrl);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setUploadError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return profile.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getAvatarUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const cleanBase = backendBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="relative group">
      <div
        className={`relative ${sizeMap[size]} rounded-full ring-4 ring-white/10 overflow-hidden bg-gradient-to-br from-white/10 to-white/5 transition-all duration-200 group-hover:ring-white/20`}
      >
        {profile?.avatar_url && !imageError ? (
          <img
            src={getAvatarUrl(profile.avatar_url)}
            alt={profile.name || 'User Avatar'}
            className="h-full w-full object-cover transition-all duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/60">
            {getInitials()}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {editable && !isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {editable && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 text-black shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}

      {uploadError && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-red-500/90 px-3 py-1 text-xs text-white">
          {uploadError}
        </div>
      )}
    </div>
  );
};