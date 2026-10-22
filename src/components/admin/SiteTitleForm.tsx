'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import { updateSiteTitleAction } from '~/lib/actions/site';
import { DEFAULT_SITE_TITLE, MAX_SITE_TITLE_LENGTH } from '~/lib/site-title';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface SiteTitleFormProps {
  title: string;
}

export function SiteTitleForm({ title }: SiteTitleFormProps) {
  const [state, formAction, pending] = useActionState(updateSiteTitleAction, undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <Label htmlFor="site-title">블로그 제목</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id="site-title"
          name="title"
          defaultValue={title}
          maxLength={MAX_SITE_TITLE_LENGTH}
          placeholder={DEFAULT_SITE_TITLE}
          className="w-60 max-w-full"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </Button>
        <p role="status" className="text-sm">
          {state?.error ? (
            <span className="text-destructive">{state.error}</span>
          ) : state?.saved && !pending ? (
            <span className="text-muted-foreground">저장했어요.</span>
          ) : null}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">비워 두면 &lsquo;{DEFAULT_SITE_TITLE}&rsquo;로 보여요.</p>
    </form>
  );
}
