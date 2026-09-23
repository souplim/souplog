'use client';

import { useActionState, useState } from 'react';
import { deleteMenuAction, moveMenuAction, updateMenuAction } from '~/lib/actions/menus';
import type { Menu } from '~/lib/supabase/types';
import styles from './MenuManager.module.css';

interface MenuRowProps {
  menu: Menu;
  isFirst: boolean;
  isLast: boolean;
}

export function MenuRow({ menu, isFirst, isLast }: MenuRowProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateMenuAction.bind(null, menu.id), undefined);

  return (
    <div className={styles.row}>
      <div className={styles.order}>
        <button
          type="button"
          className={styles.orderButton}
          disabled={isFirst}
          onClick={() => moveMenuAction(menu.id, 'up')}
          aria-label={`${menu.name} 위로 이동`}
        >
          ▲
        </button>
        <button
          type="button"
          className={styles.orderButton}
          disabled={isLast}
          onClick={() => moveMenuAction(menu.id, 'down')}
          aria-label={`${menu.name} 아래로 이동`}
        >
          ▼
        </button>
      </div>

      {editing ? (
        <form
          action={async (formData) => {
            await formAction(formData);
            setEditing(false);
          }}
          className={styles.editForm}
        >
          <input className={styles.input} name="name" defaultValue={menu.name} required maxLength={50} />
          <input className={styles.input} name="slug" defaultValue={menu.slug} maxLength={50} />
          <button type="submit" className={styles.submit} disabled={pending}>
            저장
          </button>
          {state?.error && <span className={styles.error}>{state.error}</span>}
        </form>
      ) : (
        <div>
          <span className={styles.name}>{menu.name}</span>
          <span className={styles.slug}>/{menu.slug}</span>
        </div>
      )}

      <div className={styles.rowActions}>
        <button type="button" className={styles.actionButton} onClick={() => setEditing((value) => !value)}>
          {editing ? '취소' : '수정'}
        </button>
        <form
          action={deleteMenuAction.bind(null, menu.id)}
          onSubmit={(event) => {
            if (!window.confirm(`"${menu.name}" 메뉴를 삭제할까요? 이 메뉴의 글은 미분류로 남습니다.`)) {
              event.preventDefault();
            }
          }}
        >
          <button type="submit" className={styles.actionButton}>
            삭제
          </button>
        </form>
      </div>
    </div>
  );
}
