'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deletePostAction } from '~/lib/actions/posts';
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

interface DeletePostButtonProps {
  postId: string;
  /**
   * Render a labelled button sized like the editor's 저장/취소 pair. Without it
   * the trigger stays an icon square, which is what a dense post list wants.
   */
  label?: string;
}

export function DeletePostButton({ postId, label }: DeletePostButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        {label ? (
          <Button variant="destructive">
            <Trash2 />
            {label}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label="삭제"
          >
            <Trash2 />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 글을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>되돌릴 수 없습니다.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => startTransition(() => deletePostAction(postId))}
          >
            {pending ? '삭제 중…' : '삭제'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
