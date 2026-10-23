import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changeBookStatusAction } from '~/lib/actions/books';
import { BookProgressControls } from './BookProgressControls';

vi.mock('~/lib/actions/books', () => ({ changeBookStatusAction: vi.fn() }));

const changeStatus = vi.mocked(changeBookStatusAction);

describe('BookProgressControls', () => {
  beforeEach(() => {
    changeStatus.mockReset().mockResolvedValue(undefined);
  });

  it('starts reading a wanted book', async () => {
    render(<BookProgressControls bookId="book-1" status="want" />);

    await userEvent.click(screen.getByRole('button', { name: '읽기 시작' }));

    expect(changeStatus).toHaveBeenCalledWith('book-1', 'reading');
  });

  it('finishes a book being read', async () => {
    render(<BookProgressControls bookId="book-1" status="reading" />);

    await userEvent.click(screen.getByRole('button', { name: '다 읽음' }));

    expect(changeStatus).toHaveBeenCalledWith('book-1', 'done');
  });

  it('shows nothing for a finished book', () => {
    const { container } = render(<BookProgressControls bookId="book-1" status="done" />);

    expect(container.childElementCount).toBe(0);
  });

  it('locks the button while the change is saving', async () => {
    let finish!: () => void;
    changeStatus.mockReturnValue(new Promise<void>((done) => (finish = done)) as never);
    render(<BookProgressControls bookId="book-1" status="want" />);

    await userEvent.click(screen.getByRole('button', { name: '읽기 시작' }));
    const button = screen.getByRole('button', { name: '기록 중…' });
    expect(button).toHaveProperty('disabled', true);

    finish();
    await screen.findByRole('button', { name: '읽기 시작' });
  });
});
