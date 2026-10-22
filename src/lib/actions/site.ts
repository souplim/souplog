'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '~/lib/auth';
import { saveSiteTitle } from '~/lib/site';
import { siteTitleSchema } from '~/lib/validation';

export interface SiteTitleFormState {
  error?: string;
  /** Set after a save so the form can say so — the page doesn't navigate away. */
  saved?: boolean;
}

export async function updateSiteTitleAction(
  _prevState: SiteTitleFormState | undefined,
  formData: FormData,
): Promise<SiteTitleFormState> {
  await requireUser();

  const parsed = siteTitleSchema.safeParse({ title: formData.get('title') });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  try {
    await saveSiteTitle(parsed.data.title);
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : '블로그 제목을 저장하지 못했습니다.' };
  }

  // The name is in the header, footer, and tab title of every page.
  revalidatePath('/', 'layout');
  return { saved: true };
}
