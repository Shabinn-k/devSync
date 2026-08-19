import { useEffect, useState } from 'react';
import {
  Search, Loader2, Building2, Trash2, PowerOff, Power,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminStore } from '../store/adminStore';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { AdminOrganization } from '../types/admin';

export const AdminOrganizationsPage = () => {
  const {
    orgs, orgsPagination, orgsLoading, orgsFilters,
    fetchOrgs, setOrgsFilters, updateOrgStatus, deleteOrg,
  } = useAdminStore();

  const [searchInput, setSearchInput] = useState(orgsFilters.search);
  const [confirmDeactivate, setConfirmDeactivate] = useState<AdminOrganization | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminOrganization | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => { fetchOrgs(); }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== orgsFilters.search) {
        setOrgsFilters({ search: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleToggle = async (o: AdminOrganization) => {
    if (o.is_active) { setConfirmDeactivate(o); return; }
    setBusyId(o.id);
    try {
      await updateOrgStatus(o.id, true);
      toast.success(`${o.name} reactivated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setBusyId(null); }
  };

  const confirmDeactivateNow = async () => {
    if (!confirmDeactivate) return;
    setBusyId(confirmDeactivate.id);
    try {
      await updateOrgStatus(confirmDeactivate.id, false);
      toast.success(`${confirmDeactivate.name} deactivated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setBusyId(null); setConfirmDeactivate(null); }
  };

  const confirmDeleteNow = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await deleteOrg(confirmDelete.id);
      toast.success(`${confirmDelete.name} deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setBusyId(null); setConfirmDelete(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Organizations</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {orgsPagination?.total_items ?? 0} total organizations
          </p>
        </div>
      </div>
 
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
          />
        </div>

        <select
          value={orgsFilters.is_active === undefined ? '' : orgsFilters.is_active ? 'true' : 'false'}
          onChange={(e) => {
            const v = e.target.value;
            setOrgsFilters({ is_active: v === '' ? undefined : v === 'true', page: 1 });
          }}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
 
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {orgsLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-neutral-500">
                <th className="px-5 py-3 font-medium">Organization</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Members</th>
                <th className="px-5 py-3 font-medium">Teams</th>
                <th className="px-5 py-3 font-medium">Projects</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Building2 className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                    <p className="text-sm font-medium text-neutral-900">No organizations found</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Try adjusting your filters or search.
                    </p>
                  </td>
                </tr>
              )}
              {orgs.map((o) => {
                const busy = busyId === o.id;
                return (
                  <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                          <Building2 className="h-4 w-4 text-neutral-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{o.name}</p>
                          <p className="text-xs text-neutral-500">{o.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-neutral-800">{o.owner_name || '—'}</p>
                      <p className="text-xs text-neutral-500">{o.owner_email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-neutral-800">{o.member_count}</td>
                    <td className="px-5 py-3 text-sm text-neutral-800">{o.team_count}</td>
                    <td className="px-5 py-3 text-sm text-neutral-800">{o.project_count}</td>
                    <td className="px-5 py-3">
                      {o.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(o)}
                          disabled={busy}
                          title={o.is_active ? 'Deactivate' : 'Reactivate'}
                          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
                        >
                          {o.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(o)}
                          disabled={busy}
                          title="Delete"
                          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {orgsPagination && orgsPagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-5 py-3 text-xs text-neutral-500">
            <span>
              Page {orgsPagination.page} of {orgsPagination.total_pages} · {orgsPagination.total_items} total
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOrgsFilters({ page: Math.max(1, orgsPagination.page - 1) })}
                disabled={orgsPagination.page <= 1}
                className="rounded-md p-1.5 transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOrgsFilters({ page: Math.min(orgsPagination.total_pages, orgsPagination.page + 1) })}
                disabled={orgsPagination.page >= orgsPagination.total_pages}
                className="rounded-md p-1.5 transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        title="Deactivate organization?"
        message={`${confirmDeactivate?.name} will be hidden from members.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={confirmDeactivateNow}
        onCancel={() => setConfirmDeactivate(null)}
      />
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete organization?"
        message={`${confirmDelete?.name} will be permanently deactivated.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};