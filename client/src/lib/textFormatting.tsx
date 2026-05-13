import { Link } from 'react-router-dom';

// Combined regex that captures URLs, mentions, and hashtags
const CONTENT_REGEX = /(https?:\/\/[^\s<]+)|@(\w+)|#(\w+)/g;

interface ContentSegment {
  type: 'text' | 'url' | 'mention' | 'hashtag';
  value: string;
  href?: string;
}

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  CONTENT_REGEX.lastIndex = 0;

  while ((match = CONTENT_REGEX.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // URL
      segments.push({ type: 'url', value: match[1], href: match[1] });
    } else if (match[2]) {
      // @mention
      segments.push({
        type: 'mention',
        value: `@${match[2]}`,
        href: `/developers/${match[2]}`,
      });
    } else if (match[3]) {
      // #hashtag
      segments.push({
        type: 'hashtag',
        value: `#${match[3]}`,
        href: `/posts?tags=${match[3]}`,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return segments;
}

export function FormattedContent({ content, className }: { content: string; className?: string }) {
  const segments = parseContent(content);

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        switch (segment.type) {
          case 'url':
            return (
              <a
                key={i}
                href={segment.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {segment.value}
              </a>
            );
          case 'mention':
            return (
              <Link key={i} to={segment.href ?? '#'} className="text-primary hover:underline">
                {segment.value}
              </Link>
            );
          case 'hashtag':
            return (
              <Link key={i} to={segment.href ?? '#'} className="text-primary hover:underline">
                {segment.value}
              </Link>
            );
          default:
            return <span key={i}>{segment.value}</span>;
        }
      })}
    </span>
  );
}
