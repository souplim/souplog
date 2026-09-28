'use client';

import { useEffect } from 'react';
import { Button } from '~/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] text-center sm:px-6">
      <p className="text-muted-foreground">문제가 발생했습니다.</p>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
