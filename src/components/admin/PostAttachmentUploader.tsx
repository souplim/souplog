'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FileText, Paperclip, X } from 'lucide-react';
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  getAttachmentExtension,
  MAX_ATTACHMENT_BYTES,
  MAX_POST_ATTACHMENTS,
  type PostAttachment,
} from '~/lib/attachments';

interface PickedAttachment {
  /** Stable key for React — a File has no id and the same file can be picked twice. */
  id: string;
  file: File;
}

interface PostAttachmentUploaderProps {
  /** Files already stored on the post, in the order they should stay in. */
  initialAttachments: PostAttachment[];
}

const MAX_ATTACHMENT_MB = MAX_ATTACHMENT_BYTES / 1024 / 1024;

/**
 * Picks the files a post carries. Works like `PostImageUploader`: kept files
 * are posted back as JSON (`keptAttachments`), new ones ride along in the
 * `attachments` file input, and the server appends the uploads to the kept.
 */
export function PostAttachmentUploader({ initialAttachments }: PostAttachmentUploaderProps) {
  const [kept, setKept] = useState<PostAttachment[]>(initialAttachments);
  const [picked, setPicked] = useState<PickedAttachment[]>([]);
  const [rejection, setRejection] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = kept.length + picked.length;
  const remaining = MAX_POST_ATTACHMENTS - total;

  // The file input is what the form submits, so it has to mirror the list.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const transfer = new DataTransfer();
    for (const attachment of picked) transfer.items.add(attachment.file);
    input.files = transfer.files;
  }, [picked]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    if (files.length === 0) return;

    // The server checks all of this again; catching it here just spares the
    // author a failed save after typing out the whole post.
    const accepted = files.filter(
      (file) => getAttachmentExtension(file.name) !== undefined && file.size <= MAX_ATTACHMENT_BYTES,
    );
    const allowed = accepted.slice(0, remaining);

    setRejection(
      allowed.length < files.length
        ? `형식이 맞지 않거나 ${MAX_ATTACHMENT_MB}MB를 넘는 파일, 개수 초과분은 빠졌어요.`
        : null,
    );

    setPicked((current) => [
      ...current,
      ...allowed.map((file) => ({ id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, file })),
    ]);
  }

  function handleRemoveKept(path: string) {
    setKept((current) => current.filter((attachment) => attachment.path !== path));
  }

  function handleRemovePicked(id: string) {
    setPicked((current) => current.filter((attachment) => attachment.id !== id));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="keptAttachments" value={JSON.stringify(kept)} />

      {total > 0 && (
        <ul className="divide-y divide-border/60 rounded-lg ring-1 ring-border">
          {kept.map((attachment) => (
            <AttachmentRow
              key={attachment.path}
              name={attachment.name}
              size={attachment.size}
              onRemove={() => handleRemoveKept(attachment.path)}
            />
          ))}
          {picked.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              name={attachment.file.name}
              size={attachment.file.size}
              onRemove={() => handleRemovePicked(attachment.id)}
            />
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-auto cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:border-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Paperclip className="size-3.5" />
          <span>파일 첨부</span>
        </button>
      )}

      {rejection ? (
        <p role="alert" className="text-xs text-destructive">
          {rejection}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          PDF·문서·스프레드시트·한글·압축 파일 등, 파일당 {MAX_ATTACHMENT_MB}MB · 최대 {MAX_POST_ATTACHMENTS}개.
        </p>
      )}

      <input
        ref={inputRef}
        id="postAttachments"
        name="attachments"
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

interface AttachmentRowProps {
  name: string;
  size: number;
  onRemove: () => void;
}

function AttachmentRow({ name, size, onRemove }: AttachmentRowProps) {
  return (
    <li className="flex items-center gap-2.5 px-3 py-2 text-sm">
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatFileSize(size)}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`${name} 제거`}
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}
