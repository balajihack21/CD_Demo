import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-slate-200 text-sm md:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
          const lang = match ? match[1] || 'text' : 'text';
          const code = match ? match[2] : part.slice(3, -3);
          return <CodeBlock key={index} code={code} language={lang} />;
        }

        // Render standard markdown text blocks
        return <TextSection key={index} text={part} />;
      })}
    </div>
  );
};

const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split('\n\n');

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={pIdx} className="text-base md:text-lg font-bold text-indigo-300 mt-4 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={pIdx} className="text-lg md:text-xl font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-800">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={pIdx} className="text-xl md:text-2xl font-extrabold text-white mt-6 mb-3">
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={pIdx} className="border-l-4 border-indigo-500/80 bg-indigo-950/20 pl-4 py-2 my-2 rounded-r-lg text-slate-300 italic">
              {renderInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Lists
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 my-2 pl-4 list-disc list-outside text-slate-300 marker:text-indigo-400">
              {lines.map((l, lIdx) => (
                <li key={lIdx}>{renderInline(l.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={pIdx} className="space-y-1.5 my-2 pl-4 list-decimal list-outside text-slate-300 marker:text-indigo-400 marker:font-semibold">
              {lines.map((l, lIdx) => (
                <li key={lIdx}>{renderInline(l.replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }

        // Regular paragraph with potential single newlines inside
        return (
          <p key={pIdx} className="text-slate-300 leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};

// Process inline code, bold, italic
function renderInline(str: string): React.ReactNode[] {
  // Regex to split inline code `code`, bold **bold**, italic *italic*
  const tokens = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs md:text-sm border border-slate-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}
