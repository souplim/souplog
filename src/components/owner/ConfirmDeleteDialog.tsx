'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { DeleteIconButton } from './OwnerActions';

interface ConfirmDeleteDialogProps {
  title: ReactNode;
  description: ReactNode;
  /** Runs the delete. The dialog stays open, locked, until it settles. */
  onConfirm: () => Promise<unknown>;
  triggerSize?: 'icon-xs' | 'icon-sm';
  triggerLabel?: string;
}

/**
 * The trash icon and the "are you sure?" dialog behind it. While the delete
 * runs, both buttons lock and the dialog can't be dismissed, so a slow
 * request can't be left half-confirmed.
 */
export function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  triggerSize,
  triggerLabel,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <DeleteIconButton size={triggerSize} aria-label={triggerLabel} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={pending} onClick={handleConfirm}>
            {pending ? '삭제 중…' : '삭제'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
