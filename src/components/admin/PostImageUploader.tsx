'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { getPostImageUrl, MAX_POST_IMAGES, type PostImage } from '~/lib/images';

interface PickedImage {
  /** Stable key for React — a File has no id and the same file can be picked twice. */
  id: string;
  file: File;
  previewUrl: string;
}

interface PostImageUploaderProps {
  /** Images already stored on the post, in the order they should stay in. */
  initialImages: PostImage[];
}

/**
 * Picks the photos a post carries. Images the author keeps are posted back as
 * JSON (`keptImages`) and newly picked files ride along in the `images` file
 * input — the server appends the uploads to the kept ones, so what the grid
 * shows here is the order the post ends up with.
 */
export function PostImageUploader({ initialImages }: PostImageUploaderProps) {
  const [kept, setKept] = useState<PostImage[]>(initialImages);
  const [picked, setPicked] = useState<PickedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = kept.length + picked.length;
  const remaining = MAX_POST_IMAGES - total;

  // Mirrors the picked list into the file input — that input is the only
  // thing the form actually submits, so removing a thumbnail has to drop that
  // file from it too. The ref keeps the latest list for the unmount cleanup.
  const pickedRef = useRef<PickedImage[]>([]);

  useEffect(() => {
    pickedRef.current = picked;

    const input = inputRef.current;
    if (!input) return;

    const transfer = new DataTransfer();
    for (const image of picked) transfer.items.add(image.file);
    input.files = transfer.files;
  }, [picked]);

  // Removals revoke their own preview URL; this releases whatever is still
  // open when the form goes away.
  useEffect(() => {
    return () => {
      for (const image of pickedRef.current) URL.revokeObjectURL(image.previewUrl);
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])].slice(0, remaining);
    if (files.length === 0) return;

    setPicked((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function handleRemoveKept(path: string) {
    setKept((current) => current.filter((image) => image.path !== path));
  }

  function handleRemovePicked(id: string) {
    setPicked((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="keptImages" value={JSON.stringify(kept)} />

      {total > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {kept.map((image, index) => (
            <Thumbnail
              key={image.path}
              src={getPostImageUrl(image.path)}
              isCover={index === 0}
              onRemove={() => handleRemoveKept(image.path)}
              label={`사진 ${index + 1}`}
            />
          ))}
          {picked.map((image, index) => (
            <Thumbnail
              key={image.id}
              src={image.previewUrl}
              isCover={kept.length === 0 && index === 0}
              onRemove={() => handleRemovePicked(image.id)}
              label={`사진 ${kept.length + index + 1}`}
            />
          ))}
          {remaining > 0 && (
            <li>
              <AddButton onClick={() => inputRef.current?.click()} variant="tile" />
            </li>
          )}
        </ul>
      ) : (
        <AddButton onClick={() => inputRef.current?.click()} variant="pill" />
      )}

      {total > 0 && (
        <p className="text-xs text-muted-foreground">
          첫 번째 사진이 목록·공유 미리보기의 대표 이미지예요. 최대 {MAX_POST_IMAGES}장.
        </p>
      )}

      <input
        ref={inputRef}
        id="postImages"
        name="images"
        type="file"
        accept="image/webp,image/jpeg,image/png,image/gif"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

interface ThumbnailProps {
  src: string;
  label: string;
  isCover: boolean;
  onRemove: () => void;
}

function Thumbnail({ src, label, isCover, onRemove }: ThumbnailProps) {
  return (
    <li className="group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-border">
      {/* Newly picked files are blob: URLs the Next.js optimizer can't serve, so these previews bypass it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="size-full object-cover" />

      {isCover && (
        <span className="absolute bottom-1 left-1 rounded-full bg-background/85 px-2 py-0.5 text-[0.625rem] font-medium tracking-wide text-foreground backdrop-blur">
          대표
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-[var(--shadow-card)] backdrop-blur transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`${label} 제거`}
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}

interface AddButtonProps {
  onClick: () => void;
  variant: 'pill' | 'tile';
}

function AddButton({ onClick, variant }: AddButtonProps) {
  const shared =
    'flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:border-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none';

  if (variant === 'tile') {
    return (
      <button type="button" onClick={onClick} className={`${shared} aspect-square w-full rounded-lg`} aria-label="사진 추가">
        <ImagePlus className="size-5" />
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${shared} w-auto rounded-full px-3 py-1.5 text-xs`}>
      <ImagePlus className="size-3.5" />
      <span>사진 추가</span>
    </button>
  );
}
