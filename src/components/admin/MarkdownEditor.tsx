'use client';

import { useState } from 'react';
import { PostContent } from '~/components/post/PostContent';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  name: string;
  defaultValue: string;
}

export function MarkdownEditor({ name, defaultValue }: MarkdownEditorProps) {
  const [content, setContent] = useState(defaultValue);

  return (
    <div className={styles.wrap}>
      <div className={styles.pane}>
        <label className={styles.label} htmlFor={name}>
          본문 (마크다운)
        </label>
        <textarea
          id={name}
          name={name}
          className={styles.textarea}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>
      <div className={styles.pane}>
        <span className={styles.label}>미리보기</span>
        <div className={styles.preview}>
          <PostContent content={content} />
        </div>
      </div>
    </div>
  );
}
