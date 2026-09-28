import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

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
    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-img:rounded-lg prose-img:ring-1 prose-img:ring-foreground/10">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </Markdown>
    </div>
  );
}
