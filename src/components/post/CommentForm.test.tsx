import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCommentAction } from '~/lib/actions/comments';
import { CommentForm } from './CommentForm';

vi.mock('~/lib/actions/comments', () => ({ createCommentAction: vi.fn() }));

const createComment = vi.mocked(createCommentAction);

async function fillAndSubmit() {
  await userEvent.type(screen.getByPlaceholderText('닉네임'), '수프');
  await userEvent.type(screen.getByPlaceholderText('비밀번호 (삭제용)'), 'secret12');
  await userEvent.type(screen.getByPlaceholderText('댓글을 남겨보세요'), '잘 읽었습니다');
  await userEvent.click(screen.getByRole('button', { name: '댓글 등록' }));
}

describe('CommentForm', () => {
  beforeEach(() => {
    createComment.mockReset();
  });

  it('sends the post and the typed fields to the action', async () => {
    createComment.mockResolvedValue({ resetKey: 1 });
    render(<CommentForm postId="post-1" postSlug="첫-글" />);

    await fillAndSubmit();

    await vi.waitFor(() => expect(createComment).toHaveBeenCalledOnce());
    const [slug, , formData] = createComment.mock.calls[0];
    expect(slug).toBe('첫-글');
    expect(Object.fromEntries(formData as FormData)).toEqual({
      postId: 'post-1',
      authorName: '수프',
      password: 'secret12',
      content: '잘 읽었습니다',
    });
  });

  it('clears the fields after a comment is saved', async () => {
    createComment.mockResolvedValue({ resetKey: 1 });
    render(<CommentForm postId="post-1" postSlug="첫-글" />);

    await fillAndSubmit();

    await vi.waitFor(() => expect(screen.getByPlaceholderText('댓글을 남겨보세요')).toHaveProperty('value', ''));
    expect(screen.getByPlaceholderText('닉네임')).toHaveProperty('value', '');
  });

  it('shows the action error', async () => {
    createComment.mockResolvedValue({ error: '잠시 후 다시 시도해 주세요.' });
    render(<CommentForm postId="post-1" postSlug="첫-글" />);

    await fillAndSubmit();

    expect((await screen.findByRole('alert')).textContent).toBe('잠시 후 다시 시도해 주세요.');
  });

  it('locks the button while the comment is saving', async () => {
    let finish!: (state: { resetKey: number }) => void;
    createComment.mockReturnValue(new Promise((done) => (finish = done)));
    render(<CommentForm postId="post-1" postSlug="첫-글" />);

    await fillAndSubmit();
    const button = await screen.findByRole('button', { name: '등록 중…' });
    expect(button).toHaveProperty('disabled', true);

    finish({ resetKey: 1 });
    await screen.findByRole('button', { name: '댓글 등록' });
  });
});
