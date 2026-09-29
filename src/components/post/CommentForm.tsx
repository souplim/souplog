'use client';

import { useActionState } from 'react';
import { createCommentAction } from '~/lib/actions/comments';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Alert, AlertDescription } from '~/components/ui/alert';

interface CommentFormProps {
  postId: string;
  postSlug: string;
}

export function CommentForm({ postId, postSlug }: CommentFormProps) {
  const [state, formAction, pending] = useActionState(createCommentAction.bind(null, postSlug), undefined);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <div key={state?.resetKey ?? 0} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input name="authorName" placeholder="닉네임" maxLength={40} required className="sm:w-40" />
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호 (삭제용)"
            maxLength={72}
            required
            className="sm:w-48"
          />
        </div>
        <Textarea name="content" placeholder="댓글을 남겨보세요" maxLength={2000} rows={3} required />
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? '등록 중…' : '댓글 등록'}
      </Button>
    </form>
  );
}
