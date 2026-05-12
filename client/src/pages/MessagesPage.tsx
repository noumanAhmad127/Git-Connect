import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} from '@/features/messaging/messagingApi';
import { getSocket } from '@/lib/socket';
import { Send, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convsLoading } = useGetConversationsQuery(undefined, {
    skip: !user,
  });
  const { data: messagesData, isLoading: msgsLoading } = useGetMessagesQuery(
    { conversationId: activeConv!, page },
    { skip: !activeConv },
  );
  const [sendMessage] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();

  const messages = messagesData?.messages ?? [];
  const meta = messagesData?.meta;

  useEffect(() => {
    if (activeConv) {
      markRead(activeConv).catch(() => {});
    }
  }, [activeConv, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeConv) return;
    const handler = (msg: any) => {
      if (msg.conversation === activeConv) {
        // RTK cache invalidation will handle this
      }
    };
    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
    };
  }, [activeConv]);

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConv) return;
    const conv = conversations?.find((c) => c.id === activeConv);
    if (!conv) return;
    try {
      await sendMessage({ receiverId: conv.participant.id, content: newMsg.trim() }).unwrap();
      setNewMsg('');
    } catch {
      /* ignore */
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl px-4 py-4">
      {/* Conversations list */}
      <div className="w-80 shrink-0 border-r pr-4">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>

        {convsLoading ? (
          <div className="flex justify-center py-8">
            <div className="border-muted border-t-primary h-6 w-6 animate-spin rounded-full border-4" />
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No conversations yet.</p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConv(conv.id);
                  setPage(1);
                }}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  activeConv === conv.id ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    {conv.participant.avatar ? (
                      <img
                        src={conv.participant.avatar}
                        alt={conv.participant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center text-xs font-semibold">
                        {conv.participant.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{conv.participant.name}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-muted-foreground truncate text-xs">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex flex-1 flex-col pl-4">
        {!activeConv ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
          </div>
        ) : msgsLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="border-muted border-t-primary h-6 w-6 animate-spin rounded-full border-4" />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {messages.map((msg) => {
                const isMine = msg.sender.id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`mt-0.5 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 border-t pt-3">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => {
                  setNewMsg(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="border-input bg-background focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
