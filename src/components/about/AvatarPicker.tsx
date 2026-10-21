'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { getPostImageUrl, type PostImage } from '~/lib/images';
import { Button } from '~/components/ui/button';

interface PickedAvatar {
  file: File;
  previewUrl: string;
}

interface AvatarPickerProps {
  initialAvatar: PostImage | null;
}

const AVATAR_SIZE_CLASS = 'size-28';

/**
 * Picks the About page's profile photo. The stored photo rides back as JSON
 * (`keptAvatar`, empty once removed) and a newly picked file goes in the
 * `avatar` file input — the server prefers the new file when there is one.
 */
export function AvatarPicker({ initialAvatar }: AvatarPickerProps) {
  const [kept, setKept] = useState<PostImage | null>(initialAvatar);
  const [picked, setPicked] = useState<PickedAvatar | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Releases the last preview URL when the form goes away.
  const pickedRef = useRef<PickedAvatar | null>(null);
  useEffect(() => {
    pickedRef.current = picked;
  }, [picked]);
  useEffect(() => {
    return () => {
      if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.previewUrl);
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPicked((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  }

  function handleRemove() {
    setKept(null);
    setPicked((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    // The file input is what the form submits, so it has to forget the file too.
    if (inputRef.current) inputRef.current.value = '';
  }

  const previewSrc = picked?.previewUrl ?? (kept ? getPostImageUrl(kept.path) : null);

  return (
    <div className="flex items-center gap-5">
      <input type="hidden" name="keptAvatar" value={kept ? JSON.stringify(kept) : ''} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={previewSrc ? '프로필 사진 바꾸기' : '프로필 사진 올리기'}
        className={`group relative flex ${AVATAR_SIZE_CLASS} shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-accent ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring/50`}
      >
        {previewSrc ? (
          // Picked files are blob: URLs the Next.js optimizer can't serve, so the preview bypasses it.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="size-full object-cover" />
        ) : (
          <Camera className="size-6 text-accent-foreground" />
        )}
        {previewSrc && (
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 text-background opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera className="size-5" />
          </span>
        )}
      </button>

      <div className="space-y-2">
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {previewSrc ? '사진 바꾸기' : '사진 올리기'}
          </Button>
          {previewSrc && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              제거
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">정사각형 사진이 가장 잘 어울려요. webp·jpeg·png·gif, 5MB 이하.</p>
      </div>

      <input
        ref={inputRef}
        name="avatar"
        type="file"
        accept="image/webp,image/jpeg,image/png,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
