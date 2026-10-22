'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '~/lib/auth';
import {
  createMenu,
  deleteMenu,
  getMenus,
  getNavItems,
  menuSlugExists,
  reorderMenus,
  saveNavItems,
  setMenuVisibility,
  updateMenu,
} from '~/lib/menus';
import { isNavItemKey, type NavItem, type NavItemKey } from '~/lib/nav-items';
import { moveItem } from '~/lib/sortOrder';
import { ensureUniqueSlug, slugify } from '~/lib/slugify';
import { menuSchema, navItemSchema } from '~/lib/validation';

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
  revalidatePath('/posts');
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
  revalidatePath('/posts');
  return {};
}

export async function deleteMenuAction(menuId: string): Promise<void> {
  await requireUser();
  await deleteMenu(menuId);
  revalidatePath('/admin/menus');
  revalidatePath('/posts');
}

export async function setMenuVisibilityAction(menuId: string, isVisible: boolean): Promise<void> {
  await requireUser();
  await setMenuVisibility(menuId, isVisible === true);
  // The dropdown lives in the header on every page, not just the post feed.
  revalidatePath('/', 'layout');
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
  revalidatePath('/posts');
}

// The top-level nav is in the header on every page, so its changes
// revalidate the whole layout rather than just the post feed.
async function persistNavItems(items: readonly NavItem[]): Promise<void> {
  await saveNavItems(items);
  revalidatePath('/', 'layout');
}

// Server-action arguments arrive from the client, so the key is checked
// against the closed set before it reaches the database.
function assertNavItemKey(key: unknown): asserts key is NavItemKey {
  if (!isNavItemKey(key)) throw new Error('알 수 없는 상단 메뉴입니다.');
}

export async function renameNavItemAction(
  key: NavItemKey,
  _prevState: MenuFormState | undefined,
  formData: FormData,
): Promise<MenuFormState> {
  await requireUser();
  assertNavItemKey(key);

  const parsed = navItemSchema.safeParse({ label: formData.get('label') });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  const items = await getNavItems();
  await persistNavItems(items.map((item) => (item.key === key ? { ...item, label: parsed.data.label } : item)));
  return {};
}

export async function setNavItemVisibilityAction(key: NavItemKey, isVisible: boolean): Promise<void> {
  await requireUser();
  assertNavItemKey(key);

  const items = await getNavItems();
  await persistNavItems(items.map((item) => (item.key === key ? { ...item, isVisible: isVisible === true } : item)));
}

export async function moveNavItemAction(key: NavItemKey, direction: 'up' | 'down'): Promise<void> {
  await requireUser();
  assertNavItemKey(key);

  const items = await getNavItems();
  const fromIndex = items.findIndex((item) => item.key === key);
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  await persistNavItems(moveItem(items, fromIndex, toIndex));
}
