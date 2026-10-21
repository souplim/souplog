'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { getPostImageUrl, type PostImage } from '~/lib/images';
import { Button } from '~/components/ui/button';

interface PickedCover {
  file: File;
  previewUrl: string;
}

/** A cover picked from search results — previewed from its thumbnail, saved from `coverUrl`. */
export interface SuggestedCover {
  thumbnailUrl: string;
  coverUrl: string;
}

interface CoverPickerProps {
  initialCover: PostImage | null;
  suggested: SuggestedCover | null;
  onClearSuggested: () => void;
}

/**
 * Picks a book's cover. Same contract as the About page's AvatarPicker: the
 * stored cover rides back as JSON (`keptCover`, empty once removed) and a
 * newly picked file goes in the `cover` file input. A cover suggested by the
 * search box rides in `coverUrl`; a file picked from disk still beats it.
 */
export function CoverPicker({ initialCover, suggested, onClearSuggested }: CoverPickerProps) {
  const [kept, setKept] = useState<PostImage | null>(initialCover);
  const [picked, setPicked] = useState<PickedCover | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Releases the last preview URL when the form goes away.
  const pickedRef = useRef<PickedCover | null>(null);
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
    onClearSuggested();
    setPicked((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    // The file input is what the form submits, so it has to forget the file too.
    if (inputRef.current) inputRef.current.value = '';
  }

  const previewSrc = picked?.previewUrl ?? suggested?.thumbnailUrl ?? (kept ? getPostImageUrl(kept.path) : null);
  const coverUrl = !picked && suggested ? suggested.coverUrl : '';

  return (
    <div className="flex items-end gap-5">
      <input type="hidden" name="keptCover" value={kept ? JSON.stringify(kept) : ''} />
      <input type="hidden" name="coverUrl" value={coverUrl} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={previewSrc ? '표지 바꾸기' : '표지 올리기'}
        className="flex aspect-[2/3] w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xs bg-accent ring-1 ring-border outline-none transition-shadow duration-[var(--duration-fast)] hover:ring-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {previewSrc ? (
          // Picked files are blob: URLs (and suggestions remote thumbnails) the optimizer can't serve.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-6 text-accent-foreground" />
        )}
      </button>

      <div className="space-y-2">
        <div className="flex gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            {previewSrc ? '표지 바꾸기' : '표지 올리기'}
          </Button>
          {previewSrc && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              제거
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">없으면 제목으로 표지를 대신해요. webp·jpeg·png·gif, 5MB 이하.</p>
      </div>

      <input
        ref={inputRef}
        name="cover"
        type="file"
        accept="image/webp,image/jpeg,image/png,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
