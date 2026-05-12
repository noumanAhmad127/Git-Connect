import { useState } from 'react';
import { useCreatePostMutation } from '@/features/posts/postApi';

interface Props {
  onSuccess?: () => void;
}

export default function PostForm({ onSuccess }: Props) {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    try {
      await createPost({
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      }).unwrap();
      setContent('');
      setTags([]);
      onSuccess?.();
    } catch {
      /* handled by RTK */
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="bg-card rounded-lg border p-4"
    >
      <textarea
        rows={3}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
        }}
        placeholder="What's on your mind?"
        className="border-input bg-background focus:border-primary focus:ring-primary w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
      />

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
          >
            #{tag}
            <button
              type="button"
              onClick={() => {
                removeTag(tag);
              }}
              className="text-muted-foreground hover:text-destructive ml-0.5"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add tag..."
          className="border-input bg-background focus:border-primary min-w-[100px] flex-1 rounded-md border px-2 py-1 text-xs outline-none"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Markdown supported &middot; {content.length}/50000
        </p>
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm disabled:opacity-50"
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
