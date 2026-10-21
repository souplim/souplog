'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import Link from 'next/link';
import type { ProfileFormState } from '~/lib/actions/profile';
import type { Profile } from '~/lib/supabase/types';
import { AvatarPicker } from './AvatarPicker';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

interface AboutFormProps {
  profile: Profile | null;
  action: (prevState: ProfileFormState | undefined, formData: FormData) => Promise<ProfileFormState>;
}

export function AboutForm({ profile, action }: AboutFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    // Dispatched from onSubmit for the same reason as PostForm: a form-level
    // `action` resets the form after a failed save, losing the picked photo.
    <form onSubmit={handleSubmit} className="space-y-8">
      <AvatarPicker initialAvatar={profile?.avatar ?? null} />

      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" name="name" defaultValue={profile?.name} required maxLength={50} placeholder="souplog 주인" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">짤막한 소개</Label>
        <Input
          id="tagline"
          name="tagline"
          defaultValue={profile?.tagline}
          maxLength={160}
          placeholder="이름 아래에 한 줄로 보여요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">하고 싶은 말</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={profile?.content}
          maxLength={20_000}
          placeholder="자유롭게 적어보세요. 마크다운을 쓸 수 있어요."
          className="min-h-64 font-mono text-sm leading-[var(--leading-relaxed)] md:text-sm"
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
        <Button asChild variant="ghost">
          <Link href="/about">취소</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
