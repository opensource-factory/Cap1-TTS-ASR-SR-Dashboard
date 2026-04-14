"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownText = ({ content, className = "" }) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-5 mb-3 text-xl font-semibold tracking-tight first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-5 mb-3 text-lg font-semibold tracking-tight first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 mb-2 text-base font-semibold tracking-tight first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc pl-6 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal pl-6 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-3 border-foreground/20 pl-4 italic text-foreground/75">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-700 underline underline-offset-4 transition-colors hover:text-sky-800"
          >
            {children}
          </a>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="rounded-md bg-foreground/[0.07] px-1.5 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          ) : (
            <code className="block overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-100">
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-foreground/10">{children}</thead>,
        th: ({ children }) => (
          <th className="px-3 py-2 font-semibold text-foreground/80">{children}</th>
        ),
        td: ({ children }) => <td className="border-t border-foreground/8 px-3 py-2">{children}</td>,
      }}
    >
      {content || ""}
    </ReactMarkdown>
  </div>
);
