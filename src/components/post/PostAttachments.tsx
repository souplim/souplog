import { Download, FileText } from 'lucide-react';
import { formatFileSize, getPostAttachmentUrl, type PostAttachment } from '~/lib/attachments';

interface PostAttachmentsProps {
  attachments: PostAttachment[];
}

/** The post's attached files as a download list under the body. */
export function PostAttachments({ attachments }: PostAttachmentsProps) {
  if (attachments.length === 0) return null;

  return (
    <section aria-labelledby="post-attachments-heading">
      <h2 id="post-attachments-heading" className="mb-2.5 text-xs font-semibold text-muted-foreground">
        첨부 파일 {attachments.length}
      </h2>
      <ul className="divide-y divide-border/60 rounded-lg ring-1 ring-border">
        {attachments.map((attachment) => (
          <li key={attachment.path}>
            <a
              href={getPostAttachmentUrl(attachment)}
              className="group flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-[var(--duration-fast)] hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate group-hover:underline">{attachment.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatFileSize(attachment.size)}
              </span>
              <Download className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
