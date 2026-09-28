import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, ArrowLeft, Building2, Compass } from 'lucide-react';
import { useOrganizationStore } from '../store/organizationStore';
import { OrganizationCard } from '../components/OrganizationCard';
import { CreateOrganizationModal } from '../components/CreateOrganizationModel';
import { useAuthStore } from '../../../stores/authStore';
import { useJoinRequestStore } from '../store/joinRequestStore';
import { MyJoinRequestsList } from '../components/MyJoinRequestsList';

const OrganizationsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const {
    organizations,
    browseOrganizations,
    isLoading,
    error,
    fetchMyOrganizations,
    fetchBrowseOrganizations,
  } = useOrganizationStore();
  const { user } = useAuthStore();
  const {  fetchMy } = useJoinRequestStore();

  const canCreate = user?.role_id === 2 || user?.role_id === 3;

  useEffect(() => {
    if (canCreate) fetchMyOrganizations();
    else fetchBrowseOrganizations();
    if (!canCreate) fetchMy();
  }, [canCreate, fetchMyOrganizations, fetchBrowseOrganizations, fetchMy]);

  const displayedOrganizations = canCreate ? organizations : browseOrganizations;

  return (
    <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              New Organization
            </button>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white">
          {canCreate ? 'My Organizations' : 'Browse Organizations'}
        </h1>
        <p className="mt-1 text-sm text-white/40">
          {canCreate
            ? 'Manage your organizations and teams'
            : 'Discover and request to join organizations'}
        </p>

        {/* Developer: my join requests */}
        {!canCreate && (
          <div className="mt-6">
            <MyJoinRequestsList />
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => canCreate ? fetchMyOrganizations() : fetchBrowseOrganizations()}
              className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
            >
              Try Again
            </button>
          </div>
        ) : displayedOrganizations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center mt-6">
            {canCreate ? (
              <>
                <Building2 className="h-12 w-12 text-white/10" />
                <p className="mt-4 text-white/40">No organizations yet</p>
                <p className="text-sm text-white/20">
                  Create your first organization to get started
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
                >
                  Create Organization
                </button>
              </>
            ) : (
              <>
                <Compass className="h-12 w-12 text-white/10" />
                <p className="mt-4 text-white/40">No organizations to browse yet</p>
                <p className="text-sm text-white/20">
                  When organizations are created, they'll appear here
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {displayedOrganizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
            <CreateOrganizationModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => fetchMyOrganizations()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage; 
