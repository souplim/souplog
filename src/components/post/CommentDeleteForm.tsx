'use client';

import { useActionState, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteCommentAction } from '~/lib/actions/comments';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

interface CommentDeleteFormProps {
  commentId: string;
  postSlug: string;
}

export function CommentDeleteForm({ commentId, postSlug }: CommentDeleteFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteCommentAction.bind(null, postSlug), undefined);

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="삭제"
      >
        <Trash2 />
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="commentId" value={commentId} />
      <Input
        name="password"
        type="password"
        placeholder="비밀번호"
        maxLength={72}
        required
        autoFocus
        className="h-7 w-32 text-xs"
      />
      <Button type="submit" size="sm" variant="destructive" disabled={pending} className="h-7">
        {pending ? '삭제 중…' : '확인'}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => setOpen(false)}>
        취소
      </Button>
      {state?.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}
