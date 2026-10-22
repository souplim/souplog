'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyTextOf, type ProfileLink } from '~/lib/profile-fields';
import { Button } from '~/components/ui/button';

/** How long a button says "복사했어요" before going back to its label. */
const COPIED_FEEDBACK_MS = 2000;

type CopyStatus = 'idle' | 'copied' | 'failed';

/** The owner's contact links as buttons that copy the address rather than open it. */
export function ProfileLinks({ links }: { links: readonly ProfileLink[] }) {
  return (
    <ul aria-label="연락처" className="flex flex-wrap gap-[var(--space-2xs)]">
      {links.map((link, index) => (
        <li key={`${index}-${link.url}`}>
          <CopyLinkButton link={link} />
        </li>
      ))}
    </ul>
  );
}

function CopyLinkButton({ link }: { link: ProfileLink }) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const text = copyTextOf(link.url);

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      // Clipboard access is refused on insecure origins or by browser settings.
      setStatus('failed');
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      title={text}
      aria-label={`${link.label} 복사: ${text}`}
    >
      {status === 'copied' ? <Check className="text-accent-foreground" /> : <Copy />}
      <span aria-live="polite">
        {status === 'copied' ? '복사했어요' : status === 'failed' ? '복사하지 못했어요' : link.label}
      </span>
    </Button>
  );
}
