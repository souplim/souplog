import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

/**
 * True only after hydration. Uses `useSyncExternalStore` rather than a
 * `useEffect` + `setState` pair — the latter is flagged by the
 * `react-hooks/set-state-in-effect` rule and causes an extra render pass.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
