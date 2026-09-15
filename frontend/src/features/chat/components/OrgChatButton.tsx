import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

interface OrgChatButtonProps {
  organizeId: number;
  orgName?: string;
}

export const OrgChatButton = ({ organizeId, orgName }: OrgChatButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat?org=${organizeId}`);
  };

  return (
    <button
      onClick={handleClick}
      title={orgName ? `Open chat for ${orgName}` : 'Open chat'}
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black text-white shadow-2xl transition-all hover:bg-green-600 hover:border-green-500 hover:scale-105 active:scale-95"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
};