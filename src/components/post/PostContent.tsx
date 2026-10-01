import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface PostContentProps {
  content: string;
}

/**
 * react-markdown never renders raw HTML from the source unless `rehype-raw`
 * is added — intentionally left out, so even if a draft ever contained a
 * pasted `<script>`, it renders as literal text rather than executing.
 *
 * `remark-breaks` turns a single newline into a `<br>`: CommonMark would fold
 * it into a space, which reads as a lost line break to anyone not writing
 * Markdown deliberately.
 */
export function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose max-w-none prose-headings:font-heading prose-img:rounded-lg prose-img:ring-1 prose-img:ring-border">
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </Markdown>
    </div>
  );
}
