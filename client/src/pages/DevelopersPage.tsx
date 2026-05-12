import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useListDevelopersQuery } from '@/features/profile/profileApi';
import { SKILLS } from '@/lib/constants';
import { Search, MapPin, Users, Award } from 'lucide-react';

export default function DevelopersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, skillsFilter, locationFilter, mentorshipOnly]);

  const { data, isLoading, isFetching, error } = useListDevelopersQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    skills: skillsFilter || undefined,
    location: locationFilter || undefined,
    mentorship: mentorshipOnly || undefined,
  });

  const developers = data?.users ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Developers</h1>
        <p className="text-muted-foreground mt-1">Discover and connect with developers</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search developers by name, username, or headline..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[180px] flex-1">
            <Award className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <select
              value={skillsFilter}
              onChange={(e) => {
                setSkillsFilter(e.target.value);
              }}
              className="border-input bg-background focus:border-primary focus:ring-primary w-full appearance-none rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:ring-1"
            >
              <option value="">All skills</option>
              {SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[180px] flex-1">
            <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
              }}
              className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:ring-1"
            />
          </div>

          <label className="border-input hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={mentorshipOnly}
              onChange={(e) => {
                setMentorshipOnly(e.target.checked);
              }}
              className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
            />
            <Users className="text-muted-foreground h-4 w-4" />
            Mentorship available
          </label>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        </div>
      ) : error ? (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border px-4 py-8 text-center">
          <p className="text-destructive text-sm">Failed to load developers. Please try again.</p>
        </div>
      ) : developers.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <Users className="text-muted-foreground mx-auto h-8 w-8" />
          <p className="text-muted-foreground mt-2 text-sm">
            No developers found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSkillsFilter('');
              setLocationFilter('');
              setMentorshipOnly(false);
            }}
            className="text-primary mt-2 text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-muted-foreground mb-4 text-sm">
            {isFetching
              ? 'Searching...'
              : `${String(meta?.total ?? developers.length)} developer${meta?.total !== 1 ? 's' : ''} found`}
          </p>

          {/* Developer Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev) => (
              <Link
                key={dev.id}
                to={`/developers/${dev.username}`}
                className="hover:border-primary/50 hover:bg-muted/30 group rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    {dev.avatar ? (
                      <img src={dev.avatar} alt={dev.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center text-lg font-semibold">
                        {dev.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="group-hover:text-primary truncate font-medium">{dev.name}</h3>
                    <p className="text-muted-foreground truncate text-xs">@{dev.username}</p>
                    {dev.headline && (
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                        {dev.headline}
                      </p>
                    )}
                  </div>
                </div>

                {dev.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {dev.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-[10px]"
                      >
                        {skill}
                      </span>
                    ))}
                    {dev.skills.length > 4 && (
                      <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-[10px]">
                        +{dev.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                  {dev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {dev.location}
                    </span>
                  )}
                  {dev.availableForMentorship && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Users className="h-3 w-3" />
                      Mentor
                    </span>
                  )}
                </div>

                <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                  <span>{dev.followerCount} followers</span>
                  <span>{dev.followingCount} following</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={page <= 1 || isFetching}
                className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                  const start = Math.max(1, meta.totalPages > 7 ? page - 3 : 1);
                  const pageNum = Math.min(start + i, meta.totalPages);
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setPage(pageNum);
                      }}
                      disabled={isFetching}
                      className={`h-8 min-w-[2rem] rounded-md text-sm font-medium ${
                        pageNum === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border-input hover:bg-muted border'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setPage((p) => Math.min(meta.totalPages, p + 1));
                }}
                disabled={page >= meta.totalPages || isFetching}
                className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
