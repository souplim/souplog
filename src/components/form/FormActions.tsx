import Link from 'next/link';
import { cn } from 'cn';
import { Button } from '~/components/ui/button';

interface FormActionsProps {
  cancelHref: string;
  pending: boolean;
  submitLabel?: string;
  className?: string;
}

/** Cancel back to where the form came from, save on the right — the same pair under every editor. */
export function FormActions({ cancelHref, pending, submitLabel = '저장', className }: FormActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      <Button asChild variant="ghost">
        <Link href={cancelHref}>취소</Link>
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? '저장 중…' : submitLabel}
      </Button>
    </div>
  );
}
