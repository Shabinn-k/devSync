import { useState, useEffect } from 'react';
import { Loader2, Calendar, TrendingUp, XCircle } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { profileApi } from '../api/profileApi';

interface GitHubContributionsProps {
  githubUsername?: string;
}

interface Contribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}
 
const getContributionColor = (count: number, level: number) => {
  if (count === 0 || level === 0) return 'bg-[#161b22]';
  if (level === 1) return 'bg-[#0e4429]';
  if (level === 2) return 'bg-[#006d32]';
  if (level === 3) return 'bg-[#26a641]';
  return 'bg-[#39d353]';
};

const dayLabels = ['Mon', 'Wed', 'Fri'];

// ✅ Helper to extract just the username from full URL or username
const extractUsername = (input: string): string => {
  if (!input) return '';
  let username = input.replace(/^https?:\/\/github\.com\//, '');
  username = username.replace(/\/$/, '');
  username = username.split('/')[0];
  return username;
};

export const GitHubContributions = ({ githubUsername }: GitHubContributionsProps) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContributions, setTotalContributions] = useState(0);
  
  // ✅ Extract clean username
  const cleanUsername = githubUsername ? extractUsername(githubUsername) : '';

  useEffect(() => {
    const fetchContributions = async () => {
      if (!cleanUsername) {
        setIsLoading(false);
        setError('No GitHub username connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔵 Fetching GitHub contributions via backend API...');
        const res = await profileApi.getGitHubContributions();
        
        const parsed: Contribution[] = (res.contributions || []).map((c) => ({
          date: c.date,
          count: c.count,
          level: Math.min(Math.max(c.level, 0), 4) as 0 | 1 | 2 | 3 | 4,
        }));

        setContributions(parsed.slice(-56));
        setTotalContributions(res.total || 0);
        setError(null);
      } catch (err: any) {
        console.error('GitHub contribution error:', err);
        const msg = err.response?.data?.message || err.message || 'Could not load GitHub contributions';
        setError(msg);
        setContributions([]);
        setTotalContributions(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [cleanUsername]);

  // If no username or error - show clean error state
  if (!cleanUsername || error) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white/5 p-1.5">
              <GithubIcon className="h-4 w-4 text-white/40" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Contributions</h3>
              <p className="text-[10px] text-white/30">Last 56 days</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          {!cleanUsername ? (
            <>
              <div className="rounded-full bg-white/5 p-3 mb-3">
                <GithubIcon className="h-6 w-6 text-white/20" />
              </div>
              <p className="text-sm text-white/30">No GitHub username connected</p>
              <p className="text-xs text-white/20 mt-1">Add your GitHub username in profile settings</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-red-500/10 p-3 mb-3">
                <XCircle className="h-6 w-6 text-red-400/50" />
              </div>
              <p className="text-sm text-white/30">{error}</p>
              <p className="text-xs text-white/20 mt-1">Try again later or check your username</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white/5 p-1.5">
              <GithubIcon className="h-4 w-4 text-white/40" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Contributions</h3>
              <p className="text-[10px] text-white/30">Last 56 days</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-white/30" />
          <span className="ml-2 text-xs text-white/30">Loading contributions...</span>
        </div>
      </div>
    );
  }

  // No contributions
  if (contributions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white/5 p-1.5">
              <GithubIcon className="h-4 w-4 text-white/40" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Contributions</h3>
              <p className="text-[10px] text-white/30">Last 56 days</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-6">
          <Calendar className="h-6 w-6 text-white/20 mb-2" />
          <p className="text-sm text-white/30">No contributions in the last 56 days</p>
        </div>
      </div>
    );
  }

  // Group contributions into weeks
  const weeks: Contribution[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  const averagePerDay = contributions.length > 0 
    ? Math.round(totalContributions / contributions.length) 
    : 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-white/5 p-1.5">
            <GithubIcon className="h-4 w-4 text-white/40" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Contributions</h3>
            <p className="text-[10px] text-white/30">Last 56 days</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/30">{totalContributions} total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-white/20" />
            <span className="text-[10px] text-white/30">{averagePerDay}/day</span>
          </div>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="w-full overflow-x-auto">
        <div className="flex gap-1.5">
          {/* Day labels */}
          <div className="flex flex-col gap-1.5 pr-1.5 pt-1.5">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[18px] w-4 text-[8px] text-white/20 flex items-center">
                {label}
              </div>
            ))}
          </div>
          
          {/* Contribution weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1.5">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`h-[18px] w-[18px] rounded-sm ${getContributionColor(day.count, day.level)} transition-all hover:scale-110 hover:ring-1 hover:ring-white/30 cursor-default`}
                  title={`${day.count} contributions on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/20">Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-[#161b22]" />
            <div className="h-3 w-3 rounded-sm bg-[#0e4429]" />
            <div className="h-3 w-3 rounded-sm bg-[#006d32]" />
            <div className="h-3 w-3 rounded-sm bg-[#26a641]" />
            <div className="h-3 w-3 rounded-sm bg-[#39d353]" />
          </div>
          <span className="text-[9px] text-white/20">More</span>
        </div>
        <a
          href={`https://github.com/${cleanUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-white/20 hover:text-white/50 transition-colors flex items-center gap-1"
        >
          View on GitHub
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};