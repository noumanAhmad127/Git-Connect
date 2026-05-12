import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/features/notifications/notificationApi';
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
  MessageSquare,
  AtSign,
} from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  follow: <UserPlus className="h-4 w-4" />,
  like: <Heart className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  mention: <AtSign className="h-4 w-4" />,
  message: <MessageCircle className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  follow: 'text-blue-500',
  like: 'text-red-500',
  comment: 'text-emerald-500',
  mention: 'text-purple-500',
  message: 'text-amber-500',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetNotificationsQuery({ page });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
        <button
          onClick={() => {
            markAllRead(undefined).catch(() => {});
          }}
          className="text-primary flex items-center gap-1 text-sm hover:underline"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <Bell className="text-muted-foreground mx-auto h-8 w-8" />
          <p className="text-muted-foreground mt-2 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              to={notif.link}
              onClick={() => {
                if (!notif.read) markRead(notif.id).catch(() => {});
              }}
              className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                notif.read ? 'hover:bg-muted/30' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className={`mt-0.5 ${typeColors[notif.type] ?? 'text-muted-foreground'}`}>
                {typeIcons[notif.type] ?? <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-6 w-6 shrink-0 overflow-hidden rounded-full">
                    {notif.actor.avatar ? (
                      <img
                        src={notif.actor.avatar}
                        alt={notif.actor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center text-[8px] font-semibold">
                        {notif.actor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm">
                    <strong>{notif.actor.name}</strong>
                    {notif.type === 'follow' && ' followed you'}
                    {notif.type === 'like' && ' liked your post'}
                    {notif.type === 'comment' && ' commented on your post'}
                    {notif.type === 'mention' && ' mentioned you'}
                    {notif.type === 'message' && ' sent you a message'}
                  </p>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!notif.read && <div className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full" />}
            </Link>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && page < meta.totalPages && (
        <button
          onClick={() => {
            setPage((p) => p + 1);
          }}
          className="text-primary mt-4 w-full text-sm hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
}
