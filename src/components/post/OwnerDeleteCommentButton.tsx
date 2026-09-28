'use client';

import { deleteCommentAsOwnerAction } from '~/lib/actions/comments';
import { Button } from '~/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

interface OwnerDeleteCommentButtonProps {
  commentId: string;
  postSlug: string;
}

export function OwnerDeleteCommentButton({ commentId, postSlug }: OwnerDeleteCommentButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground">
          관리자 삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 댓글을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>되돌릴 수 없습니다.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <form action={deleteCommentAsOwnerAction.bind(null, postSlug, commentId)}>
            <AlertDialogAction type="submit" variant="destructive" className="w-full">
              삭제
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
