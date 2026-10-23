import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VisibilitySwitch } from './VisibilitySwitch';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('VisibilitySwitch', () => {
  it('asks to hide a shown row', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    render(<VisibilitySwitch id="row-1" checked onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch', { name: '표시' }));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('asks to show a hidden row', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    render(<VisibilitySwitch id="row-1" checked={false} onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch', { name: '표시' }));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('stays disabled until the save settles', async () => {
    const save = deferred();
    const onChange = vi.fn().mockReturnValue(save.promise);
    render(<VisibilitySwitch id="row-1" checked onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: '표시' });

    await userEvent.click(toggle);
    expect(toggle).toHaveProperty('disabled', true);

    save.resolve();
    await vi.waitFor(() => expect(toggle).toHaveProperty('disabled', false));
  });
});
