import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Users, Shield, Check, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import type { UserRole } from '../types';

interface RoleOption {
    id: UserRole;
    title: string;
    description: string;
    icon: any;
    color: string;
    benefits: string[];
}

const roles: RoleOption[] = [
    {
        id: 'team_lead',
        title: 'Team Lead',
        description: 'Create and manage projects, assign tasks, lead your team',
        icon: Users,
        color: 'from-blue-500 to-indigo-600',
        benefits: [
            'Create organizations & projects',
            'Assign tasks to team members',
            'Manage team members',
            'View team analytics'
        ]
    },
    {
        id: 'developer',
        title: 'Developer',
        description: 'Work on tasks, collaborate with your team, track progress',
        icon: Code,
        color: 'from-green-500 to-emerald-600',
        benefits: [
            'Work on assigned tasks',
            'Update task status',
            'Collaborate with team',
            'Track your progress'
        ]
    },
];

export const RoleSelectionPage = () => {
    const navigate = useNavigate();
    const { setSelectedRole, selectedRole } = useAuthStore();
    const [selected, setSelected] = useState<UserRole | null>(selectedRole);

    const handleSelect = (role: UserRole) => {
        setSelected(role);
        setSelectedRole(role);
    };

    const handleContinue = () => {
        if (selected) {
            navigate('/register');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="flex justify-center mb-4">
                        <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4">
                            <Shield className="h-12 w-12 text-white/60" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Choose Your Role</h1>
                    <p className="mt-2 text-white/40 max-w-md mx-auto">
                        Select how you'll use DevSync. You can always change this later.
                    </p>
                </motion.div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role, index) => {
                        const Icon = role.icon;
                        const isSelected = selected === role.id;

                        return (
                            <motion.button
                                key={role.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleSelect(role.id)}
                                className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                                    isSelected
                                        ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                {/* Selection indicator */}
                                {isSelected && (
                                    <div className="absolute right-4 top-4">
                                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                                            <Check className="h-4 w-4 text-black" />
                                        </div>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`inline-flex rounded-xl bg-gradient-to-r p-3 ${role.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>

                                {/* Title & Description */}
                                <h3 className="mt-4 text-lg font-semibold text-white">{role.title}</h3>
                                <p className="mt-1 text-sm text-white/40">{role.description}</p>

                                {/* Benefits */}
                                <div className="mt-4 space-y-1.5">
                                    {role.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-white/30">
                                            <div className="h-1 w-1 rounded-full bg-white/20" />
                                            {benefit}
                                        </div>
                                    ))}
                                </div>

                                {/* Hover effect */}
                                {!isSelected && (
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Continue Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                >
                    <button
                        onClick={handleContinue}
                        disabled={!selected}
                        className={`w-full rounded-lg py-3.5 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 ${
                            selected
                                ? 'bg-white text-black hover:bg-white/90'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="mt-4 text-center text-xs text-white/20">
                        You can change your role later in settings
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;