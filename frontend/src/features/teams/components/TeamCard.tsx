import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Crown, Shield } from 'lucide-react';
import type { Team } from '../types/team';

interface TeamCardProps {
    team: Team;
}

export const TeamCard = ({ team }: TeamCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Link
                to={`/teams/${team.id}`}
                className="block rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:border-white/15 hover:bg-white/10"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">{team.name}</h3>
                        {team.description && (
                            <p className="mt-1 text-xs text-white/50 line-clamp-2">
                                {team.description}
                            </p>
                        )}
                    </div>
                    <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
                        <Shield className="h-3 w-3" />
                        Team
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-white/40">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{team.member_count} member{team.member_count === 1 ? '' : 's'}</span>
                    </div>

                    {team.lead && (
                        <div className="flex items-center gap-1 text-white/60">
                            <Crown className="h-3 w-3 text-yellow-400" />
                            <span>{team.lead.name}</span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};
