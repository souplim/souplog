import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PostFormState } from '~/lib/actions/posts';
import type { Menu, Post } from '~/lib/supabase/types';
import { PostForm } from './PostForm';

// The uploaders sync their file inputs through DataTransfer, which jsdom lacks.
vi.mock('./PostImageUploader', () => ({ PostImageUploader: () => null }));
vi.mock('./PostAttachmentUploader', () => ({ PostAttachmentUploader: () => null }));

const MENUS = [{ id: 'menu-1', name: '독서' }] as Menu[];

const POST = {
  title: '기존 글',
  content: '본문',
  menu_id: 'menu-1',
  is_public: true,
  excerpt: '',
  images: [],
  attachments: [],
  created_at: '2026-10-01T00:00:00Z',
} as unknown as Post;

function renderForm(
  action: (prev: PostFormState | undefined, formData: FormData) => Promise<PostFormState>,
  post?: Post,
) {
  return render(<PostForm menus={MENUS} post={post} action={action} submitLabel="발행" cancelHref="/admin" />);
}

function submittedFields(action: ReturnType<typeof vi.fn>) {
  const formData = action.mock.calls[0][1] as FormData;
  return {
    title: formData.get('title'),
    content: formData.get('content'),
    menuId: formData.get('menuId'),
    isPublic: formData.get('isPublic'),
  };
}

describe('PostForm', () => {
  it('submits a new post as private with no menu', async () => {
    const action = vi.fn().mockResolvedValue({});
    renderForm(action);

    await userEvent.type(screen.getByPlaceholderText('제목을 입력하세요'), '새 글');
    await userEvent.type(screen.getByPlaceholderText('당신의 이야기를 마크다운으로 적어보세요…'), '첫 문단');
    await userEvent.click(screen.getByRole('button', { name: '발행' }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(submittedFields(action)).toEqual({ title: '새 글', content: '첫 문단', menuId: '', isPublic: '' });
  });

  it('keeps the menu and visibility of an existing post', async () => {
    const action = vi.fn().mockResolvedValue({});
    renderForm(action, POST);

    await userEvent.click(screen.getByRole('button', { name: '발행' }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(submittedFields(action)).toEqual({ title: '기존 글', content: '본문', menuId: 'menu-1', isPublic: 'on' });
  });

  it('sends the visibility the switch was flipped to', async () => {
    const action = vi.fn().mockResolvedValue({});
    renderForm(action, POST);

    await userEvent.click(screen.getByRole('switch', { name: '공개' }));
    await userEvent.click(screen.getByRole('button', { name: '발행' }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(submittedFields(action).isPublic).toBe('');
  });

  it('shows the action error and keeps what was typed', async () => {
    const action = vi.fn().mockResolvedValue({ error: '글을 저장하지 못했습니다.' });
    renderForm(action, POST);

    await userEvent.click(screen.getByRole('button', { name: '발행' }));

    expect((await screen.findByRole('alert')).textContent).toBe('글을 저장하지 못했습니다.');
    expect(screen.getByPlaceholderText('제목을 입력하세요')).toHaveProperty('value', '기존 글');
  });

  it('locks the submit button while saving', async () => {
    let finish!: (state: PostFormState) => void;
    const action = vi.fn().mockReturnValue(new Promise((done) => (finish = done)));
    renderForm(action, POST);

    await userEvent.click(screen.getByRole('button', { name: '발행' }));
    const button = await screen.findByRole('button', { name: '저장 중…' });
    expect(button).toHaveProperty('disabled', true);

    finish({});
    await screen.findByRole('button', { name: '발행' });
  });
});
