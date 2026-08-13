import { FolderKanban, ArrowUpRight } from 'lucide-react';

export interface WorkspaceProject {
  id: string;
  name: string;
  description?: string;
  role: string;
  status: 'active' | 'archived';
  lastActivityAt?: string;
}

interface ProfileWorkspaceProps {
  projects?: WorkspaceProject[];
  isLoading?: boolean;
}

export const ProfileWorkspace = ({ projects, isLoading }: ProfileWorkspaceProps) => {
  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/60">Your Projects</h3>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/5" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/15 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-white">{project.name}</p>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-white/50" />
              </div>
              {project.description && (
                <p className="mt-1 line-clamp-1 text-xs text-white/40">{project.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/50">
                  {project.role}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    project.status === 'active'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
          <FolderKanban className="mx-auto h-5 w-5 text-white/20" />
          <p className="mt-2 text-sm text-white/40">No projects yet</p>
          <p className="mt-0.5 text-xs text-white/25">
            Projects you're a member of will appear here.
          </p>
        </div>
      )}
    </section>
  );
};
