import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Key, Shield, Bell, User } from 'lucide-react';

type Tab = 'account' | 'privacy' | 'notifications' | 'profile';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('account');

  if (!user) {
    return null;
  }

  const tabs: { id: Tab; label: string; icon: typeof Key }[] = [
    { id: 'account', label: 'Account', icon: Key },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar tabs */}
        <nav className="hidden w-48 shrink-0 flex-col gap-1 sm:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Mobile tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 sm:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground border'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'profile' && <ProfileSettings />}
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }
    // TODO: implement password change API
    setMessage('Password change coming soon');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Account Settings</h2>
        <p className="text-muted-foreground text-sm">
          Change your password and manage your account
        </p>
      </div>

      {/* Password change */}
      <form onSubmit={handleChangePassword} className="bg-card space-y-4 rounded-lg border p-5">
        <h3 className="text-sm font-medium">Change Password</h3>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
            }}
            className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
            className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
          />
        </div>
        {message && <p className="text-sm text-amber-500">{message}</p>}
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm"
        >
          Update Password
        </button>
      </form>

      {/* Account info */}
      <div className="bg-card space-y-3 rounded-lg border p-5">
        <h3 className="text-sm font-medium">Account Information</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Email: </span>
          {user?.email}
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Member since: </span>
          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
        </div>
      </div>
    </div>
  );
}

function PrivacySettings() {
  const [emailVisible, setEmailVisible] = useState(false);
  const [portfolioVisible, setPortfolioVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);
  const [allowMessagesFrom, setAllowMessagesFrom] = useState<'everyone' | 'followers'>('everyone');
  const [allowMentorship, setAllowMentorship] = useState<'everyone' | 'followers'>('everyone');

  const handleSave = () => {
    // TODO: implement privacy settings update API
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Privacy Settings</h2>
        <p className="text-muted-foreground text-sm">
          Control who can see your information and contact you
        </p>
      </div>

      <div className="bg-card space-y-5 rounded-lg border p-5">
        <h3 className="text-sm font-medium">Profile Visibility</h3>

        <ToggleRow
          label="Show email on profile"
          description="Display your email address on your public profile"
          checked={emailVisible}
          onChange={setEmailVisible}
        />
        <ToggleRow
          label="Show portfolio on profile"
          description="Display your portfolio projects on your profile"
          checked={portfolioVisible}
          onChange={setPortfolioVisible}
        />
        <ToggleRow
          label="Show contact info on profile"
          description="Display your social links and contact information"
          checked={contactVisible}
          onChange={setContactVisible}
        />
      </div>

      <div className="bg-card space-y-5 rounded-lg border p-5">
        <h3 className="text-sm font-medium">Contact Preferences</h3>

        <SelectRow
          label="Who can message you?"
          description="Control who can send you direct messages"
          value={allowMessagesFrom}
          onChange={setAllowMessagesFrom}
          options={[
            { value: 'everyone', label: 'Everyone' },
            { value: 'followers', label: 'People you follow' },
          ]}
        />
        <SelectRow
          label="Who can request mentorship?"
          description="Control who can send you mentorship requests"
          value={allowMentorship}
          onChange={setAllowMentorship}
          options={[
            { value: 'everyone', label: 'Everyone' },
            { value: 'followers', label: 'People you follow' },
          ]}
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm"
      >
        Save Privacy Settings
      </button>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Notification Preferences</h2>
        <p className="text-muted-foreground text-sm">Choose which notifications you receive</p>
      </div>

      <div className="bg-card space-y-5 rounded-lg border p-5">
        <h3 className="text-sm font-medium">Email Notifications</h3>
        <ToggleRow
          label="Email on new followers"
          description="Get an email when someone follows you"
          checked={true}
          onChange={() => undefined}
        />
        <ToggleRow
          label="Email on new messages"
          description="Get an email when someone sends you a message"
          checked={true}
          onChange={() => undefined}
        />
        <ToggleRow
          label="Email on mentorship requests"
          description="Get an email when someone requests mentorship"
          checked={true}
          onChange={() => undefined}
        />
      </div>

      <div className="bg-card space-y-5 rounded-lg border p-5">
        <h3 className="text-sm font-medium">In-App Notifications</h3>
        <p className="text-muted-foreground text-xs">These are managed on the Notifications page</p>
      </div>

      <p className="text-muted-foreground text-xs">More notification options coming soon</p>
    </div>
  );
}

function ProfileSettings() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Profile Settings</h2>
        <p className="text-muted-foreground text-sm">
          Edit your public profile on your{' '}
          <a href={`/developers/${user?.username ?? ''}`} className="text-primary hover:underline">
            profile page
          </a>
        </p>
      </div>
      <div className="bg-card rounded-lg border p-5">
        <p className="text-muted-foreground text-sm">
          Your profile details — including name, bio, skills, experience, and education — can be
          edited directly from your public profile page.
        </p>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <button
        onClick={() => {
          onChange(!checked);
        }}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SelectRow({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="border-input bg-background focus:border-primary rounded-md border px-2 py-1 text-xs outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
