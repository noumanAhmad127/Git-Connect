import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useGetUnreadNotificationCountQuery } from '@/features/notifications/notificationApi';
import { useGetUnreadMessageCountQuery } from '@/features/messaging/messagingApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: msgData } = useGetUnreadMessageCountQuery(undefined, { pollingInterval: 30000 });

  const unreadNotifs = notifData?.count ?? 0;
  const unreadMessages = msgData?.count ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/');
  };

  const navLinks: { label: string; href: string; badge?: number }[] = [
    { label: 'Developers', href: '/developers' },
    { label: 'Feed', href: '/feed' },
    { label: 'Messages', href: '/messages', badge: unreadMessages },
    { label: 'Notifications', href: '/notifications', badge: unreadNotifs },
  ];

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Code2 className="h-6 w-6" />
          <span className="hidden text-lg font-semibold sm:inline">GitConnect</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Search..."
              className="border-input bg-muted focus:bg-background focus:border-primary focus:ring-primary w-full rounded-lg border py-1.5 pl-8 pr-3 text-sm outline-none transition-colors focus:ring-1"
            />
          </div>
        </form>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted relative rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              {link.label}
              {link.badge !== undefined && link.badge > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-medium">
                  {link.badge > 99 ? '99+' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile nav icons */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/messages"
            className="text-muted-foreground hover:text-foreground relative rounded-md p-1.5"
          >
            <MessageSquare className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="bg-destructive text-destructive-foreground absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[9px] font-medium">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>
          <Link
            to="/notifications"
            className="text-muted-foreground hover:text-foreground relative rounded-md p-1.5"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifs > 0 && (
              <span className="bg-destructive text-destructive-foreground absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[9px] font-medium">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </Link>
        </div>

        {/* User dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
            }}
            className="hover:bg-muted flex items-center gap-2 rounded-lg p-1 transition-colors"
          >
            <div className="bg-muted h-8 w-8 overflow-hidden rounded-full">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <ChevronDown className="text-muted-foreground hidden h-4 w-4 sm:block" />
          </button>

          {showDropdown && (
            <div className="bg-card absolute right-0 top-full mt-1 w-48 rounded-lg border py-1 shadow-lg">
              <div className="border-b px-3 py-2">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="text-muted-foreground truncate text-xs">@{user?.username}</p>
              </div>
              <Link
                to={`/developers/${user?.username ?? ''}`}
                onClick={() => {
                  setShowDropdown(false);
                }}
                className="hover:bg-muted flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => {
                  setShowDropdown(false);
                }}
                className="hover:bg-muted flex items-center gap-2 px-3 py-2 text-sm transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => void handleLogout()}
                className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
