import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useOrganizationStore } from '../../organizations/store/organizationStore';
import { useTeamStore } from '../../teams/store/teamStore';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
type Priority = typeof PRIORITIES[number];

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { createProject, isSaving } = useProjectStore();
  const { organizations, fetchMyOrganizations, isLoading: orgsLoading } = useOrganizationStore();
  const { teams, fetchByOrganization, isLoading: teamsLoading } = useTeamStore();

  const [form, setForm] = useState({
    organization_id: 0,
    team_id: 0,
    name: '',
    description: '',
    priority: 'medium' as Priority,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchMyOrganizations();
  }, [fetchMyOrganizations]);

  useEffect(() => {
    if (!form.organization_id && organizations.length > 0) {
      setForm((f) => ({ ...f, organization_id: organizations[0].id }));
    }
  }, [organizations, form.organization_id]);

  useEffect(() => {
    if (form.organization_id) {
      fetchByOrganization(form.organization_id);
      setForm((f) => ({ ...f, team_id: 0 }));
    }
  }, [form.organization_id, fetchByOrganization]);

  useEffect(() => {
    if (!form.team_id && teams.length > 0) {
      setForm((f) => ({ ...f, team_id: teams[0].id }));
    }
  }, [teams, form.team_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.organization_id) return toast.error('Select an organization');
    if (!form.team_id) return toast.error('Select a team');
    if (form.name.trim().length < 3) return toast.error('Name must be at least 3 characters');
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      return toast.error('End date must be after start date');
    }

   try {
  const project = await createProject({
    organization_id: form.organization_id,
    team_id: form.team_id || undefined,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    priority: form.priority,
    start_date: form.start_date ? `${form.start_date}T00:00:00Z` : null,
    end_date: form.end_date ? `${form.end_date}T23:59:59Z` : null,
  });
      toast.success('Project created');
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to create project');
    }
  };

  const selectClass =
    'w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none disabled:opacity-50';

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate('/projects')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </button>

        <div className="rounded-2xl border border-white/10 bg-black p-8">
          <h1 className="text-xl font-semibold text-white">Create Project</h1>
          <p className="mt-1 text-sm text-white/40">Set up a new workspace for your team</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Organization */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                Organization
              </label>
              <select
                value={form.organization_id}
                onChange={(e) => setForm({ ...form, organization_id: Number(e.target.value) })}
                disabled={orgsLoading}
                className={selectClass}
              >
                <option value={0} disabled>Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                Team
              </label>
              <select
                value={form.team_id}
                onChange={(e) => setForm({ ...form, team_id: Number(e.target.value) })}
                disabled={teamsLoading || !form.organization_id}
                className={selectClass}
              >
                <option value={0} disabled>
                  {teamsLoading ? 'Loading teams...' : 'Select team'}
                </option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              {!teamsLoading && form.organization_id > 0 && teams.length === 0 && (
                <p className="mt-2 text-xs text-yellow-400/70">
                  This organization has no teams yet.{' '}
                  <button
                    type="button"
                    onClick={() => navigate(`/organizations/${form.organization_id}?tab=teams`)}
                    className="underline hover:text-yellow-300"
                  >
                    Create one first
                  </button>
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mobile App Redesign"
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is this project about?"
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`rounded-lg border px-3 py-2.5 text-xs capitalize transition-all ${
                      form.priority === p
                        ? 'border-white/30 bg-white/5 text-white'
                        : 'border-white/10 bg-black text-white/40 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                disabled={isSaving}
                className="rounded-lg border border-white/10 bg-black px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg border border-white/10 bg-black px-5 py-2.5 text-sm text-white transition-colors hover:bg-green-600 hover:border-green-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;