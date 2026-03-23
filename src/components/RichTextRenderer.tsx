import DOMPurify from "dompurify";
import type {
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  ReactElement,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

function looksLikeHtml(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;

  // Heuristic: detect actual HTML tags like `<p>...</p>`, `<br />`, `<div ...>`.
  // This intentionally does NOT match markdown autolinks like `<http://...>`.
  const htmlTagRegex =
    /<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?>/i;
  return htmlTagRegex.test(trimmed);
}

export default function RichTextRenderer({
  content,
  className,
}: RichTextRendererProps) {
  if (!content) return null;

  if (looksLikeHtml(content)) {
    const sanitizedHtml = DOMPurify.sanitize(content);
    return (
      <div
        className={className}
        // RAWG descriptions are HTML. We sanitize before rendering.
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        skipHtml={true}
        components={{
          h1: (
            props: HTMLAttributes<HTMLHeadingElement>,
          ): ReactElement => (
            <h3 className="text-base font-semibold mt-3 mb-1" {...props} />
          ),
          h2: (
            props: HTMLAttributes<HTMLHeadingElement>,
          ): ReactElement => (
            <h3 className="text-base font-semibold mt-3 mb-1" {...props} />
          ),
          h3: (
            props: HTMLAttributes<HTMLHeadingElement>,
          ): ReactElement => (
            <h3 className="text-base font-semibold mt-3 mb-1" {...props} />
          ),
          h4: (
            props: HTMLAttributes<HTMLHeadingElement>,
          ): ReactElement => (
            <h3 className="text-base font-semibold mt-3 mb-1" {...props} />
          ),
          p: (props: HTMLAttributes<HTMLParagraphElement>): ReactElement => (
            <p className="mb-2 last:mb-0" {...props} />
          ),
          ul: (props: HTMLAttributes<HTMLUListElement>): ReactElement => (
            <ul className="list-disc pl-5 space-y-1 mb-2" {...props} />
          ),
          ol: (props: OlHTMLAttributes<HTMLOListElement>): ReactElement => (
            <ol className="list-decimal pl-5 space-y-1 mb-2" {...props} />
          ),
          li: (props: LiHTMLAttributes<HTMLLIElement>): ReactElement => (
            <li className="mb-0" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

