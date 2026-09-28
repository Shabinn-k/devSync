import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Loader2, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJoinRequestStore } from '../store/joinRequestStore';

export const JoinRequestsPage = () => {
  const { organizeId } = useParams<{ organizeId: string }>();
  const navigate = useNavigate();
  const { orgRequests, orgLoading, fetchForOrg, review } = useJoinRequestStore();
  const [busyId, setBusyId] = useState<number | null>(null);
  const orgId = Number(organizeId);

  useEffect(() => {
    if (orgId) fetchForOrg(orgId, 'pending');
  }, [orgId, fetchForOrg]);

  const handle = async (reqId: number, status: 'approved' | 'rejected') => {
    setBusyId(reqId);
    try {
      await review(orgId, reqId, status);
      toast.success(`Request ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/organizations/${organizeId}`)}
          className="mb-6 flex items-center gap-2 text-sm text-white/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Organization
        </button>

        <h1 className="text-3xl font-semibold mb-2">Join Requests</h1>
        <p className="text-white/40 mb-8">
          Approve or reject developers who want to join this organization.
        </p>

        {orgLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : orgRequests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <Inbox className="mx-auto h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/60">No pending requests.</p>
            <p className="text-xs text-white/30 mt-1">
              New requests will appear here when developers ask to join.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orgRequests.map((r) => {
              const busy = busyId === r.id;
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
                        {r.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {r.user?.name || `User #${r.user_id}`}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {r.user?.email}
                        </p>
                      </div>
                    </div>
                    {r.message && (
                      <p className="mt-3 text-sm text-white/70 italic border-l-2 border-white/10 pl-3">
                        "{r.message}"
                      </p>
                    )}
                    <p className="mt-3 text-xs text-white/30">
                      Requested {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handle(r.id, 'approved')}
                      disabled={busy}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handle(r.id, 'rejected')}
                      disabled={busy}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestsPage;