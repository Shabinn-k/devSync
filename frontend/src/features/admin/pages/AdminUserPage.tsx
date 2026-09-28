import { useEffect, useState } from 'react';
import {
  Search, Loader2, Shield, ShieldCheck, ShieldAlert,
  Trash2, UserX, UserCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminStore } from '../store/adminStore';
import { extractApiError } from '../api/adminApi';
import { useAuthStore } from '../../../stores/authStore';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { AdminUser } from '../types/admin';

const roleLabels: Record<number, string> = {
  1: 'Developer',
  2: 'Team Lead',
  3: 'Admin',
};

const roleColors: Record<number, string> = {
  1: 'text-blue-700 border-blue-200 bg-blue-50',
  2: 'text-amber-700 border-amber-200 bg-amber-50',
  3: 'text-purple-700 border-purple-200 bg-purple-50',
};

const RoleIcon = ({ roleId }: { roleId: number }) => {
  if (roleId === 3) return <ShieldAlert className="h-3 w-3" />;
  if (roleId === 2) return <ShieldCheck className="h-3 w-3" />;
  return <Shield className="h-3 w-3" />;
};

export const AdminUsersPage = () => {
  const { user: me } = useAuthStore();
  const {
    users, usersPagination, usersLoading, usersFilters,
    fetchUsers, setUsersFilters, updateUserRole, updateUserStatus,deleteUser,
  } = useAdminStore();

  const [searchInput, setSearchInput] = useState(usersFilters.search);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers(); 
  }, []);
 
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== usersFilters.search) {
        setUsersFilters({ search: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(t); 
  }, [searchInput]);

  const handleRoleChange = async (u: AdminUser, newRoleId: number) => {
    if (u.role_id === newRoleId) return;
    setBusyId(u.id);
    try {
      await updateUserRole(u.id, newRoleId);
      toast.success(`${u.name} is now ${roleLabels[newRoleId]}`);
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to update role'));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (u: AdminUser) => {
    if (u.is_active) {
      setConfirmDeactivate(u);
      return;
    }
    setBusyId(u.id);
    try {
      await updateUserStatus(u.id, true);
      toast.success(`${u.name} reactivated`);
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to reactivate'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeactivateNow = async () => {
    if (!confirmDeactivate) return;
    setBusyId(confirmDeactivate.id);
    try {
      await updateUserStatus(confirmDeactivate.id, false);
      toast.success(`${confirmDeactivate.name} deactivated`);
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to deactivate'));
    } finally {
      setBusyId(null);
      setConfirmDeactivate(null);
    }
  };

 

  const confirmDeleteNow = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await deleteUser(confirmDelete.id);
      toast.success(`${confirmDelete.name} deleted`);
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to delete'));
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Users</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {usersPagination?.total_items ?? 0} total users
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 shadow-sm"
          />
        </div>

        <select
          value={usersFilters.role_id ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setUsersFilters({ role_id: v ? Number(v) : undefined, page: 1 });
          }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 shadow-sm"
        >
          <option value="">All roles</option>
          <option value="1">Developers</option>
          <option value="2">Team Leads</option>
          <option value="3">Admins</option>
        </select>

        <select
          value={
            usersFilters.is_active === undefined
              ? ''
              : usersFilters.is_active
                ? 'true'
                : 'false'
          }
          onChange={(e) => {
            const v = e.target.value;
            setUsersFilters({
              is_active: v === '' ? undefined : v === 'true',
              page: 1,
            });
          }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 shadow-sm"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {usersLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-left text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-400">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isSelf = me?.id === u.id;
                const busy = busyId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700">
                          {u.name[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{u.name}</p>
                          <p className="text-xs text-neutral-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${roleColors[u.role_id]}`}
                        >
                          <RoleIcon roleId={u.role_id} />
                          {roleLabels[u.role_id]}
                        </span>
                      ) : (
                        <select
                          value={u.role_id}
                          onChange={(e) => handleRoleChange(u, Number(e.target.value))}
                          disabled={busy}
                          className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-50"
                        >
                          <option value={1}>Developer</option>
                          <option value={2}>Team Lead</option>
                          <option value={3}>Admin</option>
                        </select>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {/* Fixed active badge logic so active users show Active in emerald */}
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleDateString()
                        : 'Never'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={busy || isSelf}
                          title={isSelf ? 'Cannot change own status' : u.is_active ? 'Deactivate' : 'Reactivate'}
                          className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>
                         
                        <button
                          onClick={() => setConfirmDelete(u)}
                          disabled={busy || isSelf}
                          title={isSelf ? 'Cannot delete self' : 'Delete'}
                          className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {usersPagination && usersPagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
            <span>
              Page {usersPagination.page} of {usersPagination.total_pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUsersFilters({ page: Math.max(1, usersPagination.page - 1) })}
                disabled={usersPagination.page <= 1}
                className="rounded border border-neutral-200 p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setUsersFilters({ page: Math.min(usersPagination.total_pages, usersPagination.page + 1) })
                }
                disabled={usersPagination.page >= usersPagination.total_pages}
                className="rounded border border-neutral-200 p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        title="Deactivate user?"
        message={`${confirmDeactivate?.name} will no longer be able to log in.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={confirmDeactivateNow}
        onCancel={() => setConfirmDeactivate(null)}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete user?"
        message={`${confirmDelete?.name} will be permanently deactivated. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};  