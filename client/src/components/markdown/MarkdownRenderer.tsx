import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface Props {
  content: string;
  className?: string;
}

// Pre-process content: convert @mentions and #hashtags to markdown links, escape raw HTML
function preprocessContent(content: string): string {
  const processed = content
    // Escape HTML to prevent XSS
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Convert @mentions to profile links (avoid email addresses)
    .replace(/(?<!\w)@(\w+)/g, '[@$1](/developers/$1)')
    // Convert #hashtags to search links (preceded by whitespace or start of string)
    .replace(/(?:^|(?<=\s))#(\w+)/g, '[#$1](/posts?tags=$1)');

  return processed;
}

const components: Partial<Components> = {
  a: ({ href, children }) => {
    const isExternal = href?.startsWith('http');
    const attrs = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <a href={href} className="text-primary hover:underline" {...attrs}>
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => (
    <img src={src} alt={alt ?? ''} className="max-w-full rounded-lg" loading="lazy" />
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted rounded px-1.5 py-0.5 text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
};

export default function MarkdownRenderer({ content, className }: Props) {
  const processed = preprocessContent(content);

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {processed}
      </ReactMarkdown>
    </div>
  );
}
