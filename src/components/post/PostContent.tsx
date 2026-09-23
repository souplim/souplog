import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import styles from './PostContent.module.css';

interface PostContentProps {
  content: string;
}

/**
 * react-markdown never renders raw HTML from the source unless `rehype-raw`
 * is added — intentionally left out, so even if a draft ever contained a
 * pasted `<script>`, it renders as literal text rather than executing.
 */
export function PostContent({ content }: PostContentProps) {
  return (
    <div className={styles.content}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </Markdown>
    </div>
  );
}
