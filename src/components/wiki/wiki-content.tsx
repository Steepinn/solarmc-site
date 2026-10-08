import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { slugifyHeading, uniqueHeadingId } from "@/lib/wiki";
import { cn } from "@/lib/utils";

function childrenToText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(childrenToText).join("");
  }
  if (typeof children === "object" && "props" in children) {
    return childrenToText(
      (children as { props?: { children?: ReactNode } }).props?.children,
    );
  }
  return "";
}

export function WikiContent({ content }: { content: string }) {
  const body = content.replace(/^#\s+.+\n+/, "");
  const seenIds = new Map<string, number>();
  const headingId = (children: ReactNode) =>
    uniqueHeadingId(slugifyHeading(childrenToText(children)), seenIds);

  return (
    <article className="wiki-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ children }) => {
            const id = headingId(children);
            return (
              <h2 id={id} className="wiki-h2">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = headingId(children);
            return (
              <h3 id={id} className="wiki-h3">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const id = headingId(children);
            return (
              <h4 id={id} className="wiki-h4">
                {children}
              </h4>
            );
          },
          p: ({ className, children }) => (
            <p className={cn("wiki-p", className)}>{children}</p>
          ),
          li: ({ children }) => <li className="wiki-li">{children}</li>,
          hr: () => <hr className="wiki-hr" />,
          strong: ({ children }) => <strong className="wiki-strong">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} className="wiki-link">
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            if (!src) return null;
            return (
              <span className="wiki-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt ?? ""} loading="lazy" />
              </span>
            );
          },
          div: ({ className, children, ...props }) => (
            <div className={cn(className)} {...props}>
              {children}
            </div>
          ),
          span: ({ className, children, ...props }) => (
            <span className={className} {...props}>
              {children}
            </span>
          ),
          mark: ({ className, children, ...props }) => (
            <mark
              className={cn(
                "wiki-mark",
                className?.includes("wiki-mark--danger") && "wiki-mark--danger",
                className?.includes("wiki-mark--success") && "wiki-mark--success",
                className?.includes("wiki-mark--warning") && "wiki-mark--warning",
                className?.includes("wiki-mark--primary") && "wiki-mark--primary",
                className?.includes("wiki-mark--note") && "wiki-mark--note",
                className?.includes("wiki-mark--info") && "wiki-mark--info",
              )}
              {...props}
            >
              {children}
            </mark>
          ),
          sup: ({ children }) => <sup className="wiki-sup">{children}</sup>,
          table: ({ children }) => (
            <div className="wiki-table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
