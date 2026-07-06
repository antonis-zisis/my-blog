import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmModal from '@/components/ConfirmModal';

function renderModal(confirmLabel?: string) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = render(
    <ConfirmModal
      title="Delete post"
      message="This cannot be undone."
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  return { onConfirm, onCancel, view };
}

describe('ConfirmModal', () => {
  it('fires onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('fires onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('fires onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('removes the keydown listener on unmount', async () => {
    const user = userEvent.setup();
    const { onCancel, view } = renderModal();

    view.unmount();
    await user.keyboard('{Escape}');

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('fires onCancel when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel, view } = renderModal();
    const backdrop = view.container.firstElementChild as HTMLElement;

    await user.click(backdrop);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not fire onCancel when clicking inside the dialog', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.click(screen.getByText('This cannot be undone.'));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('defaults the confirm label to "Delete"', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders a custom confirm label', () => {
    renderModal('Unpublish');

    expect(
      screen.getByRole('button', { name: 'Unpublish' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });
});
