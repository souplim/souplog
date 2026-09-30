'use client';

import { PostContent } from '~/components/post/PostContent';
import { cn } from '~/lib/utils';
import { EDITOR_PANE_PADDING } from './postEditorStyles';

interface PostPreviewPaneProps {
  content: string;
  className?: string;
}

/**
 * Renders the draft body the way the published post will read. The title is
 * left out: it is plain text in the editor, so a preview of it adds nothing.
 */
export function PostPreviewPane({ content, className }: PostPreviewPaneProps) {
  return (
    <aside
      aria-label="미리보기"
      className={cn(
        'min-h-0 overflow-y-auto bg-muted/50 md:border-l md:border-border',
        EDITOR_PANE_PADDING,
        className,
      )}
    >
      <PostContent content={content} />
    </aside>
  );
}
