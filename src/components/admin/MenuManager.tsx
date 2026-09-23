'use client';

import { useActionState } from 'react';
import { createMenuAction } from '~/lib/actions/menus';
import type { Menu } from '~/lib/supabase/types';
import { MenuRow } from './MenuRow';
import styles from './MenuManager.module.css';

interface MenuManagerProps {
  menus: Menu[];
}

export function MenuManager({ menus }: MenuManagerProps) {
  const [state, formAction, pending] = useActionState(createMenuAction, undefined);

  return (
    <div>
      <form action={formAction} className={styles.createForm}>
        <input className={styles.input} name="name" placeholder="메뉴 이름" required maxLength={50} />
        <input className={styles.input} name="slug" placeholder="슬러그 (선택)" maxLength={50} />
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? '추가 중…' : '메뉴 추가'}
        </button>
        {state?.error && <span className={styles.error}>{state.error}</span>}
      </form>

      <div className={styles.list}>
        {menus.map((menu, index) => (
          <MenuRow key={menu.id} menu={menu} isFirst={index === 0} isLast={index === menus.length - 1} />
        ))}
      </div>
    </div>
  );
}
