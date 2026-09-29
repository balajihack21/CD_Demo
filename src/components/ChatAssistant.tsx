import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AssistantDepth } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SUGGESTED_PROMPTS } from '../utils/presets';
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
  CornerDownLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface ChatAssistantProps {
  depth: AssistantDepth;
  activeCodeContext?: string;
  onNavigateToPipeline?: (code: string) => void;
}

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
        content: `👋 **Welcome to the Compiler Explanation Assistant!**

I'm your dedicated interactive guide to the inner workings of compilers, interpreters, and runtime engines.

Here are things we can explore together:
- **Pipeline Deep Dives**: How source code moves from characters → tokens (Lexing) → AST (Parsing) → Symbol Table (Semantics) → IR / SSA → Machine Assembly.
- **Parsing & Grammars**: CFGs, LL(1) vs LR(1)/LALR, shift-reduce conflicts, operator precedence climbing.
- **Optimizations**: Constant folding, Dead Code Elimination, Loop Invariant Code Motion, SSA phi-nodes.
- **Error Diagnostics**: Deciphering cryptic GCC, Clang, rustc, and linker error logs.

Pick one of the quick prompts below or type any compiler question to get started!`,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContextCode, setIncludeContextCode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('compiler_assistant_chat', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
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
          contextCode: includeContextCode ? activeCodeContext : '',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Network error generating response');
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
              } else if (parsed.error) {
                streamedContent += `\n\n*(Error: ${parsed.error})*`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: streamedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore non-json chunks
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  msg.content +
                  `\n\n⚠️ **Connection notice**: Failed to stream response. Please verify server connectivity or try again. (${err.message})`,
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
    if (window.confirm('Clear all conversation messages?')) {
      const resetMessages: ChatMessage[] = [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Chat cleared. How can I assist your compiler exploration today?',
          timestamp: Date.now(),
        },
      ];
      setMessages(resetMessages);
      localStorage.setItem('compiler_assistant_chat', JSON.stringify(resetMessages));
    }
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4 py-4">
      {/* Top Bar inside Chat */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/80 mb-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">Active Mode:</span>
          <span className="capitalize px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
            {depth} Level
          </span>
          {activeCodeContext && (
            <label className="flex items-center space-x-1.5 ml-3 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={includeContextCode}
                onChange={(e) => setIncludeContextCode(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="text-[11px]">Attach workspace code snippet</span>
            </label>
          )}
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-slate-800"
          title="Clear conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 sm:gap-4 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 relative group ${
                  isUser
                    ? 'bg-indigo-600/90 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                    : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-sans">
                    {message.content}
                  </p>
                ) : (
                  <div>
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="flex items-center space-x-2 text-slate-400 py-1 text-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-300"></div>
                        <span className="text-xs text-slate-400 ml-1">Analyzing compilation concepts...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer bar on assistant message */}
                {!isUser && message.content && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="flex items-center space-x-1 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Suggested Prompts if chat has <= 2 messages */}
        {messages.length <= 2 && (
          <div className="pt-4 border-t border-slate-800/60 mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Suggested Compiler Questions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.slice(0, 6).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs sm:text-sm p-3 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="mt-3 pt-2">
        <div className="relative rounded-2xl bg-slate-900 border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-xl">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask anything about compilers (e.g. 'How does a lexer work?', 'Explain SSA in LLVM', 'Trace int x = 5 + 2')..."
            className="w-full bg-transparent px-4 py-3 text-sm sm:text-base text-slate-200 placeholder-slate-500 resize-none focus:outline-none"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60 bg-slate-950/40 rounded-b-2xl">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="hidden sm:inline">Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                Enter
              </kbd>
              <span className="hidden sm:inline">to send,</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                Shift + Enter
              </kbd>
              <span className="hidden sm:inline">for newline</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  input.trim() && !isLoading
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
