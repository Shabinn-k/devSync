import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Edit3,
  Key,
  Globe,
  FolderKanban,
  CheckSquare,
  Users,
  Award,
  Clock,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { useProfileStore } from '../store/profileStore';
import { EditProfileForm } from '../components/EditProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '../components/SocialIcons';

const ProfilePage = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { profile, isLoading, error, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  // Mock contribution data - 7 columns x 8 rows
  const contributions = Array.from({ length: 56 }, (_, i) => ({
    count: Math.floor(Math.random() * 8),
    day: i,
  }));

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 2) return 'bg-emerald-500/25';
    if (count <= 4) return 'bg-emerald-500/50';
    if (count <= 6) return 'bg-emerald-500/70';
    return 'bg-emerald-500/90';
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <p className="text-red-400">{error || 'Failed to load profile'}</p>
        <button onClick={() => fetchProfile()} className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <button onClick={() => navigate('/dashboard')} className="group mb-6 flex items-center gap-2 text-sm text-white/30 transition-all hover:text-white/70">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="relative rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.08] p-6 backdrop-blur-xl sm:p-8">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full ring-4 ring-white/10 overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/40">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5 ring-2 ring-[#0a0a0a]">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{profile.name}</h1>
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-white/40 sm:justify-start">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{profile.email}</span>
                {profile.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{profile.location}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>

              {profile.bio && <p className="mt-3 text-sm text-white/50 max-w-2xl">{profile.bio}</p>}

              {/* Social Links */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profile.github_username && (
                  <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white">
                    <GithubIcon className="h-4 w-4" /> {profile.github_username}
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white">
                    <Globe className="h-4 w-4" /> Portfolio
                  </a>
                )}
                {profile.social_links && Object.entries(profile.social_links).slice(0, 2).map(([platform, url]) => {
                  const icons: Record<string, any> = { 
                    github: GithubIcon, 
                    linkedin: LinkedinIcon, 
                    twitter: TwitterIcon 
                  };
                  const Icon = icons[platform.toLowerCase()] || Globe;
                  return (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 p-2 text-white/30 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white">
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <button onClick={() => setShowEdit(true)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90 hover:scale-[1.02]">
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
                <button onClick={() => setShowPassword(true)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-1.5 text-sm font-medium text-white/50 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white">
                  <Key className="h-4 w-4" /> Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-4 text-center hover:border-white/10 transition-all">
            <FolderKanban className="mx-auto h-5 w-5 text-white/20" />
            <p className="mt-2 text-xl font-bold text-white">12</p>
            <p className="text-xs text-white/30">Projects</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-4 text-center hover:border-white/10 transition-all">
            <CheckSquare className="mx-auto h-5 w-5 text-white/20" />
            <p className="mt-2 text-xl font-bold text-white">48</p>
            <p className="text-xs text-white/30">Tasks</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-4 text-center hover:border-white/10 transition-all">
            <Users className="mx-auto h-5 w-5 text-white/20" />
            <p className="mt-2 text-xl font-bold text-white">4</p>
            <p className="text-xs text-white/30">Teams</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-4 text-center hover:border-white/10 transition-all">
            <Award className="mx-auto h-5 w-5 text-white/20" />
            <p className="mt-2 text-xl font-bold text-white">32</p>
            <p className="text-xs text-white/30">Completed</p>
          </div>
        </div>

        {/* Contributions & Skills */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Contribution Graph */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GithubIcon className="h-5 w-5 text-white/30" />
                <h3 className="text-sm font-medium text-white/60">Contribution Graph</h3>
              </div>
              <span className="text-xs text-white/20">Last 56 days</span>
            </div>
            {/* ✅ Bigger contribution grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {contributions.map((day, index) => (
                <div 
                  key={index} 
                  className={`aspect-square w-full rounded-sm ${getContributionColor(day.count)} transition-all hover:scale-110 hover:ring-1 hover:ring-white/20`} 
                  title={`${day.count} contributions`} 
                  style={{ minWidth: '12px', minHeight: '12px' }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <span className="text-xs text-white/20">Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-sm bg-white/5" />
                <div className="h-3 w-3 rounded-sm bg-emerald-500/25" />
                <div className="h-3 w-3 rounded-sm bg-emerald-500/50" />
                <div className="h-3 w-3 rounded-sm bg-emerald-500/70" />
                <div className="h-3 w-3 rounded-sm bg-emerald-500/90" />
              </div>
              <span className="text-xs text-white/20">More</span>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h3 className="text-sm font-medium text-white/60 mb-4">Skills</h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-white/30" />
              <h3 className="text-sm font-medium text-white/60">Recent Activity</h3>
            </div>
            <button className="text-xs text-white/20 hover:text-white/40 transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white/20" /></div>
              <span>You completed <span className="text-white/60">Design system updates</span></span>
              <span className="ml-auto text-xs text-white/20">2h ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center"><FolderKanban className="h-4 w-4 text-white/20" /></div>
              <span>You created <span className="text-white/60">Mobile App Redesign</span></span>
              <span className="ml-auto text-xs text-white/20">4h ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center"><UserPlus className="h-4 w-4 text-white/20" /></div>
              <span>You joined <span className="text-white/60">API Integration</span></span>
              <span className="ml-auto text-xs text-white/20">6h ago</span>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 scrollbar-thin scrollbar-thumb-white/10">
              <EditProfileForm onClose={() => setShowEdit(false)} />
            </div>
          </div>
        )}

        {showPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
              <ChangePasswordForm onClose={() => setShowPassword(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;