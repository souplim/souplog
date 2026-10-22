'use client';

import { startTransition, useActionState, type FormEvent } from 'react';
import type { ProfileFormState } from '~/lib/actions/profile';
import {
  MAX_FACT_VALUE_LENGTH,
  MAX_LINK_URL_LENGTH,
  MAX_PAIR_LABEL_LENGTH,
  MAX_PROFILE_FACTS,
  MAX_PROFILE_LINKS,
  copyTextOf,
} from '~/lib/profile-fields';
import type { Profile } from '~/lib/supabase/types';
import { PairListField } from './PairListField';
import { AvatarPicker } from './AvatarPicker';
import { FormActions } from '~/components/form/FormActions';
import { Alert, AlertDescription } from '~/components/ui/alert';
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

      <PairListField
        legend="이런 사람입니다"
        description="하는 일, 사는 곳, 요즘 관심사처럼 짧은 항목으로 소개해요."
        initialRows={(profile?.facts ?? []).map(({ label, value }) => ({ first: label, second: value }))}
        first={{ name: 'factLabel', label: '항목 이름', placeholder: '하는 일', maxLength: MAX_PAIR_LABEL_LENGTH }}
        second={{
          name: 'factValue',
          label: '항목 내용',
          placeholder: '데이터를 읽고 글을 씁니다',
          maxLength: MAX_FACT_VALUE_LENGTH,
        }}
        maxRows={MAX_PROFILE_FACTS}
        itemName="항목"
      />

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

      <PairListField
        legend="연락처"
        description="이메일 주소나 https:// 로 시작하는 주소를 적어요. 방문자는 버튼을 눌러 주소를 복사해요."
        // Emails are stored as mailto: links; the owner sees and edits the plain address.
        initialRows={(profile?.links ?? []).map(({ label, url }) => ({ first: label, second: copyTextOf(url) }))}
        first={{ name: 'linkLabel', label: '링크 이름', placeholder: '이메일', maxLength: MAX_PAIR_LABEL_LENGTH }}
        second={{
          name: 'linkUrl',
          label: '링크 주소',
          placeholder: 'me@example.com',
          maxLength: MAX_LINK_URL_LENGTH,
        }}
        maxRows={MAX_PROFILE_LINKS}
        itemName="링크"
      />

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <FormActions cancelHref="/about" pending={pending} className="border-t border-border pt-5" />
    </form>
  );
}
