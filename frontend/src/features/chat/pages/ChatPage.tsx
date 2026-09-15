import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { CreateChannelModal } from '../components/CreateChannelModal';
import { useWebSocket } from '../../../hooks/useWebSocket';

export const ChatPage = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchParams] = useSearchParams();
  const orgParam = searchParams.get('org');

  const didAutoSelect = useRef<string | null>(null);   

  const {
    channels,
    activeChannel,
    messages,
    isLoadingMessages,
    error,
    fetchChannels,
    selectChannel,
    createChannel,
    openDirectChat,
    sendMessage,
    addIncomingMessage,
    clearError,
  } = useChatStore();

  useWebSocket();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    const handleWsMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.event === 'chat:message' && detail?.data) {
        addIncomingMessage(detail.data);
      }
    };
    window.addEventListener('devsync:ws_message', handleWsMessage);
    return () => window.removeEventListener('devsync:ws_message', handleWsMessage);
  }, [addIncomingMessage]);
 
  useEffect(() => {
    if (!orgParam) return;
    if (didAutoSelect.current === orgParam) return;   
    const targetOrgId = Number(orgParam);
    if (!targetOrgId) return;
    if (channels.length === 0) return;                 

    const existing = channels.find(
      (c) => c.type === 'org' && c.organization_id === targetOrgId
    );

    if (existing) {
      didAutoSelect.current = orgParam;             
      if (activeChannel?.id !== existing.id) {
        selectChannel(existing);
      }
      return;
    }

    createChannel({
      name: 'general',
      type: 'org',
      organization_id: targetOrgId,
    })
      .then(() => {
        didAutoSelect.current = orgParam;             
        fetchChannels();
      })
      .catch((err) => console.error('[Chat] auto-create failed:', err));
  }, [orgParam, channels, activeChannel?.id, selectChannel, createChannel, fetchChannels]);

  const activeMessages = activeChannel ? messages[activeChannel.id] || [] : [];

  const handleSendMessage = async (text: string) => {
    if (!activeChannel) return;
    await sendMessage(activeChannel.id, text);
  };

  const handleSelectMember = async (userId: number) => {
    try {
      await openDirectChat(userId);
    } catch (err) {
      console.error('[Chat] failed to open DM:', err);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden">
      <ChatSidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={selectChannel}
        onSelectMember={handleSelectMember}
        onCreateChannel={() => setShowCreateModal(true)}
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {error && (
          <div className="mx-4 mt-3 flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="rounded p-1 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <ChatWindow
          channel={activeChannel}
          messages={activeMessages}
          isLoading={isLoadingMessages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchChannels()}
        />
      )}
    </div>
  );
};

export default ChatPage;