import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard:', err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 select-none">
        <span className="uppercase tracking-wider font-semibold text-neutral-300">
          {(language || 'code').toUpperCase()}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed bg-neutral-950 text-neutral-100">
        <pre className="m-0 p-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content text-sm leading-relaxed text-neutral-900 break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, children, ...props }) => (
            <h1 className="text-lg md:text-xl font-bold text-neutral-900 mt-4 mb-2 first:mt-0 tracking-tight" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-base md:text-lg font-semibold text-neutral-900 mt-4 mb-2 first:mt-0 tracking-tight" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-sm md:text-base font-semibold text-neutral-900 mt-3 mb-1.5 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-xs md:text-sm font-semibold text-neutral-900 mt-2.5 mb-1 first:mt-0 uppercase tracking-wider" {...props}>
              {children}
            </h4>
          ),
          h5: ({ node, children, ...props }) => (
            <h5 className="text-xs font-semibold text-neutral-900 mt-2 mb-1 first:mt-0 uppercase tracking-wider" {...props}>
              {children}
            </h5>
          ),
          h6: ({ node, children, ...props }) => (
            <h6 className="text-xs font-semibold text-neutral-900 mt-2 mb-1 first:mt-0 uppercase tracking-wider" {...props}>
              {children}
            </h6>
          ),

          // Paragraphs
          p: ({ node, children, ...props }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-neutral-800" {...props}>
              {children}
            </p>
          ),

          // Lists
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1 text-neutral-800" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1 text-neutral-800" {...props}>
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="leading-relaxed pl-1" {...props}>
              {children}
            </li>
          ),

          // Blockquote
          blockquote: ({ node, children, ...props }) => (
            <blockquote className="border-l-3 border-neutral-300 pl-3.5 py-1 my-2.5 bg-neutral-50/80 rounded-r-lg text-neutral-700 italic" {...props}>
              {children}
            </blockquote>
          ),

          // Divider
          hr: ({ node, ...props }) => (
            <hr className="border-neutral-200 my-3.5" {...props} />
          ),

          // Links
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium transition-colors break-words"
              {...props}
            >
              {children}
            </a>
          ),

          // Formatting
          strong: ({ node, children, ...props }) => (
            <strong className="font-semibold text-neutral-900" {...props}>
              {children}
            </strong>
          ),
          em: ({ node, children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          del: ({ node, children, ...props }) => (
            <del className="line-through text-neutral-500" {...props}>
              {children}
            </del>
          ),

          // Fenced Code Blocks
          pre: ({ node, children }) => {
            const codeElement = Array.isArray(children) ? children[0] : children;
            if (React.isValidElement(codeElement)) {
              const codeProps = codeElement.props as { className?: string; children?: React.ReactNode };
              const rawClass = codeProps.className || '';
              const match = /language-([a-zA-Z0-9_-]+)/.exec(rawClass);
              const language = match ? match[1] : '';
              const rawCode = String(codeProps.children || '').replace(/\n$/, '');
              return <CodeBlock language={language} code={rawCode} />;
            }
            return (
              <pre className="my-3 p-3.5 rounded-xl bg-neutral-950 text-neutral-100 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed border border-neutral-800">
                {children}
              </pre>
            );
          },

          // Inline Code
          code: ({ node, children, ...props }) => {
            return (
              <code
                className="px-1.5 py-0.5 mx-0.5 rounded-md text-[13px] font-mono bg-neutral-100 text-neutral-850 border border-neutral-200/80 font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Tables
          table: ({ node, children, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200 text-xs text-left" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ node, children, ...props }) => (
            <thead className="bg-neutral-50 text-neutral-700 font-semibold" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ node, children, ...props }) => (
            <tbody className="divide-y divide-neutral-200 bg-white" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ node, children, ...props }) => (
            <tr className="hover:bg-neutral-50/50 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ node, children, ...props }) => (
            <th className="px-3.5 py-2 text-xs font-semibold text-neutral-900 border-r border-neutral-200 last:border-r-0" {...props}>
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td className="px-3.5 py-2 text-xs text-neutral-700 border-r border-neutral-200 last:border-r-0" {...props}>
              {children}
            </td>
          ),

          // Checkboxes (task lists)
          input: ({ node, type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="rounded border-neutral-300 text-neutral-900 mr-1.5 align-middle"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
