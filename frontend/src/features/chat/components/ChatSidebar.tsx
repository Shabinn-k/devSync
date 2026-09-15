import React, { useState, useEffect } from 'react';
import type { ChatChannel } from '../types/chat';
import { Plus, ArrowLeft, Search, Hash, Users } from 'lucide-react';
import { useOrganizationStore } from '../../organizations/store/organizationStore';

interface ChatSidebarProps {
  channels: ChatChannel[];
  activeChannel: ChatChannel | null;
  onSelectChannel: (channel: ChatChannel) => void;
  onSelectMember: (userId: number) => void;
  onCreateChannel: () => void;
  onBack: () => void;
}

interface MemberOption {
  id: number;
  name: string;
  email: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  onSelectMember,
  onCreateChannel,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const { organizations, fetchMyOrganizations } = useOrganizationStore();

  useEffect(() => {
    fetchMyOrganizations();
  }, [fetchMyOrganizations]);

  const members: MemberOption[] = React.useMemo(() => {
    const map = new Map<number, MemberOption>();
    organizations.forEach((org: any) => {
      (org.members || []).forEach((m: any) => {
        const uid = m.user_id ?? m.id;
        if (!map.has(uid)) {
          map.set(uid, {
            id: uid,
            name: m.user_name || m.name || `User #${uid}`,
            email: m.email || '',
          });
        }
      });
    });
    return Array.from(map.values());
  }, [organizations]);

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );
 
  const orgChannels = filtered.filter((c) => c.type === 'org');
  const teamChannels = filtered.filter((c) => c.type === 'team' || (c.type as string) === 'project'); 
  const directChannels = filtered.filter((c) => c.type === 'direct');

  return (
    <div className="flex h-full w-72 flex-col border-r border-white/10 bg-black">
 
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold text-white">Messages</h3>
        </div>
        <button
          onClick={onCreateChannel}
          className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          title="New Channel"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {/* General / Org Channels */}
        {orgChannels.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              <Hash className="h-3 w-3" />
              <span>General</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {orgChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectChannel(c)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all ${
                    activeChannel?.id === c.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Team Channels */}
        {teamChannels.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              <Users className="h-3 w-3" />
              <span>Teams</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {teamChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectChannel(c)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all ${
                    activeChannel?.id === c.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Direct Messages */}
        {directChannels.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Direct Messages
            </div>
            <div className="mt-1 space-y-0.5">
              {directChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectChannel(c)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all ${
                    activeChannel?.id === c.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members — click to DM */}
        {filteredMembers.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Members
            </div>
            <div className="mt-1 space-y-0.5">
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all text-left"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-white uppercase">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};