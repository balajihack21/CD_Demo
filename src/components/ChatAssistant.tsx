import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AssistantDepth } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Code2,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ChatAssistantProps {
  depth: AssistantDepth;
  activeCodeContext?: string;
  onNavigateToPipeline?: (code: string) => void;
}

const QUICK_CHIPS = [
  { label: '🌱 How code compiles', prompt: 'How does code get compiled? Explain the journey from text to machine code simply.' },
  { label: '🔍 What is a Lexer?', prompt: 'What is Lexical Analysis (Scanner) and how does it turn characters into tokens?' },
  { label: '🌳 Explain ASTs', prompt: 'What is an Abstract Syntax Tree (AST) and how does a parser build it?' },
  { label: '⚡ What is SSA form?', prompt: 'What is Static Single Assignment (SSA) form in LLVM and why does it make optimization easy?' },
  { label: '🏎️ JIT vs AOT', prompt: 'What is the difference between JIT (Just-In-Time) and AOT (Ahead-Of-Time) compilers?' },
  { label: '⚙️ Register Allocation', prompt: 'Explain register allocation and how compilers map infinite variables to few CPU registers.' },
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  depth,
  activeCodeContext = '',
  onNavigateToPipeline,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('compiler_assistant_chat');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Hi! I'm your Compiler Explanation Assistant.**

I make compilers, interpreters, and code execution easy to understand!

Tap any question below or ask me anything:
- *"How does my code turn into machine instructions?"*
- *"What is the difference between an AST and a Parse Tree?"*
- *"Why did GCC/Clang give me a weird error?"*`,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('compiler_assistant_chat', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || isLoading) return;

    let finalPrompt = promptToSend;
    if (showCodeBox && customCode.trim()) {
      finalPrompt += `\n\nHere is my code snippet:\n\`\`\`\n${customCode.trim()}\n\`\`\``;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setShowCodeBox(false);
    setIsLoading(true);

    const assistantMessageId = `asst-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, initialAssistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          depth,
          contextCode: activeCodeContext,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                streamedContent += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: streamedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  `### 💡 Compiler Explanation\n\nCompilers transform high-level language into machine code via:\n1. **Lexical Analysis (Scanner)**: Text $\\to$ Tokens\n2. **Syntax Analysis (Parser)**: Tokens $\\to$ AST\n3. **Semantic Analysis**: Type safety & Symbol table\n4. **Optimization**: Constant folding & Dead code elimination\n5. **Code Generation**: Emits target CPU assembly.`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    const resetMessages: ChatMessage[] = [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat cleared! Ask me anything about how compilers work or tap a quick topic below.`,
        timestamp: Date.now(),
      },
    ];
    setMessages(resetMessages);
    localStorage.setItem('compiler_assistant_chat', JSON.stringify(resetMessages));
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-4.5rem)] max-w-4xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3">
      {/* Top Mini Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/70 rounded-xl border border-slate-800/80 mb-2 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] sm:text-xs">
            Level: <strong className="text-indigo-300 capitalize">{depth}</strong>
          </span>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-0.5 rounded text-[11px]"
          title="Clear chat"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap font-sans">{message.content}</p>
                ) : (
                  <div>
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="flex items-center space-x-2 text-slate-400 py-1 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-300"></div>
                        <span className="ml-1 text-[11px]">Explaining compiler concept...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Copy footer */}
                {!isUser && message.content && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-end text-[10px] text-slate-500">
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="flex items-center space-x-1 hover:text-slate-300 transition-colors p-1 rounded cursor-pointer"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips (Touch-friendly horizontal scroll on mobile) */}
      <div className="mt-2 py-1 overflow-x-auto scrollbar-none flex items-center space-x-1.5 shrink-0">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0 active:scale-95"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Code Attachment Box (Optional expandable) */}
      {showCodeBox && (
        <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
            <span>Paste code to attach to your question:</span>
            <button
              onClick={() => setShowCodeBox(false)}
              className="text-slate-400 hover:text-rose-400 text-[11px]"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            rows={3}
            placeholder="e.g. int x = 5 + 3;"
            className="w-full bg-slate-950 p-2 text-xs font-mono text-slate-200 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Input Box Area */}
      <div className="mt-1.5 relative rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-indigo-500 shadow-xl">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a question about compilers (e.g. 'How does an AST work?')..."
          className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none min-h-[42px] max-h-32"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-800/60 bg-slate-950/40 rounded-b-2xl">
          <button
            onClick={() => setShowCodeBox(!showCodeBox)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              showCodeBox
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Attach code snippet"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Attach Code</span>
            <span className="sm:hidden">Code</span>
          </button>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              input.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
