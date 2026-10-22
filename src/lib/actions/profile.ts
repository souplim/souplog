'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '~/lib/auth';
import { uploadPostImage } from '~/lib/image-upload';
import { parsePostImageJson, type PostImage } from '~/lib/images';
import { saveProfile } from '~/lib/profile';
import { collectPairs } from '~/lib/profile-fields';
import { profileSchema } from '~/lib/validation';

export interface ProfileFormState {
  error?: string;
}

/**
 * A newly picked photo wins; otherwise whatever the form says it kept — an
 * empty `keptAvatar` means the owner removed the photo.
 */
async function resolveAvatar(formData: FormData): Promise<PostImage | null> {
  const file = formData.get('avatar');
  if (file instanceof File && file.size > 0) return uploadPostImage(file);
  return parsePostImageJson(formData.get('keptAvatar'));
}

export async function updateProfileAction(
  _prevState: ProfileFormState | undefined,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireUser();

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    tagline: formData.get('tagline'),
    content: formData.get('content'),
    facts: collectPairs(formData.getAll('factLabel'), formData.getAll('factValue')).map(([label, value]) => ({
      label,
      value,
    })),
    links: collectPairs(formData.getAll('linkLabel'), formData.getAll('linkUrl')).map(([label, url]) => ({
      label,
      url,
    })),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  let avatar: PostImage | null;
  try {
    avatar = await resolveAvatar(formData);
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : '사진을 처리하지 못했습니다.' };
  }

  try {
    await saveProfile({ ...parsed.data, avatar });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : '소개를 저장하지 못했습니다.' };
  }

  revalidatePath('/about');
  redirect('/about');
}
