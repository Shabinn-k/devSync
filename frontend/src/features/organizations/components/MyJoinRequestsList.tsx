import { useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJoinRequestStore } from '../store/joinRequestStore';

const statusStyles = {
  pending: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  approved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  rejected: 'border-red-500/20 bg-red-500/10 text-red-400',
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

export const MyJoinRequestsList = () => {
  const { myRequests, myLoading, fetchMy, cancel } = useJoinRequestStore();

  useEffect(() => {
    fetchMy();
  }, [fetchMy]);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this join request?')) return;
    try {
      await cancel(id);
      toast.success('Request cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (myLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  if (myRequests.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-medium text-white mb-4">My Requests</h3>
      <div className="space-y-2">
        {myRequests.map((r) => {
          const Icon = statusIcons[r.status];
          return (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="h-4 w-4 text-white/40 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    {r.organization?.name || `Org #${r.organization_id}`}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${statusStyles[r.status]}`}
                >
                  {r.status}
                </span>
                {r.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    title="Cancel request"
                    className="rounded p-1 text-white/30 hover:bg-white/10 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};  