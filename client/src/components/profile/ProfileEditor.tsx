import { useState } from 'react';
import type { PublicProfile, UpdateProfileBody } from '@/features/profile/profileApi';
import { Plus, X } from 'lucide-react';

interface Props {
  profile: PublicProfile;
  onSave: (body: UpdateProfileBody) => Promise<void>;
  onCancel: () => void;
}

type Section = 'basic' | 'social' | 'skills' | 'education' | 'experience' | 'portfolio';

export default function ProfileEditor({ profile, onSave, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [form, setForm] = useState<UpdateProfileBody>({
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    experienceYears: profile.experienceYears,
    availableForMentorship: profile.availableForMentorship,
    availableForCollaboration: profile.availableForCollaboration,
    socialLinks: { ...profile.socialLinks },
    skills: [...profile.skills],
    education: profile.education.map((e) => ({ ...e })),
    experience: profile.experience.map((e) => ({ ...e })),
    portfolio: profile.portfolio.map((p) => ({ ...p, screenshots: [...p.screenshots] })),
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof UpdateProfileBody>(key: K, value: UpdateProfileBody[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !form.skills?.includes(skill)) {
      updateField('skills', [...(form.skills ?? []), skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    updateField('skills', form.skills?.filter((s) => s !== skill) ?? []);
  };

  const addEducationItem = () => {
    updateField('education', [
      ...(form.education ?? []),
      { degree: '', institution: '', startDate: '', endDate: '', description: '' },
    ]);
  };

  const updateEducationItem = (
    i: number,
    field: keyof PublicProfile['education'][number],
    value: string,
  ) => {
    const items = [...(form.education ?? [])];
    items[i] = { ...items[i], [field]: value } as PublicProfile['education'][number];
    updateField('education', items);
  };

  const removeEducationItem = (i: number) => {
    updateField('education', form.education?.filter((_, idx) => idx !== i) ?? []);
  };

  const addExperienceItem = () => {
    updateField('experience', [
      ...(form.experience ?? []),
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const updateExperienceItem = (
    i: number,
    field: keyof PublicProfile['experience'][number],
    value: string | boolean,
  ) => {
    const items = [...(form.experience ?? [])];
    items[i] = { ...items[i], [field]: value } as PublicProfile['experience'][number];
    updateField('experience', items);
  };

  const removeExperienceItem = (i: number) => {
    updateField('experience', form.experience?.filter((_, idx) => idx !== i) ?? []);
  };

  const addPortfolioItem = () => {
    updateField('portfolio', [
      ...(form.portfolio ?? []),
      { title: '', description: '', url: '', githubUrl: '', screenshots: [] },
    ]);
  };

  const updatePortfolioItem = (
    i: number,
    field: keyof PublicProfile['portfolio'][number],
    value: string,
  ) => {
    const items = [...(form.portfolio ?? [])];
    items[i] = { ...items[i], [field]: value } as PublicProfile['portfolio'][number];
    updateField('portfolio', items);
  };

  const removePortfolioItem = (i: number) => {
    updateField('portfolio', form.portfolio?.filter((_, idx) => idx !== i) ?? []);
  };

  const sections: { key: Section; label: string }[] = [
    { key: 'basic', label: 'Basic' },
    { key: 'social', label: 'Social Links' },
    { key: 'skills', label: 'Skills' },
    { key: 'education', label: 'Education' },
    { key: 'experience', label: 'Experience' },
    { key: 'portfolio', label: 'Projects' },
  ];

  return (
    <div className="bg-card rounded-lg border">
      {/* Section tabs */}
      <div className="bg-muted/30 flex flex-wrap gap-1 border-b px-4 pt-2">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setActiveSection(s.key);
            }}
            className={`rounded-t-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeSection === s.key
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Basic Info */}
        {activeSection === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) => {
                  updateField('name', e.target.value);
                }}
                className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Headline</label>
              <input
                type="text"
                value={form.headline ?? ''}
                onChange={(e) => {
                  updateField('headline', e.target.value);
                }}
                className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Bio</label>
              <textarea
                rows={4}
                value={form.bio ?? ''}
                onChange={(e) => {
                  updateField('bio', e.target.value);
                }}
                className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full resize-y rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                type="text"
                value={form.location ?? ''}
                onChange={(e) => {
                  updateField('location', e.target.value);
                }}
                className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Experience (years)</label>
              <input
                type="number"
                min={0}
                max={70}
                value={form.experienceYears ?? ''}
                onChange={(e) => {
                  updateField(
                    'experienceYears',
                    e.target.value ? Number(e.target.value) : undefined,
                  );
                }}
                className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.availableForMentorship ?? false}
                  onChange={(e) => {
                    updateField('availableForMentorship', e.target.checked);
                  }}
                  className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                />
                Available for mentorship
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.availableForCollaboration ?? false}
                  onChange={(e) => {
                    updateField('availableForCollaboration', e.target.checked);
                  }}
                  className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                />
                Open to collaboration
              </label>
            </div>
          </div>
        )}

        {/* Social Links */}
        {activeSection === 'social' && (
          <div className="space-y-4">
            {(['github', 'linkedin', 'twitter', 'website'] as const).map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium capitalize">{platform}</label>
                <input
                  type="url"
                  value={form.socialLinks?.[platform] ?? ''}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, [platform]: e.target.value },
                    }));
                  }}
                  placeholder={`https://${platform === 'website' ? 'example.com' : `${platform}.com/username`}`}
                  className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                />
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {activeSection === 'skills' && (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill..."
                className="border-input bg-background focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
              <button
                onClick={addSkill}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills?.map((skill) => (
                <span
                  key={skill}
                  className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md py-1 pl-2.5 pr-1 text-xs"
                >
                  {skill}
                  <button
                    onClick={() => {
                      removeSkill(skill);
                    }}
                    className="hover:bg-destructive/20 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(!form.skills || form.skills.length === 0) && (
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            {form.education?.map((item, i) => (
              <div key={i} className="relative rounded-lg border p-4">
                <button
                  onClick={() => {
                    removeEducationItem(i);
                  }}
                  className="text-muted-foreground hover:text-destructive absolute right-2 top-2 rounded p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Degree</label>
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => {
                        updateEducationItem(i, 'degree', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Institution</label>
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => {
                        updateEducationItem(i, 'institution', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Start Date</label>
                    <input
                      type="text"
                      value={item.startDate}
                      onChange={(e) => {
                        updateEducationItem(i, 'startDate', e.target.value);
                      }}
                      placeholder="e.g. 2019"
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">End Date</label>
                    <input
                      type="text"
                      value={item.endDate ?? ''}
                      onChange={(e) => {
                        updateEducationItem(i, 'endDate', e.target.value);
                      }}
                      placeholder="e.g. 2023"
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Description</label>
                    <textarea
                      rows={2}
                      value={item.description ?? ''}
                      onChange={(e) => {
                        updateEducationItem(i, 'description', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full resize-y rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addEducationItem}
              className="text-primary flex items-center gap-1 text-sm hover:underline"
            >
              <Plus className="h-4 w-4" /> Add education
            </button>
          </div>
        )}

        {/* Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-4">
            {form.experience?.map((item, i) => (
              <div key={i} className="relative rounded-lg border p-4">
                <button
                  onClick={() => {
                    removeExperienceItem(i);
                  }}
                  className="text-muted-foreground hover:text-destructive absolute right-2 top-2 rounded p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        updateExperienceItem(i, 'title', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Company</label>
                    <input
                      type="text"
                      value={item.company}
                      onChange={(e) => {
                        updateExperienceItem(i, 'company', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Location</label>
                    <input
                      type="text"
                      value={item.location ?? ''}
                      onChange={(e) => {
                        updateExperienceItem(i, 'location', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Start Date</label>
                    <input
                      type="text"
                      value={item.startDate}
                      onChange={(e) => {
                        updateExperienceItem(i, 'startDate', e.target.value);
                      }}
                      placeholder="e.g. 2021"
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">End Date</label>
                    <input
                      type="text"
                      value={item.endDate ?? ''}
                      onChange={(e) => {
                        updateExperienceItem(i, 'endDate', e.target.value);
                      }}
                      placeholder="e.g. 2023"
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(e) => {
                          updateExperienceItem(i, 'current', e.target.checked);
                        }}
                        className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
                      />
                      Currently working here
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Description</label>
                    <textarea
                      rows={2}
                      value={item.description ?? ''}
                      onChange={(e) => {
                        updateExperienceItem(i, 'description', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full resize-y rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addExperienceItem}
              className="text-primary flex items-center gap-1 text-sm hover:underline"
            >
              <Plus className="h-4 w-4" /> Add experience
            </button>
          </div>
        )}

        {/* Portfolio */}
        {activeSection === 'portfolio' && (
          <div className="space-y-4">
            {form.portfolio?.map((item, i) => (
              <div key={i} className="relative rounded-lg border p-4">
                <button
                  onClick={() => {
                    removePortfolioItem(i);
                  }}
                  className="text-muted-foreground hover:text-destructive absolute right-2 top-2 rounded p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Project Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        updatePortfolioItem(i, 'title', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium">Description</label>
                    <textarea
                      rows={2}
                      value={item.description ?? ''}
                      onChange={(e) => {
                        updatePortfolioItem(i, 'description', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full resize-y rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">Live URL</label>
                    <input
                      type="url"
                      value={item.url ?? ''}
                      onChange={(e) => {
                        updatePortfolioItem(i, 'url', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium">GitHub URL</label>
                    <input
                      type="url"
                      value={item.githubUrl ?? ''}
                      onChange={(e) => {
                        updatePortfolioItem(i, 'githubUrl', e.target.value);
                      }}
                      className="border-input bg-background focus:border-primary focus:ring-primary mt-1 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addPortfolioItem}
              className="text-primary flex items-center gap-1 text-sm hover:underline"
            >
              <Plus className="h-4 w-4" /> Add project
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-muted/30 flex items-center justify-end gap-2 border-t px-4 py-3">
        <button
          onClick={onCancel}
          className="border-input hover:bg-muted rounded-md border px-4 py-1.5 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            void handleSave();
          }}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
