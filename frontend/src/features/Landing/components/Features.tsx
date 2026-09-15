import { Layers, MessageSquare, Users, CheckCircle2, Bell, Lock } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: Layers,
      title: 'Projects',
      desc: 'Organize work into projects with leads, priorities, and timelines. Unlimited for your whole org.',
      code: 'project.create',
    },
    {
      icon: CheckCircle2,
      title: 'Tasks',
      desc: 'Kanban boards that move. Drag, drop, comment, and ship. Every state change is instant.',
      code: 'task.update',
    },
    {
      icon: MessageSquare,
      title: 'Chat',
      desc: 'Org channels, project channels, and DMs. Broadcast over WebSocket — no refresh, ever.',
      code: 'chat.send',
    },
    {
      icon: Users,
      title: 'Teams',
      desc: 'Sub-teams inside orgs with leads and roles. Granular permissions without the config hell.',
      code: 'team.assign',
    },
    {
      icon: Bell,
      title: 'Notifications',
      desc: 'Real-time bell updates when tasks change, invites land, or messages arrive. Zero polling.',
      code: 'notify.emit',
    },
    {
      icon: Lock,
      title: 'Auth',
      desc: 'JWT with refresh tokens, email verification, OTP flows, rate-limited API. Security that ships.',
      code: 'auth.verify',
    },
  ];

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl">
         
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Everything you need.{' '}
            <span className="text-white/30">Nothing you don't.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            DevSync ships with the essentials, engineered to work together.
            No third-party add-ons, no hidden pricing tiers.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-black p-6 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5">
                  <f.icon className="h-4 w-4 text-white/70" />
                </div>
                <span className="font-mono text-[9px] tracking-wider text-white/20 opacity-0 transition-opacity group-hover:opacity-100">
                  {f.code}()
                </span>
              </div>
              <h3 className="mt-5 font-mono text-sm font-medium text-white">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/45">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};