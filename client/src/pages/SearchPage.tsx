import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLazySearchQuery, type SearchResult } from '@/features/search/searchApi';
import { Search, Users, FileText, User, ArrowLeft } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialType = (searchParams.get('type') ?? 'all') as 'users' | 'posts' | 'all';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<'all' | 'users' | 'posts'>(initialType);
  const [trigger, { data, isLoading, isFetching }] = useLazySearchQuery();

  useEffect(() => {
    if (initialQuery.trim()) {
      void trigger({ q: initialQuery, type: initialType });
    }
    // Only run on mount
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      return;
    }
    setSearchParams({ q: query, type });
    void trigger({ q: query, type });
  };

  const results = data?.results ?? [];
  const meta = data?.meta;

  const handleTypeChange = (newType: 'all' | 'users' | 'posts') => {
    setType(newType);
    if (query.trim()) {
      setSearchParams({ q: query, type: newType });
      void trigger({ q: query, type: newType });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/feed"
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>
        <h1 className="text-2xl font-semibold">Search</h1>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search developers, posts..."
            className="border-input bg-background focus:border-primary focus:ring-primary w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none focus:ring-1"
          />
        </div>
      </form>

      {/* Type tabs */}
      <div className="mb-6 flex gap-2">
        {(['all', 'users', 'posts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              handleTypeChange(t);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
              type === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted border'
            }`}
          >
            {t === 'all' && <Search className="h-3.5 w-3.5" />}
            {t === 'users' && <Users className="h-3.5 w-3.5" />}
            {t === 'posts' && <FileText className="h-3.5 w-3.5" />}
            {t === 'all' ? 'All' : t === 'users' ? 'Users' : 'Posts'}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading || isFetching ? (
        <div className="flex justify-center py-16">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <Search className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            {query.trim() ? 'No results found' : 'Type a query to search'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {results.map((result) => (
              <ResultCard key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="text-muted-foreground mt-8 text-center text-sm">
              Page {meta.page} of {meta.totalPages} ({meta.total} results)
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  if (result.type === 'user') {
    return (
      <Link
        to={result.url}
        className="bg-card hover:border-primary/20 flex items-center gap-4 rounded-lg border p-4 transition-colors"
      >
        <div className="bg-muted h-12 w-12 shrink-0 overflow-hidden rounded-full">
          {result.avatar ? (
            <img src={result.avatar} alt={result.name} className="h-full w-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm font-semibold">
              {result.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{result.name}</p>
          <p className="text-muted-foreground truncate text-xs">@{result.username}</p>
          {result.headline && (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{result.headline}</p>
          )}
          {result.skills && result.skills.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {result.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-[10px]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <User className="text-muted-foreground h-4 w-4 shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      to={result.url}
      className="bg-card hover:border-primary/20 rounded-lg border p-4 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="bg-muted h-8 w-8 shrink-0 overflow-hidden rounded-full">
          {result.authorAvatar ? (
            <img
              src={result.authorAvatar}
              alt={result.authorName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs font-semibold">
              {result.authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">
            {result.authorName} &middot; @{result.authorUsername}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed">{result.description}</p>
        </div>
      </div>
    </Link>
  );
}
