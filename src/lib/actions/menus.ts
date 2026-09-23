'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '~/lib/auth';
import { createMenu, deleteMenu, getMenus, menuSlugExists, reorderMenus, updateMenu } from '~/lib/menus';
import { moveItem } from '~/lib/sortOrder';
import { ensureUniqueSlug, slugify } from '~/lib/slugify';
import { menuSchema } from '~/lib/validation';

export interface MenuFormState {
  error?: string;
}

export async function createMenuAction(
  _prevState: MenuFormState | undefined,
  formData: FormData,
): Promise<MenuFormState> {
  await requireUser();

  const parsed = menuSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  const baseSlug = parsed.data.slug.length > 0 ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const slug = await ensureUniqueSlug(baseSlug, (candidate) => menuSlugExists(candidate));
  const existing = await getMenus();

  await createMenu({ name: parsed.data.name, slug }, existing.length);

  revalidatePath('/admin/menus');
  revalidatePath('/');
  return {};
}

export async function updateMenuAction(
  menuId: string,
  _prevState: MenuFormState | undefined,
  formData: FormData,
): Promise<MenuFormState> {
  await requireUser();

  const parsed = menuSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  const baseSlug = parsed.data.slug.length > 0 ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const slug = await ensureUniqueSlug(baseSlug, (candidate) => menuSlugExists(candidate, menuId));

  await updateMenu(menuId, { name: parsed.data.name, slug });

  revalidatePath('/admin/menus');
  revalidatePath('/');
  return {};
}

export async function deleteMenuAction(menuId: string): Promise<void> {
  await requireUser();
  await deleteMenu(menuId);
  revalidatePath('/admin/menus');
  revalidatePath('/');
}

export async function moveMenuAction(menuId: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser();

  const menus = await getMenus();
  const fromIndex = menus.findIndex((menu) => menu.id === menuId);
  if (fromIndex === -1) return;

  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  const reordered = moveItem(menus, fromIndex, toIndex);

  await reorderMenus(reordered.map((menu) => menu.id));
  revalidatePath('/admin/menus');
  revalidatePath('/');
}
