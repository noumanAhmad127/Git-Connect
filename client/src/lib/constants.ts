export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Ruby',
  'Go',
  'Rust',
  'Java',
  'C#',
  'PHP',
  'Swift',
  'Kotlin',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'GraphQL',
  'REST API',
  'Machine Learning',
  'DevOps',
] as const;

export const NAV_LINKS = [
  { label: 'Developers', href: '/developers' },
  { label: 'Feed', href: '/feed' },
] as const;
