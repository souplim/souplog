'use client';

import { useTransition } from 'react';
import { Switch } from '~/components/ui/switch';

interface VisibilitySwitchProps {
  id: string;
  checked: boolean;
  /** Persists the new value. The switch stays disabled until it settles. */
  onChange: (isVisible: boolean) => Promise<void>;
}

/** The "표시" toggle shared by top-level nav rows and post menu rows. */
export function VisibilitySwitch({ id, checked, onChange }: VisibilitySwitchProps) {
  const [pending, startTransition] = useTransition();

  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-muted-foreground">
      <Switch
        id={id}
        checked={checked}
        disabled={pending}
        onCheckedChange={(value) => startTransition(() => onChange(value))}
      />
      표시
    </label>
  );
}
