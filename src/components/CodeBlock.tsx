import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  showLineNumbers = true,
  maxHeight = 'max-h-96',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 font-mono text-xs sm:text-sm shadow-md my-2.5">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="font-medium text-slate-300 uppercase tracking-wider ml-1.5 text-[10px] sm:text-[11px]">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className={`overflow-x-auto p-3 sm:p-4 ${maxHeight} text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700`}>
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="pr-3 sm:pr-4 py-0.5 text-right text-slate-600 select-none text-[11px] sm:text-xs w-6 sm:w-8 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-0.5 pl-1.5 sm:pl-2 whitespace-pre text-slate-200 text-xs sm:text-sm">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre text-xs sm:text-sm">{code}</pre>
        )}
      </div>
    </div>
  );
};
