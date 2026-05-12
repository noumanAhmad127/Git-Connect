import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useToggleFollowMutation,
  useUploadAvatarMutation,
} from '@/features/profile/profileApi';
import type { UpdateProfileBody } from '@/features/profile/profileApi';
import { useAuth } from '@/features/auth/useAuth';
import ProfileEditor from '@/components/profile/ProfileEditor';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading } = useGetProfileQuery(username ?? '', { skip: !username });
  const [updateProfile] = useUpdateProfileMutation();
  const [toggleFollow] = useToggleFollowMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [editing, setEditing] = useState(false);

  const isOwner = currentUser?.username === username;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold">User not found</h1>
          <p className="text-muted-foreground text-sm">
            The developer you're looking for doesn't exist.
          </p>
          <Link to="/developers" className="text-primary text-sm hover:underline">
            Browse developers
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (body: UpdateProfileBody) => {
    if (!username) {
      return;
    }
    await updateProfile({ username, body }).unwrap();
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    uploadAvatar(formData)
      .unwrap()
      .catch(() => {
        /* ignore */
      });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="bg-muted h-24 w-24 overflow-hidden rounded-full">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-2xl font-semibold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isOwner && (
            <label className="bg-primary text-primary-foreground hover:bg-primary/90 absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[10px] shadow-sm">
              <span>+</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{profile.name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.headline && <p className="text-muted-foreground mt-1">{profile.headline}</p>}
              {profile.location && (
                <p className="text-muted-foreground mt-1 text-sm">{profile.location}</p>
              )}
            </div>

            <div className="flex gap-2">
              {isOwner ? (
                editing ? (
                  <button
                    onClick={() => {
                      setEditing(false);
                    }}
                    className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(true);
                    }}
                    className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
                  >
                    Edit profile
                  </button>
                )
              ) : currentUser ? (
                <button
                  onClick={() => {
                    toggleFollow(profile.username).catch(() => {
                      /* ignore */
                    });
                  }}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    profile.isFollowing
                      ? 'border-input hover:bg-muted border'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-muted-foreground">
              <strong className="text-foreground">{profile.followerCount}</strong> followers
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">{profile.followingCount}</strong> following
            </span>
          </div>
        </div>
      </div>

      {/* Editor */}
      {editing ? (
        <div className="mt-8">
          <ProfileEditor
            profile={profile}
            onSave={handleSave}
            onCancel={() => {
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <>
          {/* Bio */}
          {profile.bio && (
            <div className="mt-6">
              <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-1 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="mt-4 flex gap-3 text-xs">
            {profile.availableForMentorship && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Available for mentorship
              </span>
            )}
            {profile.availableForCollaboration && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Open to collaborate
              </span>
            )}
          </div>

          {/* Experience */}
          {profile.experience.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Experience</h2>
              <div className="mt-3 space-y-4">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="border-muted border-l-2 pl-4">
                    <h3 className="font-medium">{exp.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {exp.company}
                      {exp.location ? ` \u00B7 ${exp.location}` : ''}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {exp.startDate} \u2014 {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {profile.education.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Education</h2>
              <div className="mt-3 space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={i} className="border-muted border-l-2 pl-4">
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-muted-foreground text-sm">{edu.institution}</p>
                    <p className="text-muted-foreground text-xs">
                      {edu.startDate} \u2014 {edu.endDate ?? 'Present'}
                    </p>
                    {edu.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio */}
          {profile.portfolio.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Projects</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {profile.portfolio.map((project, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <h3 className="font-medium">{project.title}</h3>
                    {project.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs hover:underline"
                        >
                          Live demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs hover:underline"
                        >
                          Source code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Social Links */}
          {Object.values(profile.socialLinks).some(Boolean) && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Links</h2>
              <div className="mt-2 flex gap-3">
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Twitter
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
